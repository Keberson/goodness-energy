from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import News, NewsTag, NewsAttachment, NPO, Volunteer, UserRole, User
from app.schemas import NewsCreate, NewsResponse, NewsUpdate
from app.auth import get_current_user
import logging
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/types", response_model=List[str])
async def get_news_types(
    current_user: User = Depends(get_current_user)
):
    """
    Получение доступных типов новостей в зависимости от роли пользователя
    
    Returns:
        Список доступных типов новостей на русском языке:
        - admin: ['Блог', 'Документы']
        - npo: ['Блог', 'Документы']
        - volunteer: ['Блог']
    """
    # Маппинг типов новостей на русские названия
    type_mapping = {
        "blog": "Блог",
        "edu": "Образование",
        "docs": "Документы"
    }
    
    # Определяем доступные типы в зависимости от роли
    if current_user.role == UserRole.ADMIN:
        # Админы могут создавать Блог и Документы
        return [type_mapping["blog"], type_mapping["docs"]]
    elif current_user.role == UserRole.NPO:
        # НКО могут создавать Блог и Документы
        return [type_mapping["blog"], type_mapping["docs"]]
    elif current_user.role == UserRole.VOLUNTEER:
        # Волонтеры могут создавать только Блог
        return [type_mapping["blog"]]
    else:
        # По умолчанию возвращаем только Блог
        return [type_mapping["blog"]]

@router.get("", response_model=List[NewsResponse])
async def get_all_news(
    city: Optional[str] = Query(None, description="Фильтр по городу"),
    db: Session = Depends(get_db)
):
    """Получение всех новостей/База знаний с опциональной фильтрацией по городу"""
    from sqlalchemy import or_, and_
    
    query = db.query(News)
    
    if city:
        # Фильтруем новости по городу НКО или волонтера, или показываем новости от админов (глобальные)
        # Используем подзапросы для более эффективной фильтрации
        npo_ids_subquery = db.query(NPO.id).filter(NPO.city == city)
        volunteer_ids_subquery = db.query(Volunteer.id).filter(Volunteer.city == city)
        
        query = query.filter(
            or_(
                and_(News.npo_id.isnot(None), News.npo_id.in_(npo_ids_subquery)),
                and_(News.volunteer_id.isnot(None), News.volunteer_id.in_(volunteer_ids_subquery)),
                News.admin_id.isnot(None)  # Новости от админов показываем всегда
            )
        )
    
    news_list = query.order_by(News.created_at.desc()).all()
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

@router.get("/{news_id}", response_model=NewsResponse)
async def get_news_by_id(news_id: int, db: Session = Depends(get_db)):
    """Получение новости по ID"""
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Новость не найдена"
        )
    
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

@router.post("", response_model=NewsResponse, status_code=status.HTTP_201_CREATED)
async def create_news(
    news_data: NewsCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Создание новости (доступно всем авторизованным пользователям)"""
    npo_id = None
    volunteer_id = None
    admin_id = None
    
    # Определяем автора новости в зависимости от роли пользователя
    if current_user.role == UserRole.NPO:
        npo = db.query(NPO).filter(NPO.user_id == current_user.id).first()
        if not npo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="НКО не найдена"
            )
        npo_id = npo.id
    elif current_user.role == UserRole.VOLUNTEER:
        volunteer = db.query(Volunteer).filter(Volunteer.user_id == current_user.id).first()
        if not volunteer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Волонтер не найден"
            )
        volunteer_id = volunteer.id
        # Волонтеры могут создавать только новости типа blog
        if news_data.type != "blog":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Волонтеры могут создавать только новости типа blog"
            )
    elif current_user.role == UserRole.ADMIN:
        admin_id = current_user.id
    
    news = News(
        npo_id=npo_id,
        volunteer_id=volunteer_id,
        admin_id=admin_id,
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
    
    # Определяем город новости для отправки уведомлений
    news_city = None
    if npo_id:
        npo = db.query(NPO).filter(NPO.id == npo_id).first()
        if npo:
            news_city = npo.city
    elif volunteer_id:
        volunteer = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
        if volunteer:
            news_city = volunteer.city
    
    # Отправка уведомлений о новости из города (асинхронно, не блокируем ответ)
    if news_city:
        # Импортируем функцию из npo.py
        from app.routers.npo import send_city_news_notifications
        task = asyncio.create_task(send_city_news_notifications(news.id, news.name, news.text, news_city))
        # Добавляем обработку ошибок для задачи
        task.add_done_callback(lambda t: logger.error(f"Ошибка в задаче отправки уведомлений о новости: {t.exception()}") if t.exception() else None)
    
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
    
    # Проверка прав доступа: только автор новости может редактировать
    is_author = False
    
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
    
    if not is_author:
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

