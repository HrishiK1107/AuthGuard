import time
from typing import Dict


class ReplayGuard:
    """
    Prevents replay / duplicate processing of events.

    Uses an in-memory TTL cache keyed by event fingerprint.
    """

    def __init__(self, ttl_seconds: int = 300):
        """
        ttl_seconds:
            How long an event fingerprint is considered "seen".
        """
        self.ttl_seconds = ttl_seconds
        self._seen: Dict[str, int] = {}

    def _evict(self, now_ts: int) -> None:
        """
        Evict expired fingerprints.
        """
        expired = [
            key for key, ts in self._seen.items()
            if ts < now_ts - self.ttl_seconds
        ]
        for key in expired:
            del self._seen[key]

    def seen_before(self, fingerprint: str, now_ts: int | None = None) -> bool:
        """
        Check if fingerprint has been seen recently.
        """
        if now_ts is None:
            now_ts = int(time.time())

        self._evict(now_ts)
        return fingerprint in self._seen

    def mark_seen(self, fingerprint: str, now_ts: int | None = None) -> None:
        """
        Mark fingerprint as processed.
        """
        if now_ts is None:
            now_ts = int(time.time())

        self._evict(now_ts)
        self._seen[fingerprint] = now_ts

    def clear(self) -> None:
        """
        Clear all cached fingerprints (tests / maintenance).
        """
        self._seen.clear()
