from fastapi import APIRouter
from datetime import datetime
from storage.campaign_store import list_campaigns

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.get("/")
def get_campaigns():
    """
    Campaigns V2 API (frontend-safe).

    Guarantees:
    - Always returns { campaigns: [] }
    - Normalized enum casing
    - Unix timestamps in seconds
    - Empty-safe
    """

    raw_campaigns = list_campaigns() or []

    campaigns = []

    for c in raw_campaigns:
        campaigns.append(
            {
                "campaign_id": c.get("campaign_id"),
                "entity": c.get("entity"),
                "decision": (
                    c.get("decision").upper()
                    if c.get("decision")
                    else "UNKNOWN"
                ),
                "risk_score": c.get("risk_score", 0),
                "signals": c.get("signals", []),
                "start_ts": (
                    int(c["start_ts"] / 1000)
                    if c.get("start_ts")
                    else None
                ),
                "last_seen_ts": (
                    int(c["last_seen_ts"] / 1000)
                    if c.get("last_seen_ts")
                    else None
                ),
            }
        )

    return {
        "campaigns": campaigns
    }
