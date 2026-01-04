from typing import Dict
from backend.detection.sliding_window import SlidingWindow
from backend.detection.risk_engine import RiskEngine


class StateStore:
    """
    Central in-memory state holder for detection system.
    """

    def __init__(self):
        # Sliding windows
        self.ip_failure_window = SlidingWindow(window_size_ms=60_000)
        self.ip_user_window = SlidingWindow(window_size_ms=60_000)
        self.user_ip_window = SlidingWindow(window_size_ms=60_000)

        # Risk engine
        self.risk_engine = RiskEngine(decay_rate_per_sec=0.5)

    def get_ip_failure_window(self) -> SlidingWindow:
        return self.ip_failure_window

    def get_ip_user_window(self) -> SlidingWindow:
        return self.ip_user_window

    def get_user_ip_window(self) -> SlidingWindow:
        return self.user_ip_window

    def get_risk_engine(self) -> RiskEngine:
        return self.risk_engine
