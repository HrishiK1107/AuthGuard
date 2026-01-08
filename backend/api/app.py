from fastapi import FastAPI
from backend.detection.event_processor import EventProcessor
from backend.api.logs import router as logs_router
from backend.api.rules import router as rules_router
from backend.api.blocks import router as blocks_router
from backend.api.dashboard import router as dashboard_router
from backend.api.settings import router as settings_router
from backend.api.simulator import router as simulator_router
from backend.storage.block_store import load_blocks
import requests

# Create FastAPI app FIRST
app = FastAPI(
    title="AuthGuard",
    description="Behavior-based authentication abuse detection system",
    version="1.0"
)

# ==========================
# REPLAY BLOCKS ON STARTUP
# ==========================
@app.on_event("startup")
def replay_blocks():
    blocks = load_blocks()

    for entity, ttl in blocks.items():
        try:
            requests.post(
                "http://localhost:8081/enforce",
                json={
                    "entity": entity,
                    "decision": "BLOCK",
                    "ttl_seconds": ttl
                },
                timeout=1
            )
        except Exception:
            # Fail-open on startup
            pass
        
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize detection engine ONCE
event_processor = EventProcessor()

# Register routers AFTER app creation
app.include_router(logs_router)
app.include_router(rules_router)
app.include_router(blocks_router)
app.include_router(dashboard_router)
app.include_router(settings_router)
app.include_router(simulator_router)

@app.get("/health")
def health_check():
    """
    Basic health check endpoint.
    Used by load balancers, Docker, Kubernetes, etc.
    """
    return {
        "status": "ok",
        "service": "authguard"
    }
