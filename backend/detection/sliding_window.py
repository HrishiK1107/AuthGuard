from collections import deque
from typing import Deque, Dict


class SlidingWindow:
    """
    Maintains time-based sliding windows per key (IP, user, device, etc.)
    """

    def __init__(self, window_size_ms: int):
        """
        window_size_ms: how long the window remembers events (in milliseconds)
        """
        self.window_size_ms = window_size_ms
        self.store: Dict[str, Deque[int]] = {}

    def add_event(self, key: str, timestamp: int) -> None:
        """
        Add a new event timestamp for a given key.
        Automatically evicts old events.
        """
        if key not in self.store:
            self.store[key] = deque()

        window = self.store[key]
        window.append(timestamp)

        self._evict_old(window, timestamp)

    def count(self, key: str, current_time: int) -> int:
        """
        Return number of events in the window for this key.
        """
        if key not in self.store:
            return 0

        window = self.store[key]
        self._evict_old(window, current_time)

        return len(window)

    def _evict_old(self, window: Deque[int], current_time: int) -> None:
        """
        Remove timestamps older than the window.
        """
        cutoff = current_time - self.window_size_ms

        while window and window[0] < cutoff:
            window.popleft()
