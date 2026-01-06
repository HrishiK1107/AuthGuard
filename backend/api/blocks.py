from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import requests

router = APIRouter(prefix="/blocks", tags=["blocks"])

GO_ENFORCER_URL = "http://localhost:8081"


@router.get("/")
def list_blocks():
    """
    List all currently blocked entities from Go rate limiter.
    """
    try:
        resp = requests.get(
            f"{GO_ENFORCER_URL}/blocks",
            timeout=1
        )
        return resp.json()
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"enforcement unavailable: {e}"
        )


@router.post("/block")
def manual_block(payload: Dict[str, Any]):
    """
    Manually block an entity.
    """
    if "entity" not in payload:
        raise HTTPException(status_code=400, detail="Missing entity")

    ttl = int(payload.get("ttl_seconds", 300))

    try:
        resp = requests.post(
            f"{GO_ENFORCER_URL}/enforce",
            json={
                "entity": payload["entity"],
                "decision": "BLOCK",
                "ttl_seconds": ttl
            },
            timeout=1
        )
        return resp.json()
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"enforcement unavailable: {e}"
        )


@router.post("/unblock")
def manual_unblock(payload: Dict[str, Any]):
    """
    Manually unblock an entity by enforcing ALLOW.
    """
    if "entity" not in payload:
        raise HTTPException(status_code=400, detail="Missing entity")

    try:
        resp = requests.post(
            f"{GO_ENFORCER_URL}/enforce",
            json={
                "entity": payload["entity"],
                "decision": "ALLOW",
                "ttl_seconds": 0
            },
            timeout=1
        )
        return {
            "status": "unblocked",
            "entity": payload["entity"],
            "enforcement": resp.json()
        }

    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"enforcement unavailable: {e}"
        )
