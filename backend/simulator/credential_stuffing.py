import time
import requests

API_URL = "http://127.0.0.1:8000/events/auth"


def credential_stuffing_attack(
    usernames: list[str],
    ip_address: str,
    delay: float = 0.3
):
    """
    Simulate credential stuffing attack:
    One IP tries many usernames with few attempts each.
    """

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

        response = requests.post(API_URL, json=payload)
        result = response.json()

        decision = result["result"]["decision"]
        risk = result["result"]["risk_score"]
        reason = result["result"]["reason"]

        print(
            f"[User {i}: {username}] "
            f"Decision={decision} | Risk={risk} | Reason={reason}"
        )

        time.sleep(delay)

    print("-" * 60)
    print("[+] Credential stuffing simulation complete")


if __name__ == "__main__":
    users = [
        "alice",
        "bob",
        "charlie",
        "david",
        "emma",
        "frank",
        "grace",
        "henry"
    ]

    credential_stuffing_attack(
        usernames=users,
        ip_address="10.0.0.99",
        delay=0.3
    )
