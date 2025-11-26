from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import (
    NPO, NPOGallery, NPOTag, Event, EventTag, EventAttachment, News, NewsTag, NewsAttachment, 
    EventStatus, User, NPOStatus, NPOCity, NPOView, EventView, EventResponse as EventResponseModel,
    Volunteer, UserRole, Favorite, FavoriteType
)
from app.schemas import (
    NPOResponse, NPOMapPoint, NPOUpdate, EventCreate, EventUpdate, 
    EventResponse, EventStatusUpdate, NewsCreate, NewsResponse,
    NPOStatisticsResponse, ProfileViewerStats, EventStats
)
from app.auth import get_current_npo_user, get_current_user, get_optional_user
from app.analytics import generate_csv_analytics, generate_pdf_analytics
from app.email_service import send_notification_event, send_notification_event_cancelled
import json
import logging
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter()

def get_news_author(news: News, db: Session) -> str:
    """Определяет автора новости на основе типа создателя"""
    if news.volunteer_id:
        volunteer = db.query(Volunteer).filter(Volunteer.id == news.volunteer_id).first()
        if volunteer:
            return f"{volunteer.first_name} {volunteer.second_name}"
    elif news.npo_id:
        npo = db.query(NPO).filter(NPO.id == news.npo_id).first()
        if npo:
            return npo.name
    elif news.admin_id:
        return "Администратор"
    return "Неизвестный автор"

def get_npo_by_user_id(user_id: int, db: Session) -> NPO:
    npo = db.query(NPO).filter(NPO.user_id == user_id).first()
    if not npo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="НКО не найдена"
        )
    return npo

@router.get("", response_model=List[NPOResponse])
async def get_all_npos(
    city: Optional[str] = Query(None, description="Фильтр по городу"),
    db: Session = Depends(get_db)
):
    """Список всех организаций с опциональной фильтрацией по городу"""
    query = db.query(NPO)
    
    if city:
        query = query.filter(NPO.city == city)
    
    npos = query.all()
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
            page_content=npo.page_content,
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

@router.get("/tags", response_model=List[str])
async def get_all_npo_tags(db: Session = Depends(get_db)):
    """Получение всех возможных тегов НКО"""
    tags = db.query(NPOTag.tag).distinct().order_by(NPOTag.tag).all()
    return [tag[0] for tag in tags]

@router.get("/{npo_id}", response_model=NPOResponse)
async def get_npo_by_id(
    npo_id: int,
    db: Session = Depends(get_db)
):
    """Получение данных об НКО по id"""
    npo = db.query(NPO).filter(NPO.id == npo_id).first()
    if not npo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="НКО не найдена"
        )
    
    gallery_ids = [g.file_id for g in npo.gallery]
    tags = [t.tag for t in npo.tags]
    active_events_count = db.query(Event).filter(
        Event.npo_id == npo.id,
        Event.status == EventStatus.PUBLISHED
    ).count()
    
    return NPOResponse(
        id=npo.id,
        name=npo.name,
        description=npo.description,
        page_content=npo.page_content,
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
    )

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
            detail="Вы можете обновлять только свою НКО"
        )
    
    if npo_update.name is not None:
        npo.name = npo_update.name
    if npo_update.description is not None:
        npo.description = npo_update.description
    if npo_update.page_content is not None:
        npo.page_content = npo_update.page_content
    if npo_update.timetable is not None:
        # Сохраняем только если это не пустая строка после удаления пробелов
        timetable_str = str(npo_update.timetable).strip()
        npo.timetable = timetable_str if timetable_str else None
    if npo_update.links is not None:
        npo.links = json.dumps(npo_update.links)
    if npo_update.city is not None:
        npo.city = npo_update.city.value  # Сохраняем строковое значение enum
    if npo_update.address is not None:
        npo.address = npo_update.address
    if npo_update.coordinates is not None:
        # Валидация координат НКО
        if not isinstance(npo_update.coordinates, list):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Координаты НКО должны быть списком [lat, lon], получен {type(npo_update.coordinates).__name__}"
            )
        
        if len(npo_update.coordinates) != 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Координаты НКО должны содержать ровно 2 значения [lat, lon], получено {len(npo_update.coordinates)} значение(й)"
            )
        
        try:
            coordinates_lat = float(npo_update.coordinates[0])
            coordinates_lon = float(npo_update.coordinates[1])
        except (ValueError, TypeError) as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Координаты НКО должны быть числами [lat, lon]. Ошибка: {str(e)}"
            )
        
        # Проверка диапазона координат
        if not (-90 <= coordinates_lat <= 90):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Широта НКО должна быть в диапазоне от -90 до 90, получено {coordinates_lat}"
            )
        
        if not (-180 <= coordinates_lon <= 180):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Долгота НКО должна быть в диапазоне от -180 до 180, получено {coordinates_lon}"
            )
        
        npo.coordinates_lat = coordinates_lat
        npo.coordinates_lon = coordinates_lon
    
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
    return {"message": "НКО успешно обновлена"}

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
            detail="Вы можете удалять только свою НКО"
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

