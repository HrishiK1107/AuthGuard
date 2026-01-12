from collections import deque
from typing import Deque, Dict, Any, List, Callable


class SlidingWindow:
    """
    Generic time-based sliding window.

    Stores events ordered by timestamp.
    Eviction happens on every read/write.
    """

    def __init__(self, window_size_sec: int):
        self.window_size_sec = window_size_sec
        self._events: Deque[Dict[str, Any]] = deque()

    def _evict(self, current_ts: int) -> None:
        """
        Evict events older than window.
        """
        cutoff = current_ts - self.window_size_sec
        while self._events and self._events[0]["ts"] < cutoff:
            self._events.popleft()

    def add(self, event: Dict[str, Any]) -> None:
        """
        Add a new event.
        Event MUST contain 'ts'.
        """
        ts = event["ts"]
        self._events.append(event)
        self._evict(ts)

    def values(self, current_ts: int) -> List[Dict[str, Any]]:
        """
        Return all events currently in window.
        """
        self._evict(current_ts)
        return list(self._events)

    def count(self, current_ts: int) -> int:
        """
        Count events in window.
        """
        self._evict(current_ts)
        return len(self._events)

    def aggregate(
        self,
        current_ts: int,
        predicate: Callable[[Dict[str, Any]], bool],
    ) -> int:
        """
        Count events matching predicate.
        """
        self._evict(current_ts)
        return sum(1 for e in self._events if predicate(e))

    def clear(self) -> None:
        """
        Explicit reset (rare; operator / test use).
        """
        self._events.clear()


class EntityWindowStore:
    """
    Maintains sliding windows per entity.
    """

    def __init__(self, window_size_sec: int):
        self.window_size_sec = window_size_sec
        self._windows: Dict[str, SlidingWindow] = {}

    def _get_window(self, entity_id: str) -> SlidingWindow:
        if entity_id not in self._windows:
            self._windows[entity_id] = SlidingWindow(self.window_size_sec)
        return self._windows[entity_id]

    def add_event(self, entity_id: str, event: Dict[str, Any]) -> None:
        window = self._get_window(entity_id)
        window.add(event)

    def get_events(self, entity_id: str, current_ts: int) -> List[Dict[str, Any]]:
        window = self._get_window(entity_id)
        return window.values(current_ts)

    def count(self, entity_id: str, current_ts: int) -> int:
        window = self._get_window(entity_id)
        return window.count(current_ts)

    def aggregate(
        self,
        entity_id: str,
        current_ts: int,
        predicate: Callable[[Dict[str, Any]], bool],
    ) -> int:
        window = self._get_window(entity_id)
        return window.aggregate(current_ts, predicate)

    def clear_entity(self, entity_id: str) -> None:
        if entity_id in self._windows:
            self._windows[entity_id].clear()
