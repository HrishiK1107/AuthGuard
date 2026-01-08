import requests
from typing import Dict, Any, List

from backend.api.settings import RUNTIME_SETTINGS
from backend.storage.event_log import append_event
from backend.detection.event_ingest import ingest_event, AuthEvent
from backend.detection.signals import (
    failed_login_velocity,
    ip_fan_out,
    user_fan_in
)
from backend.detection.state_store import StateStore
from backend.detection.decision_engine import DecisionEngine
from backend.detection.shared import rules_manager


GO_ENFORCER_URL = "http://localhost:8081/enforce"


class EventProcessor:
    """
    Central orchestration engine.
    Adds explainable enforcement telemetry.
    """

    def __init__(self):
        self.state_store = StateStore()
        self.decision_engine = DecisionEngine()

    def process(self, raw_event: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Ingest
        event: AuthEvent = ingest_event(raw_event)
        triggered_signals: List[Dict[str, Any]] = []

        # 2. Signals
        if rules_manager.is_enabled("failed_login_velocity"):
            r = failed_login_velocity(
                event,
                self.state_store.get_ip_failure_window(),
                threshold=rules_manager.get_threshold("failed_login_velocity")
            )
            if r.get("triggered"):
                triggered_signals.append(r)
                self.state_store.get_risk_engine().add_signal(
                    key=event.ip_address,
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
                triggered_signals.append(r)
                self.state_store.get_risk_engine().add_signal(
                    key=event.ip_address,
                    score=r["score"],
                    timestamp=event.timestamp
                )

        if rules_manager.is_enabled("user_fan_in"):
            r = user_fan_in(
                event,
                self.state_store.get_user_ip_window(),
                threshold=rules_manager.get_threshold("user_fan_in")
            )
            if r.get("triggered") and event.username:
                triggered_signals.append(r)
                self.state_store.get_risk_engine().add_signal(
                    key=event.username,
                    score=r["score"],
                    timestamp=event.timestamp
                )

        # 3. Risk
        ip_risk = self.state_store.get_risk_engine().get_risk(
            event.ip_address, event.timestamp
        )
        user_risk = (
            self.state_store.get_risk_engine().get_risk(event.username, event.timestamp)
            if event.username else 0.0
        )
        effective_risk = max(ip_risk, user_risk)

        # 4. Base decision
        decision_obj = self.decision_engine.decide(effective_risk)
        base_decision = decision_obj["decision"]
        reason = decision_obj["reason"]

        mode = RUNTIME_SETTINGS.get("mode", "fail-open")
        entity = event.ip_address or event.username

        # 5. Enforcement attempt
        enforcement_available = True

        try:
            enforcement_response = self._enforce(entity, base_decision)
        except Exception as e:
            enforcement_available = False
            enforcement_response = {
                "allowed": True,
                "reason": f"enforcement unavailable: {e}"
            }

        # 6. Mode-aware final decision
        final_decision = base_decision

        if base_decision == "BLOCK" and not enforcement_available:
            final_decision = "CHALLENGE" if mode == "fail-open" else "BLOCK"

        # 7. Enforcement telemetry (NEW)
        enforcement_telemetry = {
            "decision": final_decision,
            "blocked_at": event.timestamp if final_decision == "BLOCK" else None,
            "ttl_seconds": 300 if final_decision == "BLOCK" else 0,
            "risk_score": effective_risk,
            "signals": triggered_signals
        }

        # 8. Persist
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

        # 9. Response
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
