from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import requests
import time
import os

from storage.block_store import load_blocks, save_blocks

router = APIRouter(prefix="/blocks", tags=["blocks"])

GO_ENFORCER_URL = os.getenv("ENFORCER_URL", "http://ratelimiter:8081")

# Canonical storage: LIST of block objects
ACTIVE_BLOCKS: List[Dict[str, Any]] = load_blocks()


def normalize_block(b: Dict[str, Any]) -> Dict[str, Any]:
    """
    Frontend-safe block representation.
    """
    created_ms = b.get("created_at")
    ttl = b.get("ttl_seconds")

    created_ts = int(created_ms / 1000) if created_ms else None
    expires_ts = (
        created_ts + ttl if created_ts and ttl else None
    )

    return {
        "id": b.get("id"),
        "entity": b.get("entity"),
        "decision": b.get("decision", "BLOCK").upper(),
        "risk": b.get("risk"),
        "active": bool(b.get("active", False)),
        "source": b.get("source", "unknown"),
        "created_ts": created_ts,
        "expires_ts": expires_ts,
    }


# =========================================================
# READ — Active Blocks (V2 SAFE)
# =========================================================
@router.get("/")
def list_blocks():
    blocks = [
        normalize_block(b)
        for b in ACTIVE_BLOCKS
        if b.get("active", False)
    ]

    return {
        "count": len(blocks),
        "blocks": blocks,
    }


# =========================================================
# WRITE — Manual Block (UNCHANGED)
# =========================================================
@router.post("/block")
def manual_block(payload: Dict[str, Any]):
    if "entity" not in payload:
        raise HTTPException(status_code=400, detail="Missing entity")

    entity = payload["entity"]
    ttl = int(payload.get("ttl_seconds", 300))
    now = int(time.time() * 1000)

    for b in ACTIVE_BLOCKS:
        if b.get("entity") == entity and b.get("active", True):
            return {"status": "already_blocked", "entity": entity}

    try:
        requests.post(
            f"{GO_ENFORCER_URL}/enforce",
            json={
                "entity": entity,
                "decision": "BLOCK",
                "ttl_seconds": ttl,
            },
            timeout=1,
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"enforcement unavailable: {e}",
        )

    block = {
        "id": f"manual::{entity}",
        "entity": entity,
        "scope": "auth",
        "decision": "HARD_BLOCK",
        "risk": payload.get("risk_score"),
        "ttl_seconds": ttl,
        "active": True,
        "source": "manual",
        "created_at": now,
    }

    ACTIVE_BLOCKS.append(block)
    save_blocks(ACTIVE_BLOCKS)

    return {
        "status": "blocked",
        "entity": entity,
        "block": normalize_block(block),
    }


# =========================================================
# WRITE — Manual Unblock (UNCHANGED)
# =========================================================
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
                "ttl_seconds": 0,
            },
            timeout=1,
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"enforcement unavailable: {e}",
        )

    changed = False
    for b in ACTIVE_BLOCKS:
        if b.get("entity") == entity and b.get("active", True):
            b["active"] = False
            changed = True

    if changed:
        save_blocks(ACTIVE_BLOCKS)

    return {
        "status": "unblocked",
        "entity": entity,
    }


# =========================================================
# ENFORCER HEALTH
# =========================================================
@router.get("/enforcer/health")
def enforcer_health():
    try:
        resp = requests.get(f"{GO_ENFORCER_URL}/health", timeout=1)
        if resp.status_code != 200:
            raise Exception(f"bad status {resp.status_code}")
        return {"status": "up"}
    except Exception as e:
        return {
            "status": "down",
            "error": str(e),
        }
