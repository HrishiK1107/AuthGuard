from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import os

# ==========================
# FIXED IMPORTS (Docker-safe)
# ==========================
from api import campaigns
from api.logs import router as logs_router
from api.rules import router as rules_router
from api.blocks import router as blocks_router
from api.dashboard import router as dashboard_router, system_health
from api.settings import router as settings_router
from api.simulator import router as simulator_router

from detection.event_processor import EventProcessor
from storage.block_store import load_blocks

# ==========================
# Create FastAPI app FIRST
# ==========================
app = FastAPI(
    title="AuthGuard",
    description="Behavior-based authentication abuse detection system",
    version="2.0"
)

# ==========================
# CORS
# ==========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Enforcer URL (Docker-safe)
# ==========================
ENFORCER_URL = os.getenv("ENFORCER_URL", "http://localhost:8081")

# ==========================
# REPLAY BLOCKS ON STARTUP (v2)
# ==========================
@app.on_event("startup")
def replay_blocks():
    """
    Replays active blocks to the Go enforcer on backend restart.

    Fail-open by design:
    - Never block startup
    - Skip malformed entries
    """
    blocks = load_blocks()

    for block in blocks:
        if not block.get("active", True):
            continue

        entity = block.get("entity")
        ttl = block.get("ttl_seconds")

        if not entity or not ttl:
            continue

        try:
            requests.post(
                f"{ENFORCER_URL}/enforce",
                json={
                    "entity": entity,
                    "decision": "BLOCK",
                    "ttl_seconds": ttl,
                },
                timeout=1,
            )
        except Exception:
            # Fail-open on startup by design
            pass

# ==========================
# Detection Engine (singleton)
# ==========================
event_processor = EventProcessor()

# ==========================
# Routers
# ==========================
app.include_router(logs_router)
app.include_router(rules_router)
app.include_router(blocks_router)
app.include_router(dashboard_router)
app.include_router(settings_router)
app.include_router(simulator_router)
app.include_router(campaigns.router)

# ==========================
# Health
# ==========================
@app.get("/health")
def health_check():
    """
    Basic health check endpoint.
    """
    return {
        "status": "ok",
        "service": "authguard",
        "version": "v2"
    }


@app.get("/health/summary")
def health_summary_root():
    """
    Root-level health summary for frontend compatibility.
    """
    return system_health()
