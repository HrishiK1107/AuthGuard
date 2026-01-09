import time
import requests

API_URL = "http://127.0.0.1:8000/events/auth"


def otp_bombing_attack(
    username: str,
    ip_address: str,
    attempts: int = 8,
    delay: float = 0.4
):
    print(f"[+] Starting OTP bombing on user '{username}' from IP {ip_address}")
    print("-" * 60)

    for i in range(1, attempts + 1):
        payload = {
            "timestamp": int(time.time() * 1000),
            "username": username,
            "ip_address": ip_address,
            "user_agent": "OtpBombBot/1.0",
            "endpoint": "/otp",
            "method": "POST",
            "outcome": "FAILURE",
            "failure_reason": "INVALID_OTP",
            "latency_ms": 90,
            "ingest_source": "simulator-otp-bombing"
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
            f"[Attempt {i}] "
            f"Decision={decision} | Risk={risk} | Reason={reason}"
        )

        time.sleep(delay)

    print("-" * 60)
    print("[+] OTP bombing simulation complete")
