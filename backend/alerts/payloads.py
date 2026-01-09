from typing import Dict, Any
from datetime import datetime


def build_alert(event, decision, risk, signals) -> Dict[str, Any]:
    return {
        "alert_type": "AUTH_ABUSE",
        "severity": "HIGH" if decision == "BLOCK" else "MEDIUM",
        "decision": decision,
        "entity": event.ip_address or event.username,
        "username": event.username,
        "ip_address": event.ip_address,
        "endpoint": event.endpoint,
        "risk_score": round(risk, 2),
        "signals": signals,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "source": "AuthGuard"
    }
