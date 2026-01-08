import json
from pathlib import Path
from typing import Dict

SETTINGS_FILE = Path(__file__).resolve().parent / "settings.json"


DEFAULT_SETTINGS: Dict = {
    "mode": "fail-open",
    "enforcement_timeout_seconds": 1,
    "block_ttl_seconds": 300,
    "rate_limiter": {
        "type": "token-bucket",
        "language": "go",
        "port": 8081
    }
}


def load_settings() -> Dict:
    """
    Load settings from disk or return defaults.
    """
    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r") as f:
                return json.load(f)
        except Exception:
            # Corrupt file fallback
            return DEFAULT_SETTINGS.copy()

    save_settings(DEFAULT_SETTINGS)
    return DEFAULT_SETTINGS.copy()


def save_settings(settings: Dict):
    """
    Persist settings to disk.
    """
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings, f, indent=2)
