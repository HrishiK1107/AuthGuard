from fastapi import APIRouter
import sqlite3
from pathlib import Path
from datetime import datetime

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

DB_PATH = Path(__file__).resolve().parents[1] / "storage" / "authguard.db"


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# =========================================================
# EXISTING DASHBOARD SUMMARY (UNCHANGED)
# =========================================================
@router.get("/")
def dashboard_summary():
    """
    EXISTING endpoint — unchanged.
    Used by current dashboard cards.
    """
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM event_log")
    total_events = cursor.fetchone()[0]

    cursor.execute(
        "SELECT decision, COUNT(*) as cnt FROM event_log GROUP BY decision"
    )
    decision_breakdown = {
        row["decision"]: row["cnt"] for row in cursor.fetchall()
    }

    cursor.execute(
        """
        SELECT entity, COUNT(*) as cnt
        FROM event_log
        GROUP BY entity
        ORDER BY cnt DESC
        LIMIT 5
        """
    )
    top_entities = [
        {"entity": row["entity"], "count": row["cnt"]}
        for row in cursor.fetchall()
    ]

    conn.close()

    return {
        "total_events": total_events,
        "decision_breakdown": decision_breakdown,
        "top_entities": top_entities,
    }


# =========================================================
# E5.1 — METRICS ENDPOINT (CORRECT + SAFE)
# =========================================================
@router.get("/metrics")
def dashboard_metrics():
    """
    Read-only aggregated metrics.
    Uses ONLY existing columns.
    Zero side effects.
    """

    conn = get_conn()
    cursor = conn.cursor()

    now_ms = int(datetime.utcnow().timestamp() * 1000)
    last_24h_ms = now_ms - (24 * 60 * 60 * 1000)

    # -------------------------
    # Throughput
    # -------------------------
    cursor.execute("SELECT COUNT(*) FROM event_log")
    total_requests = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM event_log WHERE ts >= ?",
        (last_24h_ms,),
    )
    last_24h = cursor.fetchone()[0]

    # -------------------------
    # Mitigation rate
    # -------------------------
    cursor.execute(
        "SELECT COUNT(*) FROM event_log WHERE decision = 'BLOCK'"
    )
    blocked = cursor.fetchone()[0]

    blocked_percent = (
        round((blocked / total_requests) * 100, 2)
        if total_requests > 0
        else 0.0
    )

    # -------------------------
    # Timeline (hourly, last 24h)
    # -------------------------
    cursor.execute(
        """
        SELECT
            strftime('%Y-%m-%d %H:00', ts / 1000, 'unixepoch') AS hour,
            decision,
            COUNT(*) as cnt
        FROM event_log
        WHERE ts >= ?
        GROUP BY hour, decision
        ORDER BY hour ASC
        """,
        (last_24h_ms,),
    )

    timeline_map = {}
    for row in cursor.fetchall():
        hour = row["hour"]
        if hour not in timeline_map:
            timeline_map[hour] = {
                "hour": hour,
                "ALLOW": 0,
                "CHALLENGE": 0,
                "BLOCK": 0,
            }
        timeline_map[hour][row["decision"]] = row["cnt"]

    timeline = list(timeline_map.values())

    # -------------------------
    # Risk distribution
    # -------------------------
    cursor.execute(
        """
        SELECT
            CASE
                WHEN risk < 30 THEN 'low'
                WHEN risk < 60 THEN 'medium'
                ELSE 'high'
            END as bucket,
            COUNT(*) as cnt
        FROM event_log
        WHERE risk IS NOT NULL
        GROUP BY bucket
        """
    )

    risk_distribution = {"low": 0, "medium": 0, "high": 0}
    for row in cursor.fetchall():
        risk_distribution[row["bucket"]] = row["cnt"]

    # -------------------------
    # Top risky entities
    # -------------------------
    cursor.execute(
        """
        SELECT entity, MAX(risk) as max_risk
        FROM event_log
        GROUP BY entity
        ORDER BY max_risk DESC
        LIMIT 5
        """
    )

    top_entities = [
        {
            "entity": row["entity"],
            "risk": row["max_risk"],
        }
        for row in cursor.fetchall()
    ]

    # -------------------------
    # Threat feed (last 10 BLOCKs)
    # -------------------------
    cursor.execute(
        """
        SELECT entity, decision, risk, endpoint, ts
        FROM event_log
        WHERE decision = 'BLOCK'
        ORDER BY ts DESC
        LIMIT 10
        """
    )

    threat_feed = [
        {
            "entity": row["entity"],
            "decision": row["decision"],
            "risk": row["risk"],
            "endpoint": row["endpoint"],
            "timestamp": row["ts"],
        }
        for row in cursor.fetchall()
    ]

    conn.close()

    return {
        "throughput": {
            "total_requests": total_requests,
            "last_24h": last_24h,
        },
        "mitigation_rate": {
            "blocked_percent": blocked_percent,
        },
        "timeline": timeline,
        "risk_distribution": risk_distribution,
        "top_entities": top_entities,
        "threat_feed": threat_feed,
        "generated_at": now_ms,
    }
