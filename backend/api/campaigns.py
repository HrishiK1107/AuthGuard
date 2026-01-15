from fastapi import APIRouter
from storage.campaign_store import list_campaigns

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.get("/")
def get_campaigns():
    return {
        "campaigns": list_campaigns()
    }
