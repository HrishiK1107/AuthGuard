import requests
import time
from typing import Dict, Any, List
import os

# ==========================
# FIXED IMPORTS (Docker-safe)
# ==========================
from api.settings import RUNTIME_SETTINGS
from storage.event_log import append_event
from detection.event_ingest import ingest_event, AuthEvent
from detection.signals import (
    failed_login_velocity,
    ip_fan_out,
    user_fan_in
)
from detection.state_store import StateStore
from detection.decision_engine import DecisionEngine
from detection.shared import rules_manager
from alerts.manager import AlertManager
from storage.block_store import load_blocks, save_blocks

GO_ENFORCER_URL = os.getenv(
    "ENFORCER_URL",
    "http://localhost:8081"
) + "/enforce"


class EventProcessor:
    """
    Central orchestration engine (v2).

    Guarantees:
    - Signal deduplication
    - Deterministic risk accumulation
    - Signal-driven campaign attribution
    - Durable BLOCK persistence
    """

    def __init__(self):
        self.state_store = StateStore()
        self.decision_engine = DecisionEngine()
        self.alert_manager = AlertManager()

    def _derive_campaign(self, entity: str, entity_type: str) -> Dict[str, str]:
        return {
            "campaign_id": f"{entity_type}::{entity}",
            "campaign_type": entity_type
        }

    def process(self, raw_event: Dict[str, Any]) -> Dict[str, Any]:
        processing_started_at = time.time()

        # =========================
        # 1. Ingest
        # =========================
        event: AuthEvent = ingest_event(raw_event)
        triggered_signals: List[Dict[str, Any]] = []

        # =========================
        # 2. Signals
        # =========================

        if rules_manager.is_enabled("failed_login_velocity"):
            r = failed_login_velocity(
                event,
                self.state_store.get_ip_failure_window(),
                threshold=rules_manager.get_threshold("failed_login_velocity")
            )
            if r.get("triggered"):
                r["campaign"] = self._derive_campaign(r["entity"], r["entity_type"])
                triggered_signals.append(r)

                if not self.state_store.is_signal_active(r["signal_id"], r["entity"]):
                    self.state_store.mark_signal_active(r["signal_id"], r["entity"])
                    self.state_store.get_risk_engine().add_signal(
                        key=r["entity"],
                        score=r["score"],
                        timestamp=event.timestamp
                    )

        if rules_manager.is_enabled("ip_fan_out"):
            r = ip_fan_out(
                event,
                self.state_store.get_ip_user_window(),
                threshold=rules_manager.get_threshold("ip_fan_out")
            )
            if r.get("triggered"):
                r["campaign"] = self._derive_campaign(r["entity"], r["entity_type"])
                triggered_signals.append(r)

                if not self.state_store.is_signal_active(r["signal_id"], r["entity"]):
                    self.state_store.mark_signal_active(r["signal_id"], r["entity"])
                    self.state_store.get_risk_engine().add_signal(
                        key=r["entity"],
                        score=r["score"],
                        timestamp=event.timestamp
                    )

        if rules_manager.is_enabled("user_fan_in") and event.username:
            r = user_fan_in(
                event,
                self.state_store.get_user_ip_window(),
                threshold=rules_manager.get_threshold("user_fan_in")
            )
            if r.get("triggered"):
                r["campaign"] = self._derive_campaign(r["entity"], r["entity_type"])
                triggered_signals.append(r)

                if not self.state_store.is_signal_active(r["signal_id"], r["entity"]):
                    self.state_store.mark_signal_active(r["signal_id"], r["entity"])
                    self.state_store.get_risk_engine().add_signal(
                        key=r["entity"],
                        score=r["score"],
                        timestamp=event.timestamp
                    )

        # =========================
        # 3. Risk Evaluation
        # =========================
        ip_risk = self.state_store.get_risk_engine().get_risk(
            event.ip_address, event.timestamp
        )
        user_risk = (
            self.state_store.get_risk_engine().get_risk(event.username, event.timestamp)
            if event.username else 0.0
        )
        effective_risk = max(ip_risk, user_risk)

        decision_made_at = time.time()

        # =========================
        # 4. Base Decision
        # =========================
        decision_obj = self.decision_engine.decide(effective_risk)
        base_decision = decision_obj["decision"]
        reason = decision_obj["reason"]

        mode = RUNTIME_SETTINGS.get("mode", "fail-open")
        entity = event.ip_address or event.username

        # =========================
        # 5. Enforcement Attempt
        # =========================
        enforcement_available = True
        enforcement_started_at = time.time()
        try:
            enforcement_response = self._enforce(entity, base_decision)
        except Exception as e:
            enforcement_available = False
            enforcement_response = {
                "allowed": True,
                "reason": f"enforcement unavailable: {e}"
            }
        enforcement_completed_at = time.time()

        # =========================
        # 6. Mode-Aware Final Decision
        # =========================
        final_decision = base_decision
        if base_decision == "BLOCK" and not enforcement_available:
            final_decision = "CHALLENGE" if mode == "fail-open" else "BLOCK"

        # =========================
        # 7. PERSIST BLOCK (v2-critical)
        # =========================
        if final_decision == "BLOCK":
            blocks = load_blocks()

            if not any(b.get("entity") == entity and b.get("active", True) for b in blocks):
                blocks.append({
                    "id": f"auto::{entity}",
                    "entity": entity,
                    "scope": "auth",
                    "decision": "HARD_BLOCK",
                    "risk": effective_risk,
                    "ttl_seconds": 300,
                    "active": True,
                    "source": "auto",
                    "created_at": event.timestamp
                })
                save_blocks(blocks)

        # =========================
        # 8. Enforcement Telemetry
        # =========================
        enforcement_telemetry = {
            "decision": final_decision,
            "blocked_at": event.timestamp if final_decision == "BLOCK" else None,
            "ttl_seconds": 300 if final_decision == "BLOCK" else 0,
            "risk_score": effective_risk,
            "signals": triggered_signals,
            "latency": {
                "decision_ms": round((decision_made_at - processing_started_at) * 1000, 2),
                "enforcement_ms": round((enforcement_completed_at - enforcement_started_at) * 1000, 2),
                "total_ms": round((enforcement_completed_at - processing_started_at) * 1000, 2),
            }
        }

        # =========================
        # 9. Persist Event
        # =========================
        append_event(
            ts=event.timestamp,
            entity=entity,
            endpoint=event.endpoint,
            outcome=event.outcome,
            decision=final_decision,
            risk=effective_risk,
            enforcement={
                **enforcement_response,
                "telemetry": enforcement_telemetry
            },
            raw_event=raw_event,
        )

        # =========================
        # 10. Alerting
        # =========================
        if final_decision == "BLOCK" or (
            final_decision == "CHALLENGE" and effective_risk >= 50
        ):
            try:
                self.alert_manager.emit(
                    event=event,
                    decision=final_decision,
                    risk=effective_risk,
                    signals=triggered_signals,
                    campaign=None
                )
            except Exception:
                pass

        # =========================
        # 11. Response
        # =========================
        return {
            "decision": final_decision,
            "risk_score": effective_risk,
            "signals_triggered": triggered_signals,
            "decision_reason": reason,
            "mode": mode,
            "enforcement_available": enforcement_available,
            "enforcement": {
                **enforcement_response,
                "telemetry": enforcement_telemetry
            }
        }

    def _enforce(self, entity: str, decision: str) -> Dict[str, Any]:
        payload = {
            "entity": entity,
            "decision": decision,
            "ttl_seconds": 300 if decision == "BLOCK" else 0
        }

        resp = requests.post(
            GO_ENFORCER_URL,
            json=payload,
            timeout=1
        )
        return resp.json()
