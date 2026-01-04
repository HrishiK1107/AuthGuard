import time
from typing import Dict


class RiskEngine:
    """
    Aggregates signal scores over time and applies decay.
    """

    def __init__(self, decay_rate_per_sec: float = 0.1):
        """
        decay_rate_per_sec:
        How much risk decays every second.
        Example: 0.1 means 10% per second.
        """
        self.decay_rate = decay_rate_per_sec
        self.risk_store: Dict[str, Dict[str, float]] = {}

    def add_signal(self, key: str, score: float, timestamp: int) -> None:
        """
        Add signal score for a given entity (IP, user, etc.)
        """
        now_sec = timestamp / 1000

        if key not in self.risk_store:
            self.risk_store[key] = {
                "score": 0.0,
                "last_updated": now_sec
            }

        self._apply_decay(key, now_sec)
        self.risk_store[key]["score"] += score

    def get_risk(self, key: str, timestamp: int) -> float:
        """
        Get current risk score for a key.
        """
        if key not in self.risk_store:
            return 0.0

        now_sec = timestamp / 1000
        self._apply_decay(key, now_sec)

        return self.risk_store[key]["score"]

    def _apply_decay(self, key: str, now_sec: float) -> None:
        """
        Reduce risk score based on time passed.
        """
        entry = self.risk_store[key]
        elapsed = now_sec - entry["last_updated"]

        if elapsed <= 0:
            return

        decay_amount = elapsed * self.decay_rate
        entry["score"] = max(0.0, entry["score"] - decay_amount)
        entry["last_updated"] = now_sec
