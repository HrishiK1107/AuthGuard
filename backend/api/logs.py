from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from backend.detection.event_processor import EventProcessor

router = APIRouter()

# Single shared processor instance
event_processor = EventProcessor()


@router.post("/events/auth")
def ingest_auth_event(raw_event: Dict[str, Any]):
    """
    Ingest an authentication event and return a security decision.
    """
    try:
        result = event_processor.process(raw_event)
        return {
            "status": "processed",
            "result": result
        }
    except Exception as e:
        # Validation or processing error
        raise HTTPException(status_code=400, detail=str(e))
