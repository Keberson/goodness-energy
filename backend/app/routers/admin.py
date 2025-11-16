from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import NPO, NPOStatus, User, NPOGallery, NPOTag, Event, EventTag, EventResponse as EventResponseModel, NPOCity
from app.schemas import NPOStatusUpdate, NPOResponse, EventResponse
from app.auth import get_current_admin_user
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/npo/unconfirmed", response_model=List[NPOResponse], tags=["provide"])
async def get_unconfirmed_npos(
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Получение списка неподтвержденных НКО"""
    npos = db.query(NPO).filter(NPO.status == NPOStatus.NOT_CONFIRMED).order_by(NPO.created_at.desc()).all()
    
    result = []
    for npo in npos:
        gallery_ids = [g.file_id for g in npo.gallery]
        tags = [t.tag for t in npo.tags]
        
        # Подсчет активных событий
        active_events_count = db.query(Event).filter(
            Event.npo_id == npo.id,
            Event.status.in_(["draft", "published"])
        ).count()
        
        result.append(NPOResponse(
            id=npo.id,
            name=npo.name,
            description=npo.description,
            coordinates=[float(npo.coordinates_lat), float(npo.coordinates_lon)] if npo.coordinates_lat is not None and npo.coordinates_lon is not None else None,
            address=npo.address,
            city=NPOCity(npo.city) if npo.city else NPOCity.ANGARSK,
            timetable=npo.timetable,
            galleryIds=gallery_ids,
            tags=tags,
            links=json.loads(npo.links) if npo.links else None,
            vacancies=active_events_count,
            status=npo.status if npo.status is not None else NPOStatus.NOT_CONFIRMED,
            created_at=npo.created_at
        ))
    
    return result

@router.patch("/npo/{npo_id}/status", tags=["validate"])
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

@router.delete("/npo/{npo_id}", tags=["validate"])
async def delete_npo(
    npo_id: int,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Удаление НКО администратором"""
    npo = db.query(NPO).filter(NPO.id == npo_id).first()
    if not npo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="НКО не найдена"
        )
    
    # Сохраняем user_id перед удалением НКО
    user_id = npo.user_id
    
    # Удаляем НКО (каскадно удалятся связанные записи: галерея, теги, события, новости)
    db.delete(npo)
    db.flush()
    
    # Удаляем связанного пользователя
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
    
    db.commit()
    return {"message": "НКО успешно удалена"}

@router.delete("/event/{event_id}", tags=["validate"])
async def delete_event(
    event_id: int,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Удаление события администратором"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Событие не найдено"
        )
    
    db.delete(event)
    db.commit()
    return {"message": "Событие успешно удалено"}

