from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from app.database import get_db
from app.models import NPO, Event, EventStatus, NPOStatus, NPOCity, CityCoordinates
from app.schemas import NPOMapPoint, NPOResponse, CityCoordinatesResponse
import json

router = APIRouter()

@router.get("/cities", response_model=List[str])
async def get_cities():
    """Получить список всех доступных городов"""
    return [city.value for city in NPOCity]

@router.get("/npo", response_model=List[NPOMapPoint])
async def get_map_npo(
    city: Optional[str] = Query(None, description="Фильтр по городу"),
    db: Session = Depends(get_db)
):
    """Карта с точками НКО с опциональной фильтрацией по городу"""
    query = db.query(NPO).filter(NPO.status == NPOStatus.CONFIRMED)
    
    if city:
        query = query.filter(NPO.city == city)
    
    npos = query.all()
    
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
                page_content=npo.page_content,
                coordinates=[float(npo.coordinates_lat), float(npo.coordinates_lon)],
                address=npo.address,
                city=NPOCity(npo.city) if npo.city else NPOCity.ANGARSK,
                timetable=npo.timetable,
                galleryIds=gallery_ids,
                tags=tags,
                links=json.loads(npo.links) if npo.links else None,
                vacancies=active_events_count,
                status=npo.status if npo.status is not None else NPOStatus.NOT_CONFIRMED,
                created_at=npo.created_at
            )
            
            result.append(NPOMapPoint(
                coordinates=[float(npo.coordinates_lat), float(npo.coordinates_lon)],
                info=info
            ))
    
    return result

@router.get("/city-coordinates", response_model=Dict[str, CityCoordinatesResponse])
async def get_city_coordinates(
    db: Session = Depends(get_db)
):
    """Получить координаты всех городов"""
    cities = db.query(CityCoordinates).all()
    result = {}
    
    for city in cities:
        result[city.city_name] = CityCoordinatesResponse(
            city_name=city.city_name,
            center=[city.center_lat, city.center_lon],
            zoom=city.zoom
        )
    
    return result

@router.get("/city-coordinates/{city_name}", response_model=CityCoordinatesResponse)
async def get_city_coordinate(
    city_name: str,
    db: Session = Depends(get_db)
):
    """Получить координаты конкретного города"""
    city = db.query(CityCoordinates).filter(CityCoordinates.city_name == city_name).first()
    
    if not city:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Координаты для города '{city_name}' не найдены")
    
    return CityCoordinatesResponse(
        city_name=city.city_name,
        center=[city.center_lat, city.center_lon],
        zoom=city.zoom
    )

