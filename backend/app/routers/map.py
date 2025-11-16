from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import NPO, Event, EventStatus, NPOStatus, NPOCity
from app.schemas import NPOMapPoint, NPOResponse
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

def safe_parse_city(city_str: str) -> NPOCity:
    """Безопасное преобразование строки города в enum"""
    if not city_str:
        return NPOCity.ANGARSK
    try:
        # Пробуем найти значение в enum по значению
        for city_enum in NPOCity:
            if city_enum.value == city_str:
                return city_enum
        # Если не найдено, возвращаем значение по умолчанию
        logger.warning(f"Город '{city_str}' не найден в enum NPOCity, используется ANGARSK")
        return NPOCity.ANGARSK
    except Exception as e:
        logger.error(f"Ошибка при преобразовании города '{city_str}': {e}")
        return NPOCity.ANGARSK

def safe_parse_json(json_str: str) -> dict:
    """Безопасный парсинг JSON"""
    if not json_str:
        return None
    try:
        return json.loads(json_str)
    except (json.JSONDecodeError, TypeError) as e:
        logger.error(f"Ошибка при парсинге JSON '{json_str}': {e}")
        return None

@router.get("/npo", response_model=List[NPOMapPoint])
async def get_map_npo(db: Session = Depends(get_db)):
    """Карта с точками НКО"""
    try:
        npos = db.query(NPO).all()
        result = []
        
        for npo in npos:
            if npo.coordinates_lat is not None and npo.coordinates_lon is not None:
                gallery_ids = [g.file_id for g in npo.gallery]
                tags = [t.tag for t in npo.tags]
                active_events_count = db.query(Event).filter(
                    Event.npo_id == npo.id,
                    Event.status == EventStatus.PUBLISHED
                ).count()
                
                info = NPOResponse(
                    id=npo.id,
                    name=npo.name,
                    description=npo.description,
                    coordinates=[float(npo.coordinates_lat), float(npo.coordinates_lon)],
                    address=npo.address,
                    city=safe_parse_city(npo.city),
                    timetable=npo.timetable,
                    galleryIds=gallery_ids,
                    tags=tags,
                    links=safe_parse_json(npo.links),
                    vacancies=active_events_count,
                    status=npo.status if npo.status is not None else NPOStatus.NOT_CONFIRMED,
                    created_at=npo.created_at
                )
                
                result.append(NPOMapPoint(
                    coordinates=[float(npo.coordinates_lat), float(npo.coordinates_lon)],
                    info=info
                ))
        
        return result
    except Exception as e:
        logger.error(f"Ошибка в get_map_npo: {e}", exc_info=True)
        raise

