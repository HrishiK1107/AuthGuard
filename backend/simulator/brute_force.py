import time
import requests

API_URL = "http://127.0.0.1:8000/events/auth"


def brute_force_attack(
    username: str,
    ip_address: str,
    attempts: int = 10,
    delay: float = 0.5
):
    """
    Simulate brute-force login attempts against AuthGuard.
    """

    print(f"[+] Starting brute-force attack on user '{username}' from IP {ip_address}")
    print("-" * 60)

    for i in range(1, attempts + 1):
        payload = {
            "timestamp": int(time.time() * 1000),
            "username": username,
            "ip_address": ip_address,
            "user_agent": "BruteForceBot/1.0",
            "endpoint": "/login",
            "method": "POST",
            "outcome": "FAILURE",
            "failure_reason": "INVALID_PASSWORD",
            "latency_ms": 120,
            "ingest_source": "simulator-bruteforce"
        }

        response = requests.post(API_URL, json=payload)
        result = response.json()

        decision = result.get("decision")
        risk = result["result"]["risk_score"]
        decision_reason = result["result"]["decision_reason"]
        enforcement = result["result"]["enforcement"]

        print(
             f"[Attempt {i}] "
             f"Decision={decision} | Risk={risk:.2f} | "
             f"DecisionReason={decision_reason} | "
             f"Enforcement={enforcement}"
         )

        time.sleep(delay)

    print("-" * 60)
    print("[+] Brute-force simulation complete")

if __name__ == "__main__":
    brute_force_attack(
        username="admin",
        ip_address="10.0.0.200",
        attempts=10,
        delay=0.5
    )
