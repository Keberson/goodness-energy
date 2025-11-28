from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models import Favorite, FavoriteType, News, Event, Knowledge, User, NewsTag, NewsAttachment, EventTag, EventAttachment, KnowledgeTag, KnowledgeAttachment, NPO, Volunteer, EventResponse as EventResponseModel, VolunteerPost
from app.schemas import FavoriteCreate, FavoriteResponse, FavoriteItemResponse, NewsResponse, EventResponse, KnowledgeResponse, VolunteerPostResponse
from app.auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

def build_event_response(event: Event, db: Session) -> EventResponse:
    """Создает EventResponse с подсчетом регистраций и свободных мест"""
    tags = [t.tag for t in event.tags]
    attached_ids = [a.file_id for a in event.attachments] if hasattr(event, 'attachments') else []
    
    # Подсчет зарегистрированных участников
    registered_count = db.query(EventResponseModel).filter(
        EventResponseModel.event_id == event.id
    ).count()
    
    # Количество свободных мест
    free_spots = None
    if event.quantity is not None:
        free_spots = max(0, event.quantity - registered_count)
    
    return EventResponse(
        id=event.id,
        npo_id=event.npo_id,
        npo_name=event.npo.name if event.npo else None,
        name=event.name,
        description=event.description,
        start=event.start,
        end=event.end,
        coordinates=[float(event.coordinates_lat), float(event.coordinates_lon)] if event.coordinates_lat is not None and event.coordinates_lon is not None else None,
        quantity=event.quantity,
        registered_count=registered_count,
        free_spots=free_spots,
        status=event.status,
        tags=tags,
        city=event.city,
        attachedIds=attached_ids,
        created_at=event.created_at
    )

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

@router.post("", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite(
    favorite_data: FavoriteCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Добавление элемента в избранное"""
    # Проверка существования элемента
    if favorite_data.item_type == FavoriteType.NEWS:
        item = db.query(News).filter(News.id == favorite_data.item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Новость не найдена"
            )
    elif favorite_data.item_type == FavoriteType.EVENT:
        item = db.query(Event).filter(Event.id == favorite_data.item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Событие не найдено"
            )
    elif favorite_data.item_type == FavoriteType.KNOWLEDGE:
        item = db.query(Knowledge).filter(Knowledge.id == favorite_data.item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Материал не найден"
            )
    elif favorite_data.item_type == FavoriteType.VOLUNTEER_POST:
        item = db.query(VolunteerPost).filter(VolunteerPost.id == favorite_data.item_id).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="История волонтера не найдена"
            )
    
    # Проверка, не добавлен ли уже элемент в избранное
    existing_favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.item_type == favorite_data.item_type,
        Favorite.item_id == favorite_data.item_id
    ).first()
    
    if existing_favorite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Элемент уже добавлен в избранное"
        )
    
    # Создание записи избранного
    favorite = Favorite(
        user_id=current_user.id,
        item_type=favorite_data.item_type,
        item_id=favorite_data.item_id
    )
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    
    return FavoriteResponse(
        id=favorite.id,
        user_id=favorite.user_id,
        item_type=favorite.item_type,
        item_id=favorite.item_id,
        created_at=favorite.created_at
    )

@router.delete("/{item_type}/{item_id}", status_code=status.HTTP_200_OK)
async def remove_favorite(
    item_type: FavoriteType,
    item_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удаление элемента из избранного"""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.item_type == item_type,
        Favorite.item_id == item_id
    ).first()
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Элемент не найден в избранном"
        )
    
    db.delete(favorite)
    db.commit()
    return {"message": "Элемент успешно удален из избранного"}

@router.get("", response_model=List[FavoriteItemResponse])
async def get_favorites(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение всех избранных элементов пользователя"""
    favorites = db.query(Favorite).filter(
        Favorite.user_id == current_user.id
    ).order_by(Favorite.created_at.desc()).all()
    
    result = []
    for favorite in favorites:
        item_data = None
        
        if favorite.item_type == FavoriteType.NEWS:
            news = db.query(News).filter(News.id == favorite.item_id).first()
            if news:
                tags = [t.tag for t in news.tags]
                attached_ids = [a.file_id for a in news.attachments]
                author = get_news_author(news, db)
                item_data = NewsResponse(
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
                ).model_dump()
        
        elif favorite.item_type == FavoriteType.EVENT:
            event = db.query(Event).options(joinedload(Event.npo), joinedload(Event.tags), joinedload(Event.attachments)).filter(Event.id == favorite.item_id).first()
            if event:
                item_data = build_event_response(event, db).model_dump()
        
        elif favorite.item_type == FavoriteType.KNOWLEDGE:
            knowledge = db.query(Knowledge).filter(Knowledge.id == favorite.item_id).first()
            if knowledge:
                tags = [t.tag for t in knowledge.tags]
                attached_ids = [a.file_id for a in knowledge.attachments]
                item_data = KnowledgeResponse(
                    id=knowledge.id,
                    name=knowledge.name,
                    text=knowledge.text,
                    attachedIds=attached_ids,
                    tags=tags,
                    links=knowledge.links,
                    created_at=knowledge.created_at
                ).model_dump()
        
        elif favorite.item_type == FavoriteType.VOLUNTEER_POST:
            post = db.query(VolunteerPost).filter(VolunteerPost.id == favorite.item_id).first()
            if post:
                tags = [t.tag for t in post.tags]
                attached_ids = [a.file_id for a in post.attachments]
                # Автор уже проставляется в VolunteerPostResponse через сервис постов
                item_data = VolunteerPostResponse(
                    id=post.id,
                    name=post.name,
                    annotation=post.annotation,
                    text=post.text,
                    city=post.city,
                    theme_tag=post.theme_tag,
                    npo_id=post.npo_id,
                    npo_name=post.npo.name if post.npo else None,
                    status=post.status,
                    moderator_id=post.moderator_id,
                    moderation_comment=post.moderation_comment,
                    attachedIds=attached_ids,
                    tags=tags,
                    created_at=post.created_at,
                    updated_at=post.updated_at,
                    moderated_at=post.moderated_at,
                    user_id=post.user_id,
                    volunteer_id=post.volunteer_id,
                    author=f"{post.volunteer.first_name} {post.volunteer.second_name}" if post.volunteer else "Неизвестный автор",
                ).model_dump()
        
        if item_data:
            result.append(FavoriteItemResponse(
                favorite_id=favorite.id,
                item_type=favorite.item_type,
                item_id=favorite.item_id,
                created_at=favorite.created_at,
                item=item_data
            ))
    
    return result

@router.get("/check/{item_type}/{item_id}", response_model=dict)
async def check_favorite(
    item_type: FavoriteType,
    item_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Проверка, добавлен ли элемент в избранное"""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.item_type == item_type,
        Favorite.item_id == item_id
    ).first()
    
    return {"is_favorite": favorite is not None}

