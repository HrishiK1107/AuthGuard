import requests
from typing import Dict, Any

WEBHOOK_URL = "http://localhost:9999/webhook"  # replace later


def send_alert(payload: Dict[str, Any]) -> None:
    try:
        requests.post(
            WEBHOOK_URL,
            json={
                "text": f"🚨 AuthGuard Alert\n```{payload}```"
            },
            timeout=2
        )
    except Exception as e:
        # Alerts must NEVER break auth flow
        print(f"[ALERT ERROR] {e}")
