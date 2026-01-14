from typing import Dict, Any

from detection.sliding_window import SlidingWindow
from detection.risk_engine import RiskEngine


class StateStore:
    """
    Central in-memory state store (v2).

    Responsibilities:
    - Sliding windows for signals
    - Active signal deduplication
    - Risk engine coordination
    """

    def __init__(self):
        self.ip_failure_window = SlidingWindow(60_000)      # 60 seconds
        self.ip_user_window = SlidingWindow(300_000)        # 5 minutes
        self.user_ip_window = SlidingWindow(300_000)        # 5 minutes


        self.active_signals: Dict[str, Dict[str, bool]] = {}
        self.risk_engine = RiskEngine()

    # -------------------------
    # Sliding windows
    # -------------------------

    def get_ip_failure_window(self) -> SlidingWindow:
        return self.ip_failure_window

    def get_ip_user_window(self) -> SlidingWindow:
        return self.ip_user_window

    def get_user_ip_window(self) -> SlidingWindow:
        return self.user_ip_window

    # -------------------------
    # Signal deduplication
    # -------------------------

    def is_signal_active(self, signal_id: str, entity: str) -> bool:
        return self.active_signals.get(signal_id, {}).get(entity, False)

    def mark_signal_active(self, signal_id: str, entity: str):
        if signal_id not in self.active_signals:
            self.active_signals[signal_id] = {}
        self.active_signals[signal_id][entity] = True

    # -------------------------
    # Risk engine
    # -------------------------

    def get_risk_engine(self) -> RiskEngine:
        return self.risk_engine
