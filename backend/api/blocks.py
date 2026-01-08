from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import requests
import time

from backend.storage.block_store import load_blocks, save_blocks

router = APIRouter(prefix="/blocks", tags=["blocks"])

GO_ENFORCER_URL = "http://localhost:8081"

# Python-side authoritative mirror
ACTIVE_BLOCKS: Dict[str, Dict[str, Any]] = load_blocks()


@router.get("/")
def list_blocks():
    """
    List currently blocked entities with telemetry.
    """
    return {
        "count": len(ACTIVE_BLOCKS),
        "blocks": ACTIVE_BLOCKS
    }


@router.post("/block")
def manual_block(payload: Dict[str, Any]):
    if "entity" not in payload:
        raise HTTPException(status_code=400, detail="Missing entity")

    entity = payload["entity"]
    ttl = int(payload.get("ttl_seconds", 300))

    telemetry = {
        "blocked_at": int(time.time() * 1000),
        "ttl_seconds": ttl,
        "risk_score": payload.get("risk_score"),
        "signals": payload.get("signals", []),
        "reason": payload.get("reason", "manual")
    }

    try:
        requests.post(
            f"{GO_ENFORCER_URL}/enforce",
            json={
                "entity": entity,
                "decision": "BLOCK",
                "ttl_seconds": ttl
            },
            timeout=1
        )

        ACTIVE_BLOCKS[entity] = telemetry
        save_blocks(ACTIVE_BLOCKS)

        return {
            "status": "blocked",
            "entity": entity,
            "telemetry": telemetry
        }

    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"enforcement unavailable: {e}"
        )


@router.post("/unblock")
def manual_unblock(payload: Dict[str, Any]):
    if "entity" not in payload:
        raise HTTPException(status_code=400, detail="Missing entity")

    entity = payload["entity"]

    try:
        requests.post(
            f"{GO_ENFORCER_URL}/enforce",
            json={
                "entity": entity,
                "decision": "ALLOW",
                "ttl_seconds": 0
            },
            timeout=1
        )

        ACTIVE_BLOCKS.pop(entity, None)
        save_blocks(ACTIVE_BLOCKS)

        return {
            "status": "unblocked",
            "entity": entity
        }

    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"enforcement unavailable: {e}"
        )
