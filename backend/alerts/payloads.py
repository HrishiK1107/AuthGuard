from typing import Dict, Any, Optional
from datetime import datetime


def build_alert(
    event,
    decision: str,
    risk: float,
    signals,
    severity: Optional[str] = None,
    campaign: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Build structured alert payload.

    v2 additions:
    - explicit severity
    - campaign context
    """

    resolved_severity = severity
    if resolved_severity is None:
        # backward-compatible fallback
        resolved_severity = "HIGH" if decision == "BLOCK" else "MEDIUM"

    payload = {
        "alert_type": "AUTH_ABUSE",
        "severity": resolved_severity,
        "decision": decision,
        "entity": event.ip_address or event.username,
        "username": event.username,
        "ip_address": event.ip_address,
        "endpoint": event.endpoint,
        "risk_score": round(risk, 2),
        "signals": signals,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "source": "AuthGuard",
    }

    if campaign:
        payload["campaign"] = {
            "id": campaign.get("campaign_id"),
            "type": campaign.get("campaign_type"),
        }

    return payload
