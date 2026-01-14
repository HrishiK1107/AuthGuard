from typing import Dict, Any

from detection.sliding_window import SlidingWindow
from detection.event_ingest import AuthEvent, Outcome


# =========================
# Signal 1: Failed Login Velocity (per IP)
# =========================

def failed_login_velocity(
    event: AuthEvent,
    window: SlidingWindow,
    threshold: int = 5
) -> Dict[str, Any]:
    """
    Detects too many failed logins from a single IP in a short time window.
    """

    if event.outcome != Outcome.FAILURE:
        return {"triggered": False}

    key = event.ip_address
    window.add_event(key, event.timestamp)

    count = window.count(key, event.timestamp)

    if count >= threshold:
        return {
            "triggered": True,
            "signal_id": "FAILED_LOGIN_VELOCITY",
            "entity": event.ip_address,
            "entity_type": "IP",
            "score": 30,
            "confidence": min(1.0, count / threshold),
            "decay": {
                "type": "exponential",
                "half_life_sec": 300
            },
            "tags": ["bruteforce", "velocity"],
            "reason": f"{count} failed logins from IP {key} in short time"
        }

    return {"triggered": False}


# =========================
# Signal 2: IP Fan-Out (many users from one IP)
# =========================

def ip_fan_out(
    event: AuthEvent,
    window: SlidingWindow,
    threshold: int = 4
) -> Dict[str, Any]:
    """
    Detects one IP attempting logins for many different users.
    """

    if not event.username:
        return {"triggered": False}

    key = f"{event.ip_address}:{event.username}"
    window.add_event(key, event.timestamp)

    ip_prefix = event.ip_address
    unique_users = set()

    for composite_key in window.store.keys():
        if composite_key.startswith(ip_prefix):
            _, user = composite_key.split(":", 1)
            unique_users.add(user)

    if len(unique_users) >= threshold:
        return {
            "triggered": True,
            "signal_id": "IP_FAN_OUT",
            "entity": event.ip_address,
            "entity_type": "IP",
            "score": 40,
            "confidence": min(1.0, len(unique_users) / threshold),
            "decay": {
                "type": "exponential",
                "half_life_sec": 600
            },
            "tags": ["credential_stuffing", "fanout"],
            "reason": f"IP {event.ip_address} attempted {len(unique_users)} users"
        }

    return {"triggered": False}


# =========================
# Signal 3: User Fan-In (many IPs for one user)
# =========================

def user_fan_in(
    event: AuthEvent,
    window: SlidingWindow,
    threshold: int = 3
) -> Dict[str, Any]:
    """
    Detects one user being targeted from many IPs.
    """

    if not event.username:
        return {"triggered": False}

    key = f"{event.username}:{event.ip_address}"
    window.add_event(key, event.timestamp)

    user_prefix = event.username
    unique_ips = set()

    for composite_key in window.store.keys():
        if composite_key.startswith(user_prefix):
            _, ip = composite_key.split(":", 1)
            unique_ips.add(ip)

    if len(unique_ips) >= threshold:
        return {
            "triggered": True,
            "signal_id": "USER_FAN_IN",
            "entity": event.username,
            "entity_type": "USER",
            "score": 35,
            "confidence": min(1.0, len(unique_ips) / threshold),
            "decay": {
                "type": "exponential",
                "half_life_sec": 600
            },
            "tags": ["account_takeover", "fanin"],
            "reason": f"User {event.username} targeted from {len(unique_ips)} IPs"
        }

    return {"triggered": False}
