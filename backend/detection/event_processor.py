import requests
from typing import Dict, Any, List

from backend.detection.event_ingest import ingest_event, AuthEvent
from backend.detection.signals import (
    failed_login_velocity,
    ip_fan_out,
    user_fan_in
)
from backend.detection.rules_manager import RulesManager
from backend.detection.state_store import StateStore
from backend.detection.decision_engine import DecisionEngine


class EventProcessor:
    """
    Central orchestration engine.
    One auth event in → one decision out → one enforcement action.
    """

    def __init__(self):
        self.rules_manager = RulesManager()
        self.state_store = StateStore()
        self.decision_engine = DecisionEngine()

    def process(self, raw_event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a raw authentication event and return a decision
        along with enforcement result.
        """

        # 1. Ingest & validate event
        event: AuthEvent = ingest_event(raw_event)

        triggered_signals: List[Dict[str, Any]] = []

        # 2. Run signals (only if enabled)

        if self.rules_manager.is_enabled("failed_login_velocity"):
            result = failed_login_velocity(
                event,
                self.state_store.get_ip_failure_window(),
                threshold=self.rules_manager.get_threshold("failed_login_velocity")
            )
            if result.get("triggered"):
                triggered_signals.append(result)
                self.state_store.get_risk_engine().add_signal(
                    key=event.ip_address,
                    score=result["score"],
                    timestamp=event.timestamp
                )

        if self.rules_manager.is_enabled("ip_fan_out"):
            result = ip_fan_out(
                event,
                self.state_store.get_ip_user_window(),
                threshold=self.rules_manager.get_threshold("ip_fan_out")
            )
            if result.get("triggered"):
                triggered_signals.append(result)
                self.state_store.get_risk_engine().add_signal(
                    key=event.ip_address,
                    score=result["score"],
                    timestamp=event.timestamp
                )

        if self.rules_manager.is_enabled("user_fan_in"):
            result = user_fan_in(
                event,
                self.state_store.get_user_ip_window(),
                threshold=self.rules_manager.get_threshold("user_fan_in")
            )
            if result.get("triggered") and event.username:
                triggered_signals.append(result)
                self.state_store.get_risk_engine().add_signal(
                    key=event.username,
                    score=result["score"],
                    timestamp=event.timestamp
                )

        # 3. Fetch current risk scores

        ip_risk = self.state_store.get_risk_engine().get_risk(
            event.ip_address, event.timestamp
        )

        user_risk = (
            self.state_store.get_risk_engine().get_risk(event.username, event.timestamp)
            if event.username
            else 0.0
        )

        # Use the higher risk (worst-case)
        effective_risk = max(ip_risk, user_risk)

        # 4. Decide action
        decision = self.decision_engine.decide(effective_risk)

        # 5. Enforce decision via Go rate limiter
        # Prefer IP enforcement; fallback to username if needed
        entity = event.ip_address or event.username

        enforcement = self.enforce_with_go(
            entity=entity,
            decision=decision["decision"]
        )

        # 6. Return explainable response
        return {
            "decision": decision["decision"],
            "risk_score": effective_risk,
            "signals_triggered": triggered_signals,
            "decision_reason": decision["reason"],
            "enforcement": enforcement
        }

    def enforce_with_go(self, entity: str, decision: str) -> Dict[str, Any]:
        """
        Call Go rate limiter to enforce the decision.
        Fail-open by design for Phase 1.
        """

        payload = {
            "entity": entity,
            "decision": decision,
            # Only BLOCK needs TTL
            "ttl_seconds": 300 if decision == "BLOCK" else 0
        }

        try:
            resp = requests.post(
                "http://localhost:8081/enforce",
                json=payload,
                timeout=1
            )
            return resp.json()

        except Exception as e:
            # Fail-open is intentional to avoid auth outages
            return {
                "allowed": True,
                "reason": f"enforcement unavailable: {e}"
            }
