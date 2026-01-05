from fastapi import FastAPI
from backend.detection.event_processor import EventProcessor
from backend.api.logs import router as logs_router

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
