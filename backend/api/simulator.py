from fastapi import APIRouter
import time

from backend.simulator.brute_force import brute_force_attack
from backend.simulator.credential_stuffing import credential_stuffing_attack
from backend.simulator.otp_bombing import otp_bombing_attack

router = APIRouter(prefix="/simulate", tags=["simulator"])


def _now_ms() -> int:
    """
    Authoritative wall-clock time anchor.
    Used to prevent simulator timestamp drift.
    """
    return int(time.time() * 1000)


@router.post("/bruteforce")
def simulate_bruteforce():
    """
    Simulate brute-force attack with time anchoring.
    """
    try:
        start_ts = _now_ms()

        brute_force_attack(
            username="admin",
            ip_address="10.0.0.69",
            attempts=6,
            delay=0.2,
            start_ts=start_ts,  # safe even if ignored
        )
    except TypeError:
        # Backward compatibility if simulator doesn't accept start_ts
        brute_force_attack(
            username="admin",
            ip_address="10.0.0.69",
            attempts=6,
            delay=0.2
        )
    except Exception as e:
        return {"status": "error", "error": str(e)}

    return {"status": "started", "type": "bruteforce"}


@router.post("/credential-stuffing")
def simulate_credential_stuffing():
    """
    Simulate credential stuffing with time anchoring.
    """
    try:
        start_ts = _now_ms()

        credential_stuffing_attack(
            usernames=["alice", "bob", "charlie", "david"],
            ip_address="10.0.0.202",
            delay=0.3,
            start_ts=start_ts,
        )
    except TypeError:
        credential_stuffing_attack(
            usernames=["alice", "bob", "charlie", "david"],
            ip_address="10.0.0.202",
            delay=0.3
        )
    except Exception as e:
        return {"status": "error", "error": str(e)}

    return {"status": "started", "type": "credential-stuffing"}


@router.post("/otp-bombing")
def simulate_otp_bombing():
    """
    Simulate OTP bombing with time anchoring.
    """
    try:
        start_ts = _now_ms()

        otp_bombing_attack(
            username="Jane Doe",
            ip_address="10.0.0.203",
            attempts=8,
            delay=0.4,
            start_ts=start_ts,
        )
    except TypeError:
        otp_bombing_attack(
            username="Jane Doe",
            ip_address="10.0.0.203",
            attempts=8,
            delay=0.4
        )
    except Exception as e:
        return {"status": "error", "error": str(e)}

    return {"status": "started", "type": "otp-bombing"}
