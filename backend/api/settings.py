from fastapi import APIRouter, HTTPException
from typing import Dict

from backend.storage.settings_store import load_settings, save_settings

router = APIRouter(prefix="/settings", tags=["settings"])

# =========================
# RUNTIME SETTINGS (GLOBAL)
# =========================
RUNTIME_SETTINGS: Dict = load_settings()


@router.get("/")
def get_settings():
    """
    Get current AuthGuard settings.
    """
    return RUNTIME_SETTINGS


@router.post("/mode")
def update_mode(payload: Dict):
    """
    Update enforcement mode.
    """
    mode = payload.get("mode")

    if mode not in ("fail-open", "fail-closed"):
        raise HTTPException(
            status_code=400,
            detail="mode must be 'fail-open' or 'fail-closed'"
        )

    RUNTIME_SETTINGS["mode"] = mode
    save_settings(RUNTIME_SETTINGS)

    return {
        "status": "updated",
        "mode": mode
    }