# Эндпоинты событий
@router.get("/{npo_id}/event", response_model=List[EventResponse])
async def get_npo_events(
    npo_id: int,
    db: Session = Depends(get_db)
):
    """Просмотр всех событий выбранного НКО"""
    npo = db.query(NPO).filter(NPO.id == npo_id).first()
    if not npo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="НКО не найдено"
        )
    
    # Получаем все события НКО
    events = db.query(Event).filter(Event.npo_id == npo_id).all()
    
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
            detail="Вы можете создавать события только для своей НКО"
        )
    
    # Валидация координат события
    coordinates_lat = None
    coordinates_lon = None
    if event_data.coordinates is not None:
        if not isinstance(event_data.coordinates, list):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Координаты события должны быть списком [lat, lon], получен {type(event_data.coordinates).__name__}"
            )
        
        if len(event_data.coordinates) != 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Координаты события должны содержать ровно 2 значения [lat, lon], получено {len(event_data.coordinates)} значение(й)"
            )
        
        try:
            coordinates_lat = float(event_data.coordinates[0])
            coordinates_lon = float(event_data.coordinates[1])
        except (ValueError, TypeError) as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Координаты события должны быть числами [lat, lon]. Ошибка: {str(e)}"
            )
        
        # Проверка диапазона координат
        if not (-90 <= coordinates_lat <= 90):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Широта события должна быть в диапазоне от -90 до 90, получено {coordinates_lat}"
            )
        
        if not (-180 <= coordinates_lon <= 180):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Долгота события должна быть в диапазоне от -180 до 180, получено {coordinates_lon}"
            )
    
    event = Event(
        npo_id=npo.id,
        name=event_data.name,
        description=event_data.description,
        start=event_data.start,
        end=event_data.end,
        coordinates_lat=coordinates_lat,
        coordinates_lon=coordinates_lon,
        quantity=event_data.quantity,
        city=event_data.city.value  # Сохраняем строковое значение enum
    )
    db.add(event)
    db.flush()
    
    # Добавление тегов
    if event_data.tags:
        for tag in event_data.tags:
            event_tag = EventTag(event_id=event.id, tag=tag)
            db.add(event_tag)
    
    # Добавление вложений (изображений)
    if event_data.attachedIds:
        from app.models import EventAttachment
        for file_id in event_data.attachedIds:
            attachment = EventAttachment(event_id=event.id, file_id=file_id)
            db.add(attachment)
    
    db.commit()
    db.refresh(event)
    
    tags = [t.tag for t in event.tags]
    attached_ids = [a.file_id for a in event.attachments]
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
        city=event.city,
        attachedIds=attached_ids,
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
            detail="Можно обновлять только свои события"
        )
    
    event = db.query(Event).filter(Event.id == event_id, Event.npo_id == npo.id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Событие не найдено"
        )
    
    # Сохраняем старый статус для проверки, нужно ли отправлять уведомления
    old_status = event.status
    
    if event_update.name is not None:
        event.name = event_update.name
    if event_update.description is not None:
        event.description = event_update.description
    if event_update.start is not None:
        event.start = event_update.start
    if event_update.end is not None:
        event.end = event_update.end
    if event_update.coordinates is not None:
        # Валидация координат события
        if not isinstance(event_update.coordinates, list):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Координаты события должны быть списком [lat, lon], получен {type(event_update.coordinates).__name__}"
            )
        
        if len(event_update.coordinates) != 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Координаты события должны содержать ровно 2 значения [lat, lon], получено {len(event_update.coordinates)} значение(й)"
            )
        
        try:
            coordinates_lat = float(event_update.coordinates[0])
            coordinates_lon = float(event_update.coordinates[1])
        except (ValueError, TypeError) as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Координаты события должны быть числами [lat, lon]. Ошибка: {str(e)}"
            )
        
        # Проверка диапазона координат
        if not (-90 <= coordinates_lat <= 90):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Широта события должна быть в диапазоне от -90 до 90, получено {coordinates_lat}"
            )
        
        if not (-180 <= coordinates_lon <= 180):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Долгота события должна быть в диапазоне от -180 до 180, получено {coordinates_lon}"
            )
        
        event.coordinates_lat = coordinates_lat
        event.coordinates_lon = coordinates_lon
    if event_update.quantity is not None:
        event.quantity = event_update.quantity
    if event_update.city is not None:
        event.city = event_update.city.value  # Сохраняем строковое значение enum
    
    # Обновление тегов
    if event_update.tags is not None:
        db.query(EventTag).filter(EventTag.event_id == event.id).delete()
        for tag in event_update.tags:
            event_tag = EventTag(event_id=event.id, tag=tag)
            db.add(event_tag)
    
    # Обновление вложений (изображений)
    if event_update.attachedIds is not None:
        from app.models import EventAttachment
        db.query(EventAttachment).filter(EventAttachment.event_id == event.id).delete()
        for file_id in event_update.attachedIds:
            attachment = EventAttachment(event_id=event.id, file_id=file_id)
            db.add(attachment)
    
    db.commit()
    db.refresh(event)
    
    # Отправка уведомлений о событии только если статус изменился на "Опубликовано"
    # (асинхронно, не блокируем ответ)
    # Не передаем db сессию, функция создаст свою
    # Проверяем, что статус изменился на "Опубликовано" и все необходимые поля заполнены
    if (old_status != EventStatus.PUBLISHED and 
        event.status == EventStatus.PUBLISHED and 
        event.start and event.city):
        task = asyncio.create_task(send_event_notifications(
            event_name=event.name or "Событие",
            event_description=event.description or "",
            event_city=event.city,
            event_start=str(event.start)
        ))
    # Добавляем обработку ошибок для задачи
    task.add_done_callback(lambda t: logger.error(f"Ошибка в задаче отправки уведомлений о событии: {t.exception()}") if t.exception() else None)
    logger.info(f"Отправка уведомлений о событии {event.id} после изменения статуса на 'published'")
    
    # Отправка уведомлений об отмене, если статус изменился с "Опубликовано" на "Отменено"
    if (old_status == EventStatus.PUBLISHED and 
        event.status == EventStatus.CANCELLED and 
        event.start and event.city):
        task = asyncio.create_task(send_event_cancelled_notifications(
            event_name=event.name or "Событие",
            event_description=event.description or "",
            event_city=event.city,
            event_start=str(event.start)
        ))
        # Добавляем обработку ошибок для задачи
        task.add_done_callback(lambda t: logger.error(f"Ошибка в задаче отправки уведомлений об отмене события: {t.exception()}") if t.exception() else None)
        logger.info(f"Отправка уведомлений об отмене события {event.id} после изменения статуса с 'published' на 'cancelled'")
    
    tags = [t.tag for t in event.tags]
    attached_ids = [a.file_id for a in event.attachments]
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
        city=event.city,
        attachedIds=attached_ids,
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
            detail="Вы можете удалять события только для своей НКО"
        )
    
    event = db.query(Event).filter(Event.id == event_id, Event.npo_id == npo.id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Событие не найдено"
        )
    
    # Удаляем избранные записи, связанные с этим событием (полиморфная связь без FK)
    db.query(Favorite).filter(
        Favorite.item_type == FavoriteType.EVENT,
        Favorite.item_id == event_id
    ).delete()
    
    # Удаляем само событие (каскадно на уровне БД удалятся EventView, EventTag, EventResponse, EventAttachment)
    db.delete(event)
    db.commit()
    return {"message": "Событие успешно удалено"}

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
            detail="Вы можете обновлять события только для своей НКО"
        )
    
    event = db.query(Event).filter(Event.id == event_id, Event.npo_id == npo.id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Событие не найдено"
        )
    
    # Сохраняем старый статус для проверки, нужно ли отправлять уведомления
    old_status = event.status
    event.status = status_update.status
    db.commit()
    db.refresh(event)
    
    # Отправка уведомлений только если статус изменился на "Опубликовано"
    # и все необходимые поля заполнены
    if (old_status != EventStatus.PUBLISHED and 
        event.status == EventStatus.PUBLISHED and 
        event.start and event.city):
        task = asyncio.create_task(send_event_notifications(
            event_name=event.name or "Событие",
            event_description=event.description or "",
            event_city=event.city,
            event_start=str(event.start)
        ))
        # Добавляем обработку ошибок для задачи
        task.add_done_callback(lambda t: logger.error(f"Ошибка в задаче отправки уведомлений о событии: {t.exception()}") if t.exception() else None)
        logger.info(f"Отправка уведомлений о событии {event.id} после изменения статуса на 'published'")
    
    # Отправка уведомлений об отмене, если статус изменился с "Опубликовано" на "Отменено"
    if (old_status == EventStatus.PUBLISHED and 
        event.status == EventStatus.CANCELLED and 
        event.start and event.city):
        task = asyncio.create_task(send_event_cancelled_notifications(
            event_name=event.name or "Событие",
            event_description=event.description or "",
            event_city=event.city,
            event_start=str(event.start)
        ))
        # Добавляем обработку ошибок для задачи
        task.add_done_callback(lambda t: logger.error(f"Ошибка в задаче отправки уведомлений об отмене события: {t.exception()}") if t.exception() else None)
        logger.info(f"Отправка уведомлений об отмене события {event.id} после изменения статуса с 'published' на 'cancelled'")
    
    return {"message": "Статус события успешно обновлен"}

