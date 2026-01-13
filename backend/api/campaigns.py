from fastapi import APIRouter

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.get("")
@router.get("/")
def list_campaigns():
    """
    Temporary stub for v2.
    Frontend-safe empty response.
    """
    return []
