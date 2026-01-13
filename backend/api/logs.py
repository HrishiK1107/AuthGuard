from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional, List
import sqlite3
from pathlib import Path
from datetime import datetime

from backend.detection.event_processor import EventProcessor

router = APIRouter(tags=["logs"])

# Single shared processor instance (stateful by design)
event_processor = EventProcessor()

# Path to SQLite database
DB_PATH = Path(__file__).resolve().parents[1] / "storage" / "authguard.db"


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# -------------------------------------------------------------------
# WRITE SIDE — Event Ingestion (UNCHANGED)
# -------------------------------------------------------------------

@router.post("/events/auth")
def ingest_auth_event(raw_event: Dict[str, Any]):
    """
    Ingest an authentication event and return
    decision + enforcement + explainability.
    """
    try:
        result = event_processor.process(raw_event)
        return {
            "status": "processed",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# -------------------------------------------------------------------
# READ SIDE — Logs & Visibility (FIXED)
# -------------------------------------------------------------------

@router.get("/logs")
def get_logs(
    limit: int = Query(50, ge=1, le=500),
    decision: Optional[str] = None,
    entity: Optional[str] = None,
):
    """
    Read persisted auth logs with optional filters.
    Defensive against future timestamps.
    """

    now_ms = int(datetime.utcnow().timestamp() * 1000)

    query = """
        SELECT
            ts,
            entity,
            endpoint,
            outcome,
            decision,
            risk,
            enforcement_allowed,
            enforcement_reason
        FROM event_log
        WHERE ts IS NOT NULL
          AND ts <= ?
    """

    params: List[Any] = [now_ms]
    filters = []

    if decision:
        filters.append("decision = ?")
        params.append(decision)

    if entity:
        filters.append("entity = ?")
        params.append(entity)

    if filters:
        query += " AND " + " AND ".join(filters)

    query += " ORDER BY ts DESC LIMIT ?"
    params.append(limit)

    conn = get_conn()
    rows = conn.execute(query, params).fetchall()
    conn.close()

    results: List[Dict[str, Any]] = []

    for row in rows:
        results.append(
            {
                "timestamp": row["ts"],
                "entity": row["entity"],
                "endpoint": row["endpoint"],
                "outcome": row["outcome"],
                "decision": row["decision"],
                "risk": row["risk"],
                "enforcement_allowed": bool(row["enforcement_allowed"]),
                "enforcement_reason": row["enforcement_reason"],
            }
        )

    return {
        "count": len(results),
        "results": results,
    }


# -------------------------------------------------------------------
# FIX: SUPPORT /logs/ (trailing slash)
# -------------------------------------------------------------------

@router.get("/logs/")
def get_logs_alias(
    limit: int = Query(50, ge=1, le=500),
    decision: Optional[str] = None,
    entity: Optional[str] = None,
):
    return get_logs(limit=limit, decision=decision, entity=entity)