# Эндпоинты новостей
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
            detail="Вы можете создавать новости только для своей НКО"
        )
    
    news = News(
        user_id=current_user.id,  # Сохраняем ID пользователя, создавшего новость
        npo_id=npo.id,
        name=news_data.name,
        annotation=news_data.annotation,
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
    author = get_news_author(news, db)
    
    # Отправка уведомлений о новости из города (асинхронно, не блокируем ответ)
    # Не передаем db сессию, функция создаст свою
    if npo.city:
        task = asyncio.create_task(send_city_news_notifications(
            news_id=news.id,
            news_title=news.name,
            news_text=news.text,
            city=npo.city
        ))
        # Добавляем обработку ошибок для задачи
        task.add_done_callback(lambda t: logger.error(f"Ошибка в задаче отправки уведомлений о новости: {t.exception()}") if t.exception() else None)
    
    return NewsResponse(
        id=news.id,
        name=news.name,
        annotation=news.annotation,
        text=news.text,
        attachedIds=attached_ids,
        tags=tags,
        type=news.type,
        created_at=news.created_at,
        user_id=news.user_id,
        author=author
    )

@router.get("/{npo_id}/news", response_model=List[NewsResponse])
async def get_npo_news(
    npo_id: int,
    db: Session = Depends(get_db)
):
    """Получение всех новостей НКО"""
    npo = db.query(NPO).filter(NPO.id == npo_id).first()
    if not npo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="НКО не найдено"
        )
    
    # Получаем все новости НКО
    news_list = db.query(News).filter(News.npo_id == npo_id).order_by(News.created_at.desc()).all()
    
    result = []
    for news in news_list:
        tags = [t.tag for t in news.tags]
        attached_ids = [a.file_id for a in news.attachments]
        author = get_news_author(news, db)
        
        result.append(NewsResponse(
            id=news.id,
            name=news.name,
            annotation=news.annotation,
            text=news.text,
            attachedIds=attached_ids,
            tags=tags,
            type=news.type,
            created_at=news.created_at,
            user_id=news.user_id,
            author=author
        ))
    
    return result

