from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional, List
import sqlite3
from pathlib import Path

from backend.detection.event_processor import EventProcessor

router = APIRouter(tags=["logs"])

# Single shared processor instance (important: stateful)
event_processor = EventProcessor()

# Path to SQLite database
DB_PATH = Path(__file__).resolve().parents[1] / "storage" / "authguard.db"


def get_conn():
    return sqlite3.connect(DB_PATH)


# -------------------------------------------------------------------
# WRITE SIDE — Event Ingestion
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
# READ SIDE — Logs & Visibility
# -------------------------------------------------------------------

@router.get("/logs")
def get_logs(
    limit: int = Query(50, ge=1, le=500),
    decision: Optional[str] = None,
    entity: Optional[str] = None,
):
    """
    Read persisted auth logs with optional filters.
    """

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
    """

    filters = []
    params = []

    if decision:
        filters.append("decision = ?")
        params.append(decision)

    if entity:
        filters.append("entity = ?")
        params.append(entity)

    if filters:
        query += " WHERE " + " AND ".join(filters)

    query += " ORDER BY ts DESC LIMIT ?"
    params.append(limit)

    conn = get_conn()
    cursor = conn.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    results: List[Dict[str, Any]] = []

    for row in rows:
        results.append(
            {
                "timestamp": row[0],
                "entity": row[1],
                "endpoint": row[2],
                "outcome": row[3],
                "decision": row[4],
                "risk": row[5],
                "enforcement_allowed": bool(row[6]),
                "enforcement_reason": row[7],
            }
        )

    return {
        "count": len(results),
        "results": results,
    }
