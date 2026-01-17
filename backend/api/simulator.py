from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
import time

from simulator.brute_force import brute_force_attack
from simulator.credential_stuffing import credential_stuffing_attack
from simulator.otp_bombing import otp_bombing_attack

router = APIRouter(prefix="/simulate", tags=["simulator"])


# =========================================================
# TIME ANCHOR
# =========================================================
def _now_ms() -> int:
    return int(time.time() * 1000)


# =========================================================
# PAYLOAD MODELS
# =========================================================
class BruteforcePayload(BaseModel):
    username: str = "admin"
    ip: str = "127.0.0.1"
    attempts: int = Field(6, gt=0)
    delay: float = Field(0.2, gt=0)


class CredentialStuffingPayload(BaseModel):
    usernames: List[str] = ["alice", "bob", "charlie", "david"]
    ip: str = "127.0.0.1"
    delay: float = Field(0.3, gt=0)


class OtpBombingPayload(BaseModel):
    username: str = "Jane Doe"
    ip: str = "127.0.0.1"
    attempts: int = Field(8, gt=0)
    delay: float = Field(0.4, gt=0)


# =========================================================
# BRUTE FORCE
# =========================================================
@router.post("/bruteforce")
def simulate_bruteforce(payload: BruteforcePayload):
    try:
        start_ts = _now_ms()

        try:
            brute_force_attack(
                username=payload.username,
                ip_address=payload.ip,
                attempts=payload.attempts,
                delay=payload.delay,
                start_ts=start_ts,
            )
        except TypeError:
            # backward compatibility
            brute_force_attack(
                username=payload.username,
                ip_address=payload.ip,
                attempts=payload.attempts,
                delay=payload.delay,
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "started", "type": "bruteforce"}


# =========================================================
# CREDENTIAL STUFFING
# =========================================================
@router.post("/credential-stuffing")
def simulate_credential_stuffing(payload: CredentialStuffingPayload):
    try:
        start_ts = _now_ms()

        try:
            credential_stuffing_attack(
                usernames=payload.usernames,
                ip_address=payload.ip,
                delay=payload.delay,
                start_ts=start_ts,
            )
        except TypeError:
            credential_stuffing_attack(
                usernames=payload.usernames,
                ip_address=payload.ip,
                delay=payload.delay,
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "started", "type": "credential-stuffing"}


# =========================================================
# OTP BOMBING
# =========================================================
@router.post("/otp-bombing")
def simulate_otp_bombing(payload: OtpBombingPayload):
    try:
        start_ts = _now_ms()

        try:
            otp_bombing_attack(
                username=payload.username,
                ip_address=payload.ip,
                attempts=payload.attempts,
                delay=payload.delay,
                start_ts=start_ts,
            )
        except TypeError:
            otp_bombing_attack(
                username=payload.username,
                ip_address=payload.ip,
                attempts=payload.attempts,
                delay=payload.delay,
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "started", "type": "otp-bombing"}