# Эндпоинты для статистики
@router.post("/{npo_id}/view")
async def register_npo_view(
    npo_id: int,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Регистрация просмотра профиля НКО"""
    npo = db.query(NPO).filter(NPO.id == npo_id).first()
    if not npo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="НКО не найдена"
        )
    
    viewer_id = current_user.id if current_user else None
    
    # Создаем запись о просмотре
    npo_view = NPOView(npo_id=npo_id, viewer_id=viewer_id)
    db.add(npo_view)
    db.commit()
    
    return {"message": "Просмотр зарегистрирован"}

@router.post("/{npo_id}/event/{event_id}/view")
async def register_event_view(
    npo_id: int,
    event_id: int,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Регистрация просмотра события"""
    event = db.query(Event).filter(Event.id == event_id, Event.npo_id == npo_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Событие не найдено"
        )
    
    viewer_id = current_user.id if current_user else None
    
    # Создаем запись о просмотре
    event_view = EventView(event_id=event_id, viewer_id=viewer_id)
    db.add(event_view)
    db.commit()
    
    return {"message": "Просмотр события зарегистрирован"}

@router.get("/{npo_id}/statistics", response_model=NPOStatisticsResponse)
async def get_npo_statistics(
    npo_id: int,
    current_user = Depends(get_current_npo_user),
    db: Session = Depends(get_db)
):
    """Получение статистики НКО"""
    npo = get_npo_by_user_id(current_user.id, db)
    
    if npo.id != npo_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы можете просматривать статистику только своей НКО"
        )
    
    # Статистика просмотров профиля
    total_profile_views = db.query(NPOView).filter(NPOView.npo_id == npo_id).count()
    unique_viewers = db.query(func.count(func.distinct(NPOView.viewer_id))).filter(
        NPOView.npo_id == npo_id,
        NPOView.viewer_id.isnot(None)
    ).scalar() or 0
    
    # Статистика по просмотрам от пользователей
    viewer_stats_query = db.query(
        NPOView.viewer_id,
        func.count(NPOView.id).label('view_count'),
        func.max(NPOView.viewed_at).label('last_viewed_at')
    ).filter(
        NPOView.npo_id == npo_id,
        NPOView.viewer_id.isnot(None)
    ).group_by(NPOView.viewer_id).order_by(func.count(NPOView.id).desc())
    
    profile_viewers = []
    for viewer_id, view_count, last_viewed_at in viewer_stats_query.all():
        user = db.query(User).filter(User.id == viewer_id).first()
        profile_viewers.append(ProfileViewerStats(
            viewer_id=viewer_id,
            viewer_login=user.login if user else None,
            view_count=view_count,
            last_viewed_at=last_viewed_at
        ))
    
    # Статистика событий
    total_events = db.query(Event).filter(Event.npo_id == npo_id).count()
    
    # События по статусам
    events_by_status = {}
    for event_status in EventStatus:
        count = db.query(Event).filter(
            Event.npo_id == npo_id,
            Event.status == event_status
        ).count()
        events_by_status[event_status.value] = count
    
    # Детальная статистика по событиям
    events = db.query(Event).filter(Event.npo_id == npo_id).all()
    event_stats = []
    for event in events:
        view_count = db.query(EventView).filter(EventView.event_id == event.id).count()
        response_count = db.query(EventResponseModel).filter(EventResponseModel.event_id == event.id).count()
        
        event_stats.append(EventStats(
            event_id=event.id,
            event_name=event.name,
            view_count=view_count,
            response_count=response_count,
            status=event.status,
            created_at=event.created_at
        ))
    
    # Статистика новостей
    total_news = db.query(News).filter(News.npo_id == npo_id).count()
    
    # Статистика откликов на события
    total_event_responses = db.query(EventResponseModel).join(Event).filter(
        Event.npo_id == npo_id
    ).count()
    
    return NPOStatisticsResponse(
        total_profile_views=total_profile_views,
        unique_viewers=unique_viewers,
        profile_viewers=profile_viewers,
        total_events=total_events,
        events_by_status=events_by_status,
        event_stats=event_stats,
        total_news=total_news,
        total_event_responses=total_event_responses
    )

