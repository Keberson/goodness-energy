from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Event, EventTag, EventAttachment
from app.schemas import EventResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("", response_model=List[EventResponse])
async def get_all_events(
    city: Optional[str] = Query(None, description="Фильтр по городу"),
    db: Session = Depends(get_db)
):
    """Получение всех событий с опциональной фильтрацией по городу"""
    logger.info(f"Получен запрос на события с параметром city: {city}")
    query = db.query(Event)
    
    if city:
        logger.info(f"Фильтрация событий по городу: {city}")
        query = query.filter(Event.city == city)
    
    events = query.order_by(Event.created_at.desc()).all()
    
    result = []
    for event in events:
        tags = [t.tag for t in event.tags]
        attached_ids = [a.file_id for a in event.attachments]
        
        result.append(EventResponse(
            id=event.id,
            npo_id=event.npo_id,
            name=event.name,
            description=event.description,
            start=event.start,
            end=event.end,
            coordinates=[float(event.coordinates_lat), float(event.coordinates_lon)] if event.coordinates_lat is not None and event.coordinates_lon is not None else None,
            quantity=event.quantity,
            status=event.status,
            tags=tags,
            city=event.city,
            attachedIds=attached_ids,
            created_at=event.created_at
        ))
    
    return result

