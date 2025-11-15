from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import NPO, Event, EventStatus
from app.schemas import NPOMapPoint, NPOResponse
import json

router = APIRouter()

@router.get("/npo", response_model=List[NPOMapPoint])
async def get_map_npo(db: Session = Depends(get_db)):
    """Карта с точками НКО"""
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
                timetable=npo.timetable,
                galleryIds=gallery_ids,
                tags=tags,
                links=json.loads(npo.links) if npo.links else None,
                vacancies=active_events_count,
                created_at=npo.created_at
            )
            
            result.append(NPOMapPoint(
                coordinates=[float(npo.coordinates_lat), float(npo.coordinates_lon)],
                info=info
            ))
    
    return result