@router.get("/{npo_id}/analytics/export/csv")
async def export_npo_analytics_csv(
    npo_id: int,
    current_user = Depends(get_current_npo_user),
    db: Session = Depends(get_db)
):
    """Выгрузка аналитики НКО в формате CSV (сырые данные)"""
    npo = get_npo_by_user_id(current_user.id, db)
    
    if npo.id != npo_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы можете выгружать аналитику только для своей НКО"
        )
    
    try:
        csv_buffer = generate_csv_analytics(npo_id, db)
        filename = f"npo_{npo_id}_analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        return StreamingResponse(
            csv_buffer,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Ошибка при генерации CSV: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при генерации CSV файла"
        )

@router.get("/{npo_id}/analytics/export/pdf")
async def export_npo_analytics_pdf(
    npo_id: int,
    current_user = Depends(get_current_npo_user),
    db: Session = Depends(get_db)
):
    """Выгрузка аналитики НКО в формате PDF (красивые графики и статистика)"""
    npo = get_npo_by_user_id(current_user.id, db)
    
    if npo.id != npo_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы можете выгружать аналитику только для своей НКО"
        )
    
    try:
        pdf_buffer = generate_pdf_analytics(npo_id, db)
        filename = f"npo_{npo_id}_analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Ошибка при генерации PDF: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при генерации PDF файла"
        )

