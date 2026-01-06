import sqlite3
import json
from pathlib import Path
from typing import Dict, Any

DB_PATH = Path(__file__).resolve().parent / "authguard.db"


def _get_conn():
    conn = sqlite3.connect(DB_PATH)
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
    conn = _get_conn()
    try:
        conn.execute(
            """
            INSERT INTO event_log
            (ts, entity, endpoint, outcome, decision, risk, enforcement_allowed, enforcement_reason, raw_event)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                ts,
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
