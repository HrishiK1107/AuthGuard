import json
import os
from typing import Dict, Any
from pathlib import Path
import time

CAMPAIGN_FILE = Path(__file__).parent / "campaigns.json"


def _load() -> Dict[str, Any]:
    if not CAMPAIGN_FILE.exists():
        return {}
    with open(CAMPAIGN_FILE, "r") as f:
        return json.load(f)


def _save(data: Dict[str, Any]) -> None:
    with open(CAMPAIGN_FILE, "w") as f:
        json.dump(data, f, indent=2)


def _normalize_ts(ts: int) -> int:
    """
    Frontend expects seconds, not ms.
    """
    if ts > 10_000_000_000:
        return int(ts / 1000)
    return ts


def upsert_campaign(
    campaign_id: str,
    campaign_type: str,
    entity: str,
    signal_id: str,
    risk_score: float,
    timestamp: int,
    metadata: Dict[str, Any],
):
    campaigns = _load()
    ts = _normalize_ts(timestamp)

    if campaign_id not in campaigns:
        campaigns[campaign_id] = {
            "id": campaign_id,                 # frontend alias
            "campaign_id": campaign_id,
            "primary_vector": campaign_type,
            "start": ts,
            "last_seen": ts,
            "events": 0,
            "entities": [],
            "signals": {},
            "risk": 0.0,
            "risk_score": 0.0,                  # frontend alias
            "decisions": {
                "ALLOW": 0,
                "CHALLENGE": 0,
                "BLOCK": 0,
            },
            "state": "ACTIVE",
        }

    c = campaigns[campaign_id]

    c["last_seen"] = ts
    c["events"] += 1
    c["risk"] = max(c["risk"], risk_score)
    c["risk_score"] = c["risk"]

    if entity not in c["entities"]:
        c["entities"].append(entity)

    c["signals"][signal_id] = c["signals"].get(signal_id, 0) + 1

    decision = metadata.get("decision")
    if decision in c["decisions"]:
        c["decisions"][decision] += 1

    _save(campaigns)


def list_campaigns():
    return list(_load().values())
