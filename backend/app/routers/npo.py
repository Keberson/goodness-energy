from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import NPO, NPOGallery, NPOTag, Event, EventTag, News, NewsTag, NewsAttachment, EventStatus
from app.schemas import (
    NPOResponse, NPOMapPoint, NPOUpdate, EventCreate, EventUpdate, 
    EventResponse, EventStatusUpdate, NewsCreate, NewsResponse
)
from app.auth import get_current_npo_user, get_current_user
import json

router = APIRouter()

def get_npo_by_user_id(user_id: int, db: Session) -> NPO:
    npo = db.query(NPO).filter(NPO.user_id == user_id).first()
    if not npo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NPO not found"
        )
    return npo

@router.get("", response_model=List[NPOResponse])
async def get_all_npos(db: Session = Depends(get_db)):
    """Список всех организаций"""
    npos = db.query(NPO).all()
    result = []
    
    for npo in npos:
        gallery_ids = [g.file_id for g in npo.gallery]
        tags = [t.tag for t in npo.tags]
        active_events_count = db.query(Event).filter(
            Event.npo_id == npo.id,
            Event.status == EventStatus.PUBLISHED
        ).count()
        
        result.append(NPOResponse(
            id=npo.id,
            name=npo.name,
            description=npo.description,
            coordinates=[npo.coordinates_lat, npo.coordinates_lon] if npo.coordinates_lat and npo.coordinates_lon else None,
            address=npo.address,
            timetable=npo.timetable,
            galleryIds=gallery_ids,
            tags=tags,
            links=json.loads(npo.links) if npo.links else None,
            vacancies=active_events_count,
            created_at=npo.created_at
        ))
    
    return result

@router.put("/{npo_id}")
async def update_npo(
    npo_id: int,
    npo_update: NPOUpdate,
    current_user = Depends(get_current_npo_user),
    db: Session = Depends(get_db)
):
    """Обновление НКО"""
    npo = get_npo_by_user_id(current_user.id, db)
    
    if npo.id != npo_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own NPO"
        )
    
    if npo_update.name is not None:
        npo.name = npo_update.name
    if npo_update.description is not None:
        npo.description = npo_update.description
    if npo_update.timetable is not None:
        npo.timetable = npo_update.timetable
    if npo_update.links is not None:
        npo.links = json.dumps(npo_update.links)
    
    # Обновление галереи
    if npo_update.galleryIds is not None:
        # Удаляем старые записи
        db.query(NPOGallery).filter(NPOGallery.npo_id == npo.id).delete()
        # Добавляем новые
        for file_id in npo_update.galleryIds:
            gallery_item = NPOGallery(npo_id=npo.id, file_id=file_id)
            db.add(gallery_item)
    
    # Обновление тегов
    if npo_update.tags is not None:
        # Удаляем старые теги
        db.query(NPOTag).filter(NPOTag.npo_id == npo.id).delete()
        # Добавляем новые
        for tag in npo_update.tags:
            npo_tag = NPOTag(npo_id=npo.id, tag=tag)
            db.add(npo_tag)
    
    db.commit()
    return {"message": "NPO updated successfully"}

@router.delete("/{npo_id}")
async def delete_npo(
    npo_id: int,
    current_user = Depends(get_current_npo_user),
    db: Session = Depends(get_db)
):
    """Удаление НКО"""
    npo = get_npo_by_user_id(current_user.id, db)
    
    if npo.id != npo_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own NPO"
        )
    
    db.delete(npo)
    db.commit()
    return {"message": "NPO deleted successfully"}

# Event endpoints
@router.post("/{npo_id}/event", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    npo_id: int,
    event_data: EventCreate,
    current_user = Depends(get_current_npo_user),
    db: Session = Depends(get_db)
):
    """Создание события"""
    npo = get_npo_by_user_id(current_user.id, db)
    
    if npo.id != npo_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create events for your own NPO"
        )
    
    event = Event(
        npo_id=npo.id,
        name=event_data.name,
        description=event_data.description,
        start=event_data.start,
        end=event_data.end,
        coordinates_lat=event_data.coordinates[0] if event_data.coordinates else None,
        coordinates_lon=event_data.coordinates[1] if event_data.coordinates else None,
        quantity=event_data.quantity
    )
    db.add(event)
    db.flush()
    
    # Добавление тегов
    if event_data.tags:
        for tag in event_data.tags:
            event_tag = EventTag(event_id=event.id, tag=tag)
            db.add(event_tag)
    
    db.commit()
    db.refresh(event)
    
    tags = [t.tag for t in event.tags]
    return EventResponse(
        id=event.id,
        npo_id=event.npo_id,
        name=event.name,
        description=event.description,
        start=event.start,
        end=event.end,
        coordinates=[event.coordinates_lat, event.coordinates_lon] if event.coordinates_lat and event.coordinates_lon else None,
        quantity=event.quantity,
        status=event.status,
        tags=tags,
        created_at=event.created_at
    )

