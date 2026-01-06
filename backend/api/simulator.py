from fastapi import APIRouter
from backend.simulator.brute_force import brute_force_attack

router = APIRouter(prefix="/simulate", tags=["simulator"])


@router.post("/bruteforce")
def simulate_bruteforce():
    """
    Trigger a brute-force simulation.
    """
    brute_force_attack(
        username="admin",
        ip_address="10.0.0.99",
        attempts=5,
        delay=0.2
    )
    return {
        "status": "simulation_started",
        "type": "brute_force"
    }
