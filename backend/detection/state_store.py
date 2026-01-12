from typing import Dict, Set, Tuple
from backend.detection.sliding_window import SlidingWindow
from backend.detection.risk_engine import RiskEngine


class StateStore:
    """
    Central in-memory state holder for detection system (v2).
    """

    def __init__(self):
        # Sliding windows
        self.ip_failure_window = SlidingWindow(window_size_ms=60_000)
        self.ip_user_window = SlidingWindow(window_size_ms=60_000)
        self.user_ip_window = SlidingWindow(window_size_ms=60_000)

        # Risk engine
        self.risk_engine = RiskEngine()

        # Signal activation tracking
        # (signal_id, entity) → active
        self.active_signals: Set[Tuple[str, str]] = set()

    # =========================
    # Windows
    # =========================

    def get_ip_failure_window(self) -> SlidingWindow:
        return self.ip_failure_window

    def get_ip_user_window(self) -> SlidingWindow:
        return self.ip_user_window

    def get_user_ip_window(self) -> SlidingWindow:
        return self.user_ip_window

    # =========================
    # Risk
    # =========================

    def get_risk_engine(self) -> RiskEngine:
        return self.risk_engine

    # =========================
    # Signal Deduplication
    # =========================

    def is_signal_active(self, signal_id: str, entity: str) -> bool:
        """
        Check whether a signal is already active for an entity.
        """
        return (signal_id, entity) in self.active_signals

    def mark_signal_active(self, signal_id: str, entity: str) -> None:
        """
        Mark a signal as active for an entity.
        """
        self.active_signals.add((signal_id, entity))

    def clear_signal(self, signal_id: str, entity: str) -> None:
        """
        Clear a signal when window cools (future use).
        """
        self.active_signals.discard((signal_id, entity))
