import math
from typing import Dict


class RiskEngine:
    """
    Risk Engine v2

    - Entity-aware
    - Exponential decay
    - Deterministic cooling
    """

    def __init__(
        self,
        half_life_sec: int = 300,
        max_risk: float = 100.0,
    ):
        """
        half_life_sec:
            Time for risk to reduce by 50%

        max_risk:
            Upper bound for risk per entity
        """
        self.half_life_sec = half_life_sec
        self.max_risk = max_risk

        # key -> { score, last_updated }
        self.risk_store: Dict[str, Dict[str, float]] = {}

    def add_signal(self, key: str, score: float, timestamp: int) -> None:
        """
        Add signal score for an entity.
        """
        now_sec = timestamp / 1000

        if key not in self.risk_store:
            self.risk_store[key] = {
                "score": 0.0,
                "last_updated": now_sec
            }

        self._apply_decay(key, now_sec)

        new_score = self.risk_store[key]["score"] + score
        self.risk_store[key]["score"] = min(self.max_risk, new_score)

    def get_risk(self, key: str, timestamp: int) -> float:
        """
        Get current risk score for an entity.
        """
        if key not in self.risk_store:
            return 0.0

        now_sec = timestamp / 1000
        self._apply_decay(key, now_sec)

        return self.risk_store[key]["score"]

    def _apply_decay(self, key: str, now_sec: float) -> None:
        """
        Apply exponential decay to risk score.
        """
        entry = self.risk_store[key]
        elapsed = now_sec - entry["last_updated"]

        if elapsed <= 0:
            return

        # Exponential decay formula:
        # score = score * (0.5 ^ (elapsed / half_life))
        decay_factor = math.pow(0.5, elapsed / self.half_life_sec)

        entry["score"] *= decay_factor
        entry["last_updated"] = now_sec
