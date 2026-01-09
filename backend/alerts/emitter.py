# backend/alerting/emitter.py

from typing import Dict, Any


def emit_alert(payload: Dict[str, Any]):
    """
    Alert emission stub.
    D4.1 only decides WHEN to alert, not WHERE.
    """
    # For now: just log (later D4.2 will send webhook)
    print("[ALERT]", payload)
