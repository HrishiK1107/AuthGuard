import time
from typing import Dict, Any, Optional

from backend.alerts.payloads import build_alert
from backend.alerts.webhook import send_alert


class AlertManager:
    """
    Alert Manager v2

    - Deduplicated
    - Severity-aware
    - Campaign-aware
    - Suppression-window protected
    """

    def __init__(self, suppression_window_sec: int = 300):
        # campaign_id -> last_alert_ts
        self._last_alerts: Dict[str, int] = {}
        self.suppression_window_sec = suppression_window_sec

    def _derive_campaign_id(
        self,
        event,
        campaign: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Determine campaign identifier for deduplication.
        """
        if campaign and "campaign_id" in campaign:
            return campaign["campaign_id"]

        if getattr(event, "username", None):
            return f"USER::{event.username}"

        return f"IP::{event.ip_address}"

    def _map_severity(self, decision: str, risk: float) -> str:
        """
        Map decision + risk to alert severity.
        """
        if decision == "BLOCK":
            return "CRITICAL" if risk >= 75 else "HIGH"

        if decision == "CHALLENGE":
            return "MEDIUM" if risk >= 40 else "LOW"

        return "INFO"

    def _is_suppressed(self, campaign_id: str, now_ts: int) -> bool:
        """
        Check suppression window.
        """
        last_ts = self._last_alerts.get(campaign_id)
        if last_ts is None:
            return False

        return (now_ts - last_ts) < self.suppression_window_sec

    def emit(
        self,
        event,
        decision: str,
        risk: float,
        signals,
        campaign: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Emit alert if not suppressed.
        Never raises.
        """
        try:
            now_ts = int(time.time())
            campaign_id = self._derive_campaign_id(event, campaign)

            if self._is_suppressed(campaign_id, now_ts):
                return

            severity = self._map_severity(decision, risk)

            payload = build_alert(
                event=event,
                decision=decision,
                risk=risk,
                signals=signals,
                severity=severity,
                campaign=campaign,
            )

            send_alert(payload)

            # record emission
            self._last_alerts[campaign_id] = now_ts

        except Exception:
            # alerts must NEVER break auth flow
            return
