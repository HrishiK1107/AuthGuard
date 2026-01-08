from fastapi import APIRouter
from backend.simulator.brute_force import brute_force_attack
from backend.simulator.credential_stuffing import credential_stuffing_attack
from backend.simulator.otp_bombing import otp_bombing_attack

router = APIRouter(prefix="/simulate", tags=["simulator"])


@router.post("/bruteforce")
def simulate_bruteforce():
    brute_force_attack(
        username="admin",
        ip_address="10.0.0.99",
        attempts=6,
        delay=0.2
    )
    return {"status": "started", "type": "bruteforce"}


@router.post("/credential-stuffing")
def simulate_credential_stuffing():
    credential_stuffing_attack(
        usernames=["alice", "bob", "charlie", "david"],
        ip_address="10.0.0.99",
        delay=0.3
    )
    return {"status": "started", "type": "credential-stuffing"}


@router.post("/otp-bombing")
def simulate_otp_bombing():
    otp_bombing_attack(
        username="Jane Doe",
        ip_address="10.0.0.77",
        attempts=8,
        delay=0.4
    )
    return {"status": "started", "type": "otp-bombing"}
