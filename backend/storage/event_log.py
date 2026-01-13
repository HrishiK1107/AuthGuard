import sqlite3
import json
import time
from pathlib import Path
from typing import Dict, Any, List, Optional

DB_PATH = Path(__file__).resolve().parent / "authguard.db"


def _get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS event_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts INTEGER,
            entity TEXT,
            endpoint TEXT,
            outcome TEXT,
            decision TEXT,
            risk REAL,
            enforcement_allowed INTEGER,
            enforcement_reason TEXT,
            raw_event TEXT
        )
        """
    )
    return conn


# =========================
# TIMESTAMP NORMALIZATION (v2 FIX)
# =========================

def _normalize_ts(ts: int) -> int:
    """
    Ensure timestamps are sane.

    - Input assumed to be milliseconds
    - Future timestamps are clamped to 'now'
    - Prevents poisoning time-window queries
    """
    now_ms = int(time.time() * 1000)

    # If ts is wildly in the future, clamp it
    if ts > now_ms:
        return now_ms

    # If ts is zero / negative, also normalize
    if ts <= 0:
        return now_ms

    return ts


# =========================
# WRITE PATH (FIXED)
# =========================

def append_event(
    ts: int,
    entity: str,
    endpoint: str,
    outcome: str,
    decision: str,
    risk: float,
    enforcement: Dict[str, Any],
    raw_event: Dict[str, Any],
):
    # Normalize timestamp BEFORE writing
    safe_ts = _normalize_ts(ts)

    conn = _get_conn()
    try:
        conn.execute(
            """
            INSERT INTO event_log
            (ts, entity, endpoint, outcome, decision, risk,
             enforcement_allowed, enforcement_reason, raw_event)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                safe_ts,
                entity,
                endpoint,
                outcome,
                decision,
                risk,
                int(bool(enforcement.get("allowed"))),
                enforcement.get("reason"),
                json.dumps(raw_event),
            ),
        )
        conn.commit()
    finally:
        conn.close()


# =========================
# READ PATH (UNCHANGED)
# =========================

def fetch_events_for_entity(
    entity: str,
    since_ts: int,
    until_ts: Optional[int] = None,
    limit: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """
    Read-only sliding window fetch.
    Used by Detection Engine v2.
    """
    conn = _get_conn()
    try:
        query = """
            SELECT ts, entity, endpoint, outcome, decision, risk,
                   enforcement_allowed, enforcement_reason, raw_event
            FROM event_log
            WHERE entity = ?
              AND ts >= ?
        """
        params = [entity, since_ts]

        if until_ts is not None:
            query += " AND ts <= ?"
            params.append(until_ts)

        query += " ORDER BY ts ASC"

        if limit is not None:
            query += " LIMIT ?"
            params.append(limit)

        rows = conn.execute(query, params).fetchall()

        events = []
        for row in rows:
            events.append(
                {
                    "ts": row["ts"],
                    "entity": row["entity"],
                    "endpoint": row["endpoint"],
                    "outcome": row["outcome"],
                    "decision": row["decision"],
                    "risk": row["risk"],
                    "enforcement": {
                        "allowed": bool(row["enforcement_allowed"]),
                        "reason": row["enforcement_reason"],
                    },
                    "raw_event": json.loads(row["raw_event"]),
                }
            )

        return events
    finally:
        conn.close()


def event_exists(
    entity: str,
    ts: int,
    raw_event_hash: Optional[str] = None,
) -> bool:
    """
    Replay-safety helper.
    Can be used by ingestion layer before append_event.
    """
    conn = _get_conn()
    try:
        if raw_event_hash:
            row = conn.execute(
                """
                SELECT 1 FROM event_log
                WHERE entity = ? AND ts = ? AND raw_event = ?
                LIMIT 1
                """,
                (entity, ts, raw_event_hash),
            ).fetchone()
        else:
            row = conn.execute(
                """
                SELECT 1 FROM event_log
                WHERE entity = ? AND ts = ?
                LIMIT 1
                """,
                (entity, ts),
            ).fetchone()

        return row is not None
    finally:
        conn.close()
