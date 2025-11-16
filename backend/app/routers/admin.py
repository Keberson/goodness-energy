from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import NPO
from app.schemas import NPOStatusUpdate
from app.auth import get_current_admin_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.patch("/npo/{npo_id}/status")
async def update_npo_status(
    npo_id: int,
    status_update: NPOStatusUpdate,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Изменение статуса НКО администратором"""
    npo = db.query(NPO).filter(NPO.id == npo_id).first()
    if not npo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="НКО не найдена"
        )
    
    npo.status = status_update.status
    db.commit()
    db.refresh(npo)
    
    return {"message": "Статус НКО успешно обновлен", "npo_id": npo.id, "status": npo.status.value}

