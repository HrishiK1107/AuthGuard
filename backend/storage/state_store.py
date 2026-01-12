from typing import Dict, Any, List
from backend.storage.event_log import fetch_events_for_entity
from backend.storage.window import EntityWindowStore


class StateStore:
    """
    Read-only state façade for Detection Engine (v2).

    Combines persistent event log with in-memory sliding windows.
    """

    def __init__(self, window_size_sec: int):
        self.window_size_sec = window_size_sec
        self._windows = EntityWindowStore(window_size_sec)

    def hydrate_entity(
        self,
        entity_id: str,
        current_ts: int,
    ) -> None:
        """
        Hydrate sliding window for entity from persistent store.
        Safe to call multiple times.
        """
        since_ts = current_ts - self.window_size_sec
        events = fetch_events_for_entity(entity_id, since_ts, current_ts)

        for event in events:
            self._windows.add_event(entity_id, event)

    def get_events(
        self,
        entity_id: str,
        current_ts: int,
    ) -> List[Dict[str, Any]]:
        """
        Get events in sliding window for entity.
        """
        return self._windows.get_events(entity_id, current_ts)

    def count(
        self,
        entity_id: str,
        current_ts: int,
    ) -> int:
        """
        Count events in sliding window.
        """
        return self._windows.count(entity_id, current_ts)

    def aggregate(
        self,
        entity_id: str,
        current_ts: int,
        predicate,
    ) -> int:
        """
        Aggregate events using predicate.
        """
        return self._windows.aggregate(entity_id, current_ts, predicate)

    def reset_entity(self, entity_id: str) -> None:
        """
        Explicit reset (tests / maintenance).
        """
        self._windows.clear_entity(entity_id)
