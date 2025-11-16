from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Event, EventTag
from app.schemas import EventResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("", response_model=List[EventResponse])
async def get_all_events(db: Session = Depends(get_db)):
    """Получение всех событий"""
    events = db.query(Event).order_by(Event.created_at.desc()).all()
    
    result = []
    for event in events:
        tags = [t.tag for t in event.tags]
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
            created_at=event.created_at
        ))
    
    return result