async def send_event_notifications(
    event_name: str,
    event_description: str,
    event_city: str,
    event_start: str,
    db: Session = None
):
    """Отправка уведомлений о новом событии только для волонтеров из города события"""
    from app.database import SessionLocal
    
    # Создаем новую сессию БД, если не передана
    if db is None:
        db = SessionLocal()
        should_close = True
    else:
        should_close = False
    
    try:
        # Получаем всех волонтеров из указанного города с включенными уведомлениями о событиях
        volunteers = db.query(Volunteer).join(User).filter(
            Volunteer.city == event_city,
            User.notify_events == True,
            Volunteer.email.isnot(None)
        ).all()
        
        logger.info(f"Найдено {len(volunteers)} волонтеров для отправки уведомлений о событии '{event_name}' в городе {event_city}")
        
        # Получаем URL события (можно настроить в зависимости от вашего фронтенда)
        event_url = None  # TODO: добавить базовый URL фронтенда
        
        sent_count = 0
        failed_count = 0
        
        for volunteer in volunteers:
            if volunteer.email:
                try:
                    result = send_notification_event(
                        to_email=volunteer.email,
                        event_name=event_name,
                        event_description=event_description,
                        event_city=event_city,
                        event_start=event_start,
                        event_url=event_url
                    )
                    if result:
                        sent_count += 1
                        logger.info(f"Уведомление о событии отправлено на {volunteer.email}")
                    else:
                        failed_count += 1
                        logger.warning(f"Не удалось отправить уведомление о событии на {volunteer.email}")
                except Exception as e:
                    failed_count += 1
                    logger.error(f"Ошибка при отправке уведомления о событии на {volunteer.email}: {e}")
        
        logger.info(f"Отправка уведомлений о событии завершена: отправлено {sent_count}, ошибок {failed_count}")
        
    except Exception as e:
        logger.error(f"Ошибка при отправке уведомлений о событии: {e}", exc_info=True)
    finally:
        if should_close:
            db.close()

