from backend.alerts.payloads import build_alert
from backend.alerts.webhook import send_alert


class AlertManager:
    def emit(self, event, decision, risk, signals):
        payload = build_alert(
            event=event,
            decision=decision,
            risk=risk,
            signals=signals
        )
        send_alert(payload)
