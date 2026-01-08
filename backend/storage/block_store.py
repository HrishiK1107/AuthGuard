import json
from pathlib import Path
from typing import Dict, Any

BLOCKS_FILE = Path(__file__).resolve().parent / "active_blocks.json"


def load_blocks() -> Dict[str, Any]:
    """
    Load all active blocks with telemetry.
    """
    if BLOCKS_FILE.exists():
        try:
            with open(BLOCKS_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {}

    save_blocks({})
    return {}


def save_blocks(blocks: Dict[str, Any]):
    """
    Persist active blocks to disk.
    """
    with open(BLOCKS_FILE, "w") as f:
        json.dump(blocks, f, indent=2)
