from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from datetime import datetime

from detection.shared import rules_manager# ✅ SHARED INSTANCE

router = APIRouter(prefix="/rules", tags=["rules"])


def normalize_rules(raw_rules: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Convert internal rule manager state into frontend-safe rule objects.
    """
    normalized = []

    now_ts = int(datetime.utcnow().timestamp())

    for name, rule in raw_rules.items():
        normalized.append({
            "name": name,
            "entity": rule.get("entity", "unknown"),
            "threshold": rule.get("threshold", 0),
            "confidence": rule.get("confidence", 0.0),
            "decay": rule.get("decay", "n/a"),
            "window": rule.get("window", "n/a"),
            "last_triggered": rule.get("last_triggered"),
            "trigger_count": rule.get("trigger_count", 0),
            "status": rule.get("status", "quiet"),
            "version": rule.get("version", "v2"),
            "loaded": rule.get("enabled", False),
        })

    return normalized


@router.get("/")
def list_rules() -> Dict[str, Any]:
    """
    List all detection rules with their status and thresholds.
    Frontend-safe normalized response.
    """
    raw_rules = rules_manager.get_all_rules()

    return {
        "rules": normalize_rules(raw_rules)
    }


@router.post("/enable/{rule_name}")
def enable_rule(rule_name: str):
    """
    Enable a detection rule.
    """
    if not rules_manager.rule_exists(rule_name):
        raise HTTPException(status_code=404, detail="Rule not found")

    rules_manager.enable(rule_name)

    return {
        "status": "enabled",
        "rule": rule_name
    }


@router.post("/disable/{rule_name}")
def disable_rule(rule_name: str):
    """
    Disable a detection rule.
    """
    if not rules_manager.rule_exists(rule_name):
        raise HTTPException(status_code=404, detail="Rule not found")

    rules_manager.disable(rule_name)

    return {
        "status": "disabled",
        "rule": rule_name
    }


@router.post("/threshold/{rule_name}")
def update_threshold(rule_name: str, payload: Dict[str, Any]):
    """
    Update threshold for a detection rule.
    """
    if not rules_manager.rule_exists(rule_name):
        raise HTTPException(status_code=404, detail="Rule not found")

    if "threshold" not in payload:
        raise HTTPException(status_code=400, detail="Missing threshold")

    try:
        threshold = float(payload["threshold"])
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid threshold")

    rules_manager.update_threshold(rule_name, threshold)

    return {
        "status": "updated",
        "rule": rule_name,
        "threshold": threshold
    }
