import time
import requests

API_URL = "http://127.0.0.1:8000/events/auth"


def credential_stuffing_attack(
    usernames: list[str],
    ip_address: str,
    delay: float = 0.3
):
    print(f"[+] Starting credential stuffing from IP {ip_address}")
    print("-" * 60)

    for i, username in enumerate(usernames, start=1):
        payload = {
            "timestamp": int(time.time() * 1000),
            "username": username,
            "ip_address": ip_address,
            "user_agent": "CredStuffBot/1.0",
            "endpoint": "/login",
            "method": "POST",
            "outcome": "FAILURE",
            "failure_reason": "INVALID_PASSWORD",
            "latency_ms": 100,
            "ingest_source": "simulator-credstuff"
        }

        try:
            response = requests.post(API_URL, json=payload, timeout=2)

            if response.headers.get("content-type", "").startswith("application/json"):
                result = response.json()
                decision = result.get("result", {}).get("decision")
                risk = result.get("result", {}).get("risk_score")
                reason = result.get("result", {}).get("reason")
            else:
                decision = "UNKNOWN"
                risk = "N/A"
                reason = "Non-JSON response"

        except Exception as e:
            decision = "ERROR"
            risk = "N/A"
            reason = str(e)

        print(
            f"[User {i}: {username}] "
            f"Decision={decision} | Risk={risk} | Reason={reason}"
        )

        time.sleep(delay)

    print("-" * 60)
    print("[+] Credential stuffing simulation complete")
