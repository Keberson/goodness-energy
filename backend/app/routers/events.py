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
    try:
        events = db.query(Event).order_by(Event.created_at.desc()).all()
        
        result = []
        for event in events:
            try:
                tags = [t.tag for t in event.tags]
                
                # Безопасное преобразование координат
                coordinates = None
                if event.coordinates_lat is not None and event.coordinates_lon is not None:
                    try:
                        coordinates = [float(event.coordinates_lat), float(event.coordinates_lon)]
                    except (ValueError, TypeError) as e:
                        logger.warning(f"Ошибка преобразования координат для события {event.id}: {e}")
                        coordinates = None
                
                result.append(EventResponse(
                    id=event.id,
                    npo_id=event.npo_id,
                    name=event.name,
                    description=event.description,
                    start=event.start,
                    end=event.end,
                    coordinates=coordinates,
                    quantity=event.quantity,
                    status=event.status,
                    tags=tags,
                    city=event.city if event.city else None,
                    created_at=event.created_at
                ))
            except Exception as e:
                logger.error(f"Ошибка при обработке события {event.id}: {e}", exc_info=True)
                # Пропускаем проблемное событие и продолжаем
                continue
        
        return result
    except Exception as e:
        logger.error(f"Ошибка в get_all_events: {e}", exc_info=True)
        raise