@router.put("/{npo_id}/event/{event_id}", response_model=EventResponse)
async def update_event(
    npo_id: int,
    event_id: int,
    event_update: EventUpdate,
    current_user = Depends(get_current_npo_user),
    db: Session = Depends(get_db)
):
    """Обновление события"""
    npo = get_npo_by_user_id(current_user.id, db)
    
    if npo.id != npo_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update events for your own NPO"
        )
    
    event = db.query(Event).filter(Event.id == event_id, Event.npo_id == npo.id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if event_update.name is not None:
        event.name = event_update.name
    if event_update.description is not None:
        event.description = event_update.description
    if event_update.start is not None:
        event.start = event_update.start
    if event_update.end is not None:
        event.end = event_update.end
    if event_update.coordinates is not None:
        event.coordinates_lat = event_update.coordinates[0]
        event.coordinates_lon = event_update.coordinates[1]
    if event_update.quantity is not None:
        event.quantity = event_update.quantity
    
    # Обновление тегов
    if event_update.tags is not None:
        db.query(EventTag).filter(EventTag.event_id == event.id).delete()
        for tag in event_update.tags:
            event_tag = EventTag(event_id=event.id, tag=tag)
            db.add(event_tag)
    
    db.commit()
    db.refresh(event)
    
    tags = [t.tag for t in event.tags]
    return EventResponse(
        id=event.id,
        npo_id=event.npo_id,
        name=event.name,
        description=event.description,
        start=event.start,
        end=event.end,
        coordinates=[event.coordinates_lat, event.coordinates_lon] if event.coordinates_lat and event.coordinates_lon else None,
        quantity=event.quantity,
        status=event.status,
        tags=tags,
        created_at=event.created_at
    )

@router.delete("/{npo_id}/event/{event_id}")
async def delete_event(
    npo_id: int,
    event_id: int,
    current_user = Depends(get_current_npo_user),
    db: Session = Depends(get_db)
):
    """Удаление события"""
    npo = get_npo_by_user_id(current_user.id, db)
    
    if npo.id != npo_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete events for your own NPO"
        )
    
    event = db.query(Event).filter(Event.id == event_id, Event.npo_id == npo.id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}

@router.patch("/{npo_id}/event/{event_id}/status")
async def update_event_status(
    npo_id: int,
    event_id: int,
    status_update: EventStatusUpdate,
    current_user = Depends(get_current_npo_user),
    db: Session = Depends(get_db)
):
    """Изменение статуса события"""
    npo = get_npo_by_user_id(current_user.id, db)
    
    if npo.id != npo_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update events for your own NPO"
        )
    
    event = db.query(Event).filter(Event.id == event_id, Event.npo_id == npo.id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    event.status = status_update.status
    db.commit()
    return {"message": "Event status updated successfully"}

# News endpoints
@router.post("/{npo_id}/news", response_model=NewsResponse, status_code=status.HTTP_201_CREATED)
async def create_news(
    npo_id: int,
    news_data: NewsCreate,
    current_user = Depends(get_current_npo_user),
    db: Session = Depends(get_db)
):
    """Публикация новостей НКО"""
    npo = get_npo_by_user_id(current_user.id, db)
    
    if npo.id != npo_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create news for your own NPO"
        )
    
    news = News(
        npo_id=npo.id,
        name=news_data.name,
        text=news_data.text,
        type=news_data.type
    )
    db.add(news)
    db.flush()
    
    # Добавление тегов
    if news_data.tags:
        for tag in news_data.tags:
            news_tag = NewsTag(news_id=news.id, tag=tag)
            db.add(news_tag)
    
    # Добавление вложений
    if news_data.attachedIds:
        for file_id in news_data.attachedIds:
            attachment = NewsAttachment(news_id=news.id, file_id=file_id)
            db.add(attachment)
    
    db.commit()
    db.refresh(news)
    
    tags = [t.tag for t in news.tags]
    attached_ids = [a.file_id for a in news.attachments]
    
    return NewsResponse(
        id=news.id,
        name=news.name,
        text=news.text,
        attachedIds=attached_ids,
        tags=tags,
        type=news.type,
        created_at=news.created_at
    )