async def send_event_cancelled_notifications(
    event_name: str,
    event_description: str,
    event_city: str,
    event_start: str,
    db: Session = None
):
    """Отправка уведомлений об отмене события только для волонтеров из города события"""
    from app.database import SessionLocal
    
    # Создаем новую сессию БД, если не передана
    if db is None:
        db = SessionLocal()
        should_close = True
    else:
        should_close = False
    
    try:
        # Получаем всех волонтеров из указанного города с включенными уведомлениями о событиях
        volunteers = db.query(Volunteer).join(User).filter(
            Volunteer.city == event_city,
            User.notify_events == True,
            Volunteer.email.isnot(None)
        ).all()
        
        logger.info(f"Найдено {len(volunteers)} волонтеров для отправки уведомлений об отмене события '{event_name}' в городе {event_city}")
        
        # Получаем URL события (можно настроить в зависимости от вашего фронтенда)
        event_url = None  # TODO: добавить базовый URL фронтенда
        
        sent_count = 0
        failed_count = 0
        
        for volunteer in volunteers:
            if volunteer.email:
                try:
                    result = send_notification_event_cancelled(
                        to_email=volunteer.email,
                        event_name=event_name,
                        event_description=event_description,
                        event_city=event_city,
                        event_start=event_start,
                        event_url=event_url
                    )
                    if result:
                        sent_count += 1
                        logger.info(f"Уведомление об отмене события отправлено на {volunteer.email}")
                    else:
                        failed_count += 1
                        logger.warning(f"Не удалось отправить уведомление об отмене события на {volunteer.email}")
                except Exception as e:
                    failed_count += 1
                    logger.error(f"Ошибка при отправке уведомления об отмене события на {volunteer.email}: {e}")
        
        logger.info(f"Отправка уведомлений об отмене события завершена: отправлено {sent_count}, ошибок {failed_count}")
        
    except Exception as e:
        logger.error(f"Ошибка при отправке уведомлений об отмене события: {e}", exc_info=True)
    finally:
        if should_close:
            db.close()

async def send_city_news_notifications(news_id: int, news_title: str, news_text: str, city: str, db: Session = None):
    """Отправка уведомлений о новости из города пользователям с включенными уведомлениями"""
    from app.database import SessionLocal
    from app.email_service import send_notification_city_news
    
    # Создаем новую сессию БД, если не передана
    if db is None:
        db = SessionLocal()
        should_close = True
    else:
        should_close = False
    
    try:
        # Получаем всех волонтеров из указанного города с включенными уведомлениями
        volunteers = db.query(Volunteer).join(User).filter(
            Volunteer.city == city,
            User.notify_city_news == True,
            Volunteer.email.isnot(None)
        ).all()
        
        logger.info(f"Найдено {len(volunteers)} волонтеров для отправки уведомлений о новости '{news_title}' в городе {city}")
        
        # Получаем URL новости (можно настроить в зависимости от вашего фронтенда)
        news_url = None  # TODO: добавить базовый URL фронтенда
        
        sent_count = 0
        failed_count = 0
        
        for volunteer in volunteers:
            if volunteer.email:
                try:
                    result = send_notification_city_news(
                        to_email=volunteer.email,
                        news_title=news_title,
                        news_text=news_text,
                        city=city,
                        news_url=news_url
                    )
                    if result:
                        sent_count += 1
                        logger.info(f"Уведомление о новости отправлено на {volunteer.email}")
                    else:
                        failed_count += 1
                        logger.warning(f"Не удалось отправить уведомление о новости на {volunteer.email}")
                except Exception as e:
                    failed_count += 1
                    logger.error(f"Ошибка при отправке уведомления о новости на {volunteer.email}: {e}")
        
        logger.info(f"Отправка уведомлений о новости завершена: отправлено {sent_count}, ошибок {failed_count}")
        
    except Exception as e:
        logger.error(f"Ошибка при отправке уведомлений о новости: {e}", exc_info=True)
    finally:
        if should_close:
            db.close()

