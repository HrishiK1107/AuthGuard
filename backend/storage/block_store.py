import json
import os
from typing import Dict, Any, List

# File-backed block store (simple, deterministic, v2-safe)
BLOCK_STORE_PATH = "backend/storage/blocks.json"


def _ensure_store_exists() -> None:
    """
    Ensure the block store file exists.
    """
    if not os.path.exists(BLOCK_STORE_PATH):
        with open(BLOCK_STORE_PATH, "w") as f:
            json.dump([], f)


def load_blocks() -> List[Dict[str, Any]]:
    """
    Load active blocks from disk.
    Returns a list of block dicts.
    """
    _ensure_store_exists()

    try:
        with open(BLOCK_STORE_PATH, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        # Fail-safe: return empty list instead of crashing
        return []


def save_blocks(blocks: List[Dict[str, Any]]) -> None:
    """
    Persist blocks to disk.
    """
    _ensure_store_exists()

    with open(BLOCK_STORE_PATH, "w") as f:
        json.dump(blocks, f, indent=2)
