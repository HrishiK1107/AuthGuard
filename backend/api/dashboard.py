from fastapi import APIRouter
import sqlite3
from pathlib import Path

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

DB_PATH = Path(__file__).resolve().parents[1] / "storage" / "authguard.db"


def get_conn():
    return sqlite3.connect(DB_PATH)


@router.get("/")
def dashboard_summary():
    """
    High-level dashboard metrics.
    """

    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM event_log")
    total_events = cursor.fetchone()[0]

    cursor.execute(
        "SELECT decision, COUNT(*) FROM event_log GROUP BY decision"
    )
    decision_breakdown = {
        row[0]: row[1] for row in cursor.fetchall()
    }

    cursor.execute(
        "SELECT entity, COUNT(*) FROM event_log GROUP BY entity ORDER BY COUNT(*) DESC LIMIT 5"
    )
    top_entities = [
        {"entity": row[0], "count": row[1]}
        for row in cursor.fetchall()
    ]

    conn.close()

    return {
        "total_events": total_events,
        "decision_breakdown": decision_breakdown,
        "top_entities": top_entities
    }
