from enum import Enum
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, validator


# =========================
# Enums (Locked Contracts)
# =========================

class Outcome(str, Enum):
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"


class FailureReason(str, Enum):
    INVALID_PASSWORD = "INVALID_PASSWORD"
    INVALID_OTP = "INVALID_OTP"
    USER_NOT_FOUND = "USER_NOT_FOUND"
    RATE_LIMITED = "RATE_LIMITED"
    ACCOUNT_LOCKED = "ACCOUNT_LOCKED"


class Endpoint(str, Enum):
    LOGIN = "/login"
    OTP = "/otp"
    PASSWORD_RESET = "/password-reset"
    TOKEN_REFRESH = "/token-refresh"


class HTTPMethod(str, Enum):
    POST = "POST"
    GET = "GET"


# =========================
# Canonical Auth Event
# =========================

class AuthEvent(BaseModel):
    # Core identity
    event_id: UUID = Field(default_factory=uuid4)
    timestamp: int = Field(..., description="Epoch time in milliseconds")

    # Actor
    user_id: Optional[str] = None
    username: Optional[str] = None

    # Network
    ip_address: str
    asn: Optional[int] = None
    country: Optional[str] = None

    # Device
    user_agent: str
    device_fp: Optional[str] = None  # hashed only

    # Request context
    endpoint: Endpoint
    method: HTTPMethod

    # Outcome
    outcome: Outcome
    failure_reason: Optional[FailureReason] = None

    # Performance signal
    latency_ms: int

    # Meta
    ingest_source: str
    replay_id: Optional[str] = None

    # =========================
    # Validators (Hard Rules)
    # =========================

    @validator("timestamp")
    def timestamp_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("timestamp must be epoch milliseconds > 0")
        return v

    @validator("latency_ms")
    def latency_must_be_reasonable(cls, v):
        if v < 0 or v > 120_000:
            raise ValueError("latency_ms out of realistic bounds")
        return v

    @validator("failure_reason", always=True)
    def failure_reason_consistency(cls, v, values):
        outcome = values.get("outcome")
        if outcome == Outcome.FAILURE and v is None:
            raise ValueError("failure_reason required when outcome is FAILURE")
        if outcome == Outcome.SUCCESS and v is not None:
            raise ValueError("failure_reason must be null on SUCCESS")
        return v

    class Config:
        frozen = True
        anystr_strip_whitespace = True


# =========================
# Ingest / Normalize Entry
# =========================

def ingest_event(raw_event: Dict[str, Any]) -> AuthEvent:
    """
    Normalize raw input into a validated AuthEvent.
    Any invalid event is rejected here — not later.
    """
    return AuthEvent(**raw_event)
