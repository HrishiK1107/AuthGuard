from fastapi import APIRouter, HTTPException
from typing import Dict
import requests
import os

from storage.settings_store import load_settings, save_settings

router = APIRouter(prefix="/settings", tags=["settings"])

# =========================
# RUNTIME SETTINGS (GLOBAL)
# =========================
RUNTIME_SETTINGS: Dict = load_settings()

GO_ENFORCER_URL = os.getenv("ENFORCER_URL", "http://ratelimiter:8081")


@router.get("/")
def get_settings():
    """
    Get current AuthGuard settings.
    """
    return RUNTIME_SETTINGS


@router.post("/mode")
def update_mode(payload: Dict):
    """
    Update enforcement mode and propagate to Go enforcer.
    """
    mode = payload.get("mode")

    if mode not in ("fail-open", "fail-closed"):
        raise HTTPException(
            status_code=400,
            detail="mode must be 'fail-open' or 'fail-closed'",
        )

    # Persist locally
    RUNTIME_SETTINGS["mode"] = mode
    save_settings(RUNTIME_SETTINGS)

    # Propagate to Go enforcer
    try:
        requests.post(
            f"{GO_ENFORCER_URL}/mode",
            json={"mode": mode},
            timeout=1,
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"enforcer unavailable: {e}",
        )

    return {
        "status": "updated",
        "mode": mode,
    }
