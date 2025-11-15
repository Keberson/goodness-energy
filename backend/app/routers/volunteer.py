from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Volunteer, EventResponse as EventResponseModel, News, NewsTag, NewsAttachment, NewsType, Event, EventTag, User
from app.schemas import VolunteerUpdate, VolunteerResponse, NewsCreate, NewsResponse, EventResponse
from app.auth import get_current_volunteer_user, get_current_user

router = APIRouter()

def get_volunteer_by_user_id(user_id: int, db: Session) -> Volunteer:
    volunteer = db.query(Volunteer).filter(Volunteer.user_id == user_id).first()
    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer not found"
        )
    return volunteer

@router.get("", response_model=List[VolunteerResponse])
async def get_all_volunteers(db: Session = Depends(get_db)):
    """Список всех волонтёров"""
    volunteers = db.query(Volunteer).all()
    result = []
    
    for volunteer in volunteers:
        result.append(VolunteerResponse(
            id=volunteer.id,
            firstName=volunteer.first_name,
            secondName=volunteer.second_name,
            middleName=volunteer.middle_name,
            about=volunteer.about,
            birthday=volunteer.birthday,
            city=volunteer.city,
            sex=volunteer.sex,
            email=volunteer.email,
            phone=volunteer.phone,
            created_at=volunteer.created_at
        ))
    
    return result

@router.put("/{volunteer_id}")
async def update_volunteer(
    volunteer_id: int,
    volunteer_update: VolunteerUpdate,
    current_user = Depends(get_current_volunteer_user),
    db: Session = Depends(get_db)
):
    """Обновление профиля волонтера"""
    volunteer = get_volunteer_by_user_id(current_user.id, db)
    
    if volunteer.id != volunteer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile"
        )
    
    if volunteer_update.firstName is not None:
        volunteer.first_name = volunteer_update.firstName
    if volunteer_update.secondName is not None:
        volunteer.second_name = volunteer_update.secondName
    if volunteer_update.middleName is not None:
        volunteer.middle_name = volunteer_update.middleName
    if volunteer_update.about is not None:
        volunteer.about = volunteer_update.about
    if volunteer_update.birthday is not None:
        volunteer.birthday = volunteer_update.birthday
    if volunteer_update.city is not None:
        volunteer.city = volunteer_update.city
    if volunteer_update.sex is not None:
        volunteer.sex = volunteer_update.sex
    if volunteer_update.email is not None:
        volunteer.email = volunteer_update.email
    if volunteer_update.phone is not None:
        volunteer.phone = volunteer_update.phone
    
    db.commit()
    return {"message": "Volunteer profile updated successfully"}

@router.delete("/{volunteer_id}")
async def delete_volunteer(
    volunteer_id: int,
    current_user = Depends(get_current_volunteer_user),
    db: Session = Depends(get_db)
):
    """Удаление профиля волонтера"""
    volunteer = get_volunteer_by_user_id(current_user.id, db)
    
    if volunteer.id != volunteer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own profile"
        )
    
    # Сохраняем user_id перед удалением волонтёра
    user_id = volunteer.user_id
    
    # Удаляем волонтёра (каскадно удалятся связанные записи: отклики на события, новости)
    db.delete(volunteer)
    db.flush()
    
    # Удаляем связанного пользователя
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
    
    db.commit()
    return {"message": "Volunteer profile deleted successfully"}

@router.post("/event/{event_id}")
async def respond_to_event(
    event_id: int,
    current_user = Depends(get_current_volunteer_user),
    db: Session = Depends(get_db)
):
    """Отклик на событие"""
    from app.models import Event
    
    # Проверка существования события
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Получаем волонтера из текущего пользователя
    volunteer = get_volunteer_by_user_id(current_user.id, db)
    
    # Проверка, что отклик еще не существует
    existing_response = db.query(EventResponseModel).filter(
        EventResponseModel.event_id == event_id,
        EventResponseModel.volunteer_id == volunteer.id
    ).first()
    
    if existing_response:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already responded to this event"
        )
    
    # Создание отклика
    event_response = EventResponseModel(
        event_id=event_id,
        volunteer_id=volunteer.id
    )
    db.add(event_response)
    db.commit()
    
    return {"message": "Event response created successfully"}

@router.delete("/event/{event_id}")
async def delete_event_response(
    event_id: int,
    current_user = Depends(get_current_volunteer_user),
    db: Session = Depends(get_db)
):
    """Удаление отклика на событие"""
    # Получаем волонтера из текущего пользователя
    volunteer = get_volunteer_by_user_id(current_user.id, db)
    
    event_response = db.query(EventResponseModel).filter(
        EventResponseModel.event_id == event_id,
        EventResponseModel.volunteer_id == volunteer.id
    ).first()
    
    if not event_response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event response not found"
        )
    
    db.delete(event_response)
    db.commit()
    return {"message": "Event response deleted successfully"}

@router.post("/{volunteer_id}/news", response_model=NewsResponse, status_code=status.HTTP_201_CREATED)
async def create_volunteer_news(
    volunteer_id: int,
    news_data: NewsCreate,
    current_user = Depends(get_current_volunteer_user),
    db: Session = Depends(get_db)
):
    """Создание новости волонтером"""
    volunteer = get_volunteer_by_user_id(current_user.id, db)
    
    if volunteer.id != volunteer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create news for your own profile"
        )
    
    # Проверка типа новости (только blog для волонтеров)
    if news_data.type != NewsType.BLOG:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Volunteers can only create blog type news"
        )
    
    news = News(
        volunteer_id=volunteer.id,
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

@router.get("/{volunteer_id}/event", response_model=List[EventResponse])
async def get_volunteer_events(
    volunteer_id: int,
    db: Session = Depends(get_db)
):
    """Просмотр всех событий выбранного волонтёра"""
    volunteer = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer not found"
        )
    
    # Получаем все события, на которые волонтёр откликнулся
    event_responses = db.query(EventResponseModel).filter(
        EventResponseModel.volunteer_id == volunteer_id
    ).all()
    
    result = []
    for event_response in event_responses:
        event = db.query(Event).filter(Event.id == event_response.event_id).first()
        if event:
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

