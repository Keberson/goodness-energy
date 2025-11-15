from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import News, NewsTag, NewsAttachment, NPO, Volunteer, UserRole
from app.schemas import NewsResponse, NewsUpdate
from app.auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("", response_model=List[NewsResponse])
async def get_all_news(db: Session = Depends(get_db)):
    """Получение всех новостей/База знаний"""
    news_list = db.query(News).order_by(News.created_at.desc()).all()
    result = []
    
    for news in news_list:
        tags = [t.tag for t in news.tags]
        attached_ids = [a.file_id for a in news.attachments]
        
        result.append(NewsResponse(
            id=news.id,
            name=news.name,
            text=news.text,
            attachedIds=attached_ids,
            tags=tags,
            type=news.type,
            created_at=news.created_at
        ))
    
    return result

@router.put("/{news_id}", response_model=NewsResponse)
async def update_news(
    news_id: int,
    news_update: NewsUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Редактирование новости"""
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Новость не найдена"
        )
    
    # Проверка прав доступа: только автор новости или админ может редактировать
    is_author = False
    is_admin = current_user.role == UserRole.ADMIN
    
    if news.npo_id:
        npo = db.query(NPO).filter(NPO.id == news.npo_id).first()
        if npo and npo.user_id == current_user.id:
            is_author = True
    elif news.volunteer_id:
        volunteer = db.query(Volunteer).filter(Volunteer.id == news.volunteer_id).first()
        if volunteer and volunteer.user_id == current_user.id:
            is_author = True
    elif news.admin_id:
        if news.admin_id == current_user.id:
            is_author = True
    
    if not is_author and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы можете редактировать только свои новости"
        )
    
    # Обновление полей
    if news_update.name is not None:
        news.name = news_update.name
    if news_update.text is not None:
        news.text = news_update.text
    if news_update.type is not None:
        # Проверка для волонтёров: они могут создавать только blog
        if news.volunteer_id and news_update.type != news.type:
            volunteer = db.query(Volunteer).filter(Volunteer.id == news.volunteer_id).first()
            if volunteer and volunteer.user_id == current_user.id and news_update.type != "blog":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Волонтеры могут создавать только новости типа blog"
                )
        news.type = news_update.type
    
    # Обновление тегов
    if news_update.tags is not None:
        db.query(NewsTag).filter(NewsTag.news_id == news.id).delete()
        for tag in news_update.tags:
            news_tag = NewsTag(news_id=news.id, tag=tag)
            db.add(news_tag)
    
    # Обновление вложений
    if news_update.attachedIds is not None:
        db.query(NewsAttachment).filter(NewsAttachment.news_id == news.id).delete()
        for file_id in news_update.attachedIds:
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

@router.delete("/{news_id}")
async def delete_news(
    news_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удаление новости"""
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Новость не найдена"
        )
    
    # Проверка прав доступа: только автор новости или админ может удалять
    is_author = False
    is_admin = current_user.role == UserRole.ADMIN
    
    if news.npo_id:
        npo = db.query(NPO).filter(NPO.id == news.npo_id).first()
        if npo and npo.user_id == current_user.id:
            is_author = True
    elif news.volunteer_id:
        volunteer = db.query(Volunteer).filter(Volunteer.id == news.volunteer_id).first()
        if volunteer and volunteer.user_id == current_user.id:
            is_author = True
    elif news.admin_id:
        if news.admin_id == current_user.id:
            is_author = True
    
    if not is_author and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы можете удалять только свои новости"
        )
    
    db.delete(news)
    db.commit()
    return {"message": "Новость успешно удалена"}

