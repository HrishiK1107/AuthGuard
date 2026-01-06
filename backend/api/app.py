from fastapi import FastAPI
from backend.detection.event_processor import EventProcessor
from backend.api.logs import router as logs_router
from backend.api.rules import router as rules_router
from backend.api.blocks import router as blocks_router
from backend.api.dashboard import router as dashboard_router
from backend.api.settings import router as settings_router
from backend.api.simulator import router as simulator_router


# Create FastAPI app FIRST
app = FastAPI(
    title="AuthGuard",
    description="Behavior-based authentication abuse detection system",
    version="1.0"
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
