from fastapi import APIRouter

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/")
def get_settings():
    """
    Expose system-level settings (read-only).
    """
    return {
        "mode": "fail-open",
        "enforcement_timeout_seconds": 1,
        "block_ttl_seconds": 300,
        "rate_limiter": {
            "type": "token-bucket",
            "language": "go",
            "port": 8081
        }
    }
