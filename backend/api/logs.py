from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional, List
import sqlite3
from pathlib import Path
from datetime import datetime

from detection.event_processor import EventProcessor

router = APIRouter(tags=["logs"])

event_processor = EventProcessor()

DB_PATH = Path(__file__).resolve().parents[1] / "storage" / "authguard.db"


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def table_exists(cursor, table_name: str) -> bool:
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (table_name,),
    )
    return cursor.fetchone() is not None


# -------------------------------------------------------------------
# WRITE SIDE — Event Ingestion (UNCHANGED)
# -------------------------------------------------------------------

@router.post("/events/auth")
def ingest_auth_event(raw_event: Dict[str, Any]):
    try:
        result = event_processor.process(raw_event)
        return {"status": "processed", "result": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# -------------------------------------------------------------------
# READ SIDE — Logs (V2 SAFE)
# -------------------------------------------------------------------

@router.get("/logs")
def get_logs(
    limit: int = Query(50, ge=1, le=500),
    decision: Optional[str] = None,
    entity: Optional[str] = None,
):
    conn = get_conn()
    cursor = conn.cursor()

    # 🔒 EMPTY DB SAFETY
    if not table_exists(cursor, "event_log"):
        conn.close()
        return {
            "count": 0,
            "results": [],
        }

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
        filters.append("UPPER(decision) = ?")
        params.append(decision.upper())

    if entity:
        filters.append("entity = ?")
        params.append(entity)

    if filters:
        query += " AND " + " AND ".join(filters)

    query += " ORDER BY ts DESC LIMIT ?"
    params.append(limit)

    rows = cursor.execute(query, params).fetchall()
    conn.close()

    results = [
        {
            "ts": int(row["ts"] / 1000),
            "entity": row["entity"],
            "endpoint": row["endpoint"],
            "outcome": row["outcome"],
            "decision": row["decision"].upper(),
            "risk": row["risk"],
            "enforcement_allowed": bool(row["enforcement_allowed"]),
            "enforcement_reason": row["enforcement_reason"],
        }
        for row in rows
    ]

    return {
        "count": len(results),
        "results": results,
    }


@router.get("/logs/")
def get_logs_alias(
    limit: int = Query(50, ge=1, le=500),
    decision: Optional[str] = None,
    entity: Optional[str] = None,
):
    return get_logs(limit=limit, decision=decision, entity=entity)
