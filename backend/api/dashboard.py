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


def table_exists(cursor, table_name: str) -> bool:
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (table_name,),
    )
    return cursor.fetchone() is not None


# =========================================================
# DASHBOARD SUMMARY (CANONICAL)
# =========================================================
@router.get("/")
def dashboard_summary():
    """
    Canonical dashboard summary endpoint.
    Used by dashboard cards.
    """
    conn = get_conn()
    cursor = conn.cursor()

    if not table_exists(cursor, "event_log"):
        conn.close()
        return {
            "total_events": 0,
            "decision_breakdown": {},
            "top_entities": [],
        }

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
# DASHBOARD METRICS
# =========================================================
@router.get("/metrics")
def dashboard_metrics():
    """
    Aggregated metrics for charts and timelines.
    """

    conn = get_conn()
    cursor = conn.cursor()

    now_ms = int(datetime.utcnow().timestamp() * 1000)
    last_24h_ms = now_ms - (24 * 60 * 60 * 1000)

    if not table_exists(cursor, "event_log"):
        conn.close()
        return {
            "throughput": {"total_requests": 0, "last_24h": 0},
            "mitigation_rate": {"blocked_percent": 0.0},
            "risk_drift": {
                "avg_24h": 0.0,
                "avg_all_time": 0.0,
                "delta": 0.0,
            },
            "timeline": [],
            "risk_distribution": {"low": 0, "medium": 0, "high": 0},
            "top_entities": [],
            "threat_feed": [],
            "generated_at": now_ms,
        }

    # -------------------------
    # Throughput
    # -------------------------
    cursor.execute("SELECT COUNT(*) FROM event_log")
    total_requests = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT COUNT(*) FROM event_log
        WHERE ts IS NOT NULL
          AND ts >= ?
          AND ts <= ?
        """,
        (last_24h_ms, now_ms),
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
    # Timeline
    # -------------------------
    cursor.execute(
        """
        SELECT
            strftime('%Y-%m-%d %H:00', ts / 1000, 'unixepoch') AS hour,
            decision,
            COUNT(*) as cnt
        FROM event_log
        WHERE ts IS NOT NULL
          AND ts >= ?
          AND ts <= ?
        GROUP BY hour, decision
        ORDER BY hour ASC
        """,
        (last_24h_ms, now_ms),
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
          AND ts IS NOT NULL
          AND ts <= ?
        GROUP BY bucket
        """,
        (now_ms,),
    )

    risk_distribution = {"low": 0, "medium": 0, "high": 0}
    for row in cursor.fetchall():
        risk_distribution[row["bucket"]] = row["cnt"]

    # -------------------------
    # Risk drift
    # -------------------------
    cursor.execute(
        """
        SELECT AVG(risk) FROM event_log
        WHERE ts IS NOT NULL
          AND ts >= ?
          AND ts <= ?
        """,
        (last_24h_ms, now_ms),
    )
    avg_risk_24h = cursor.fetchone()[0] or 0.0

    cursor.execute("SELECT AVG(risk) FROM event_log")
    avg_risk_all = cursor.fetchone()[0] or 0.0

    risk_drift = round(avg_risk_all - avg_risk_24h, 2)

    # -------------------------
    # Top risky entities
    # -------------------------
    cursor.execute(
        """
        SELECT entity, MAX(risk) as max_risk
        FROM event_log
        WHERE ts IS NOT NULL
          AND ts <= ?
        GROUP BY entity
        ORDER BY max_risk DESC
        LIMIT 5
        """,
        (now_ms,),
    )

    top_entities = [
        {"entity": row["entity"], "risk": row["max_risk"]}
        for row in cursor.fetchall()
    ]

    # -------------------------
    # Threat feed
    # -------------------------
    cursor.execute(
        """
        SELECT entity, decision, risk, endpoint, ts
        FROM event_log
        WHERE decision = 'BLOCK'
          AND ts IS NOT NULL
          AND ts <= ?
        ORDER BY ts DESC
        LIMIT 10
        """,
        (now_ms,),
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
        "risk_drift": {
            "avg_24h": round(avg_risk_24h, 2),
            "avg_all_time": round(avg_risk_all, 2),
            "delta": risk_drift,
        },
        "timeline": timeline,
        "risk_distribution": risk_distribution,
        "top_entities": top_entities,
        "threat_feed": threat_feed,
        "generated_at": now_ms,
    }


# =========================================================
# SYSTEM HEALTH (CANONICAL)
# =========================================================
@router.get("/health")
def system_health():
    """
    Lightweight backend health signal.
    """
    try:
        conn = get_conn()
        cursor = conn.cursor()

        if not table_exists(cursor, "event_log"):
            conn.close()
            return {
                "status": "ok",
                "db": "reachable",
                "last_event_age_sec": None,
                "generated_at": int(datetime.utcnow().timestamp() * 1000),
            }

        cursor.execute(
            """
            SELECT MAX(ts) FROM event_log
            WHERE ts IS NOT NULL AND ts <= ?
            """,
            (int(datetime.utcnow().timestamp() * 1000),),
        )
        last_event_ts = cursor.fetchone()[0]

        conn.close()

        now_ms = int(datetime.utcnow().timestamp() * 1000)

        freshness_sec = (
            (now_ms - last_event_ts) / 1000
            if last_event_ts else None
        )

        return {
            "status": "ok",
            "db": "reachable",
            "last_event_age_sec": freshness_sec,
            "generated_at": now_ms,
        }

    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e),
        }
