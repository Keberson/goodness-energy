from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import VolunteerPost, VolunteerPostTag, VolunteerPostAttachment, Volunteer, NPO, UserRole, User, VolunteerPostStatus
from app.schemas import VolunteerPostCreate, VolunteerPostResponse, VolunteerPostUpdate, VolunteerPostModeration
from app.auth import get_current_user, get_current_volunteer_user, get_current_admin_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

def get_post_author(post: VolunteerPost, db: Session) -> str:
    """Определяет автора поста"""
    volunteer = db.query(Volunteer).filter(Volunteer.id == post.volunteer_id).first()
    if volunteer:
        return f"{volunteer.first_name} {volunteer.second_name}"
    return "Неизвестный автор"

# Список доступных тематик для блогов
AVAILABLE_THEMES = [
    "Экология",
    "Образование",
    "Здоровье",
    "Культура",
    "Спорт",
    "Социальная помощь",
    "Наука",
    "Технологии",
    "Другое"
]

@router.get("/themes", response_model=List[str])
async def get_available_themes():
    """Получение списка доступных тематик для блогов"""
    return AVAILABLE_THEMES

@router.get("", response_model=List[VolunteerPostResponse])
async def get_volunteer_posts(
    city: Optional[str] = Query(None, description="Фильтр по городу"),
    status_filter: Optional[VolunteerPostStatus] = Query(None, description="Фильтр по статусу модерации"),
    theme_tag: Optional[str] = Query(None, description="Фильтр по тематике"),
    db: Session = Depends(get_db)
):
    """
    Получение всех блогов волонтеров.
    По умолчанию показываются только одобренные посты.
    """
    query = db.query(VolunteerPost)
    
    # По умолчанию показываем только одобренные
    if status_filter is None:
        query = query.filter(VolunteerPost.status == VolunteerPostStatus.APPROVED)
    else:
        query = query.filter(VolunteerPost.status == status_filter)
    
    if city:
        query = query.filter(VolunteerPost.city == city)
    
    if theme_tag:
        query = query.filter(VolunteerPost.theme_tag == theme_tag)
    
    posts_list = query.order_by(VolunteerPost.created_at.desc()).all()
    result = []
    
    for post in posts_list:
        tags = [t.tag for t in post.tags]
        attached_ids = [a.file_id for a in post.attachments]
        author = get_post_author(post, db)
        npo_name = None
        if post.npo_id:
            npo = db.query(NPO).filter(NPO.id == post.npo_id).first()
            if npo:
                npo_name = npo.name
        
        result.append(VolunteerPostResponse(
            id=post.id,
            name=post.name,
            annotation=post.annotation,
            text=post.text,
            city=post.city,
            theme_tag=post.theme_tag,
            npo_id=post.npo_id,
            npo_name=npo_name,
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
            author=author
        ))
    
    return result

@router.get("/my", response_model=List[VolunteerPostResponse])
async def get_my_posts(
    current_user = Depends(get_current_volunteer_user),
    db: Session = Depends(get_db)
):
    """Получение блогов текущего волонтера"""
    volunteer = db.query(Volunteer).filter(Volunteer.user_id == current_user.id).first()
    if not volunteer:
        return []
    
    posts_list = db.query(VolunteerPost).filter(
        VolunteerPost.volunteer_id == volunteer.id
    ).order_by(VolunteerPost.created_at.desc()).all()
    
    result = []
    for post in posts_list:
        tags = [t.tag for t in post.tags]
        attached_ids = [a.file_id for a in post.attachments]
        author = get_post_author(post, db)
        npo_name = None
        if post.npo_id:
            npo = db.query(NPO).filter(NPO.id == post.npo_id).first()
            if npo:
                npo_name = npo.name
        
        result.append(VolunteerPostResponse(
            id=post.id,
            name=post.name,
            annotation=post.annotation,
            text=post.text,
            city=post.city,
            theme_tag=post.theme_tag,
            npo_id=post.npo_id,
            npo_name=npo_name,
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
            author=author
        ))
    
    return result

@router.get("/pending", response_model=List[VolunteerPostResponse])
async def get_pending_posts(
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Получение блогов, ожидающих модерации (только для администраторов)"""
    posts_list = db.query(VolunteerPost).filter(
        VolunteerPost.status == VolunteerPostStatus.PENDING
    ).order_by(VolunteerPost.created_at.asc()).all()
    
    result = []
    for post in posts_list:
        tags = [t.tag for t in post.tags]
        attached_ids = [a.file_id for a in post.attachments]
        author = get_post_author(post, db)
        npo_name = None
        if post.npo_id:
            npo = db.query(NPO).filter(NPO.id == post.npo_id).first()
            if npo:
                npo_name = npo.name
        
        result.append(VolunteerPostResponse(
            id=post.id,
            name=post.name,
            annotation=post.annotation,
            text=post.text,
            city=post.city,
            theme_tag=post.theme_tag,
            npo_id=post.npo_id,
            npo_name=npo_name,
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
            author=author
        ))
    
    return result

@router.get("/{post_id}", response_model=VolunteerPostResponse)
async def get_post_by_id(post_id: int, db: Session = Depends(get_db)):
    """Получение блога по ID"""
    post = db.query(VolunteerPost).filter(VolunteerPost.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Блог не найден"
        )
    
    # Показываем только одобренные посты (или свои посты)
    # TODO: добавить проверку на автора
    
    tags = [t.tag for t in post.tags]
    attached_ids = [a.file_id for a in post.attachments]
    author = get_post_author(post, db)
    npo_name = None
    if post.npo_id:
        npo = db.query(NPO).filter(NPO.id == post.npo_id).first()
        if npo:
            npo_name = npo.name
    
    return VolunteerPostResponse(
        id=post.id,
        name=post.name,
        annotation=post.annotation,
        text=post.text,
        city=post.city,
        theme_tag=post.theme_tag,
        npo_id=post.npo_id,
        npo_name=npo_name,
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
        author=author
    )

@router.post("", response_model=VolunteerPostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: VolunteerPostCreate,
    current_user = Depends(get_current_volunteer_user),
    db: Session = Depends(get_db)
):
    """Создание блога волонтером"""
    volunteer = db.query(Volunteer).filter(Volunteer.user_id == current_user.id).first()
    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Волонтер не найден"
        )
    
    # Валидация тематики
    if post_data.theme_tag and post_data.theme_tag not in AVAILABLE_THEMES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимая тематика. Используйте только тематики из списка: {', '.join(AVAILABLE_THEMES)}"
        )
    
    # Валидация НКО
    if post_data.npo_id:
        npo = db.query(NPO).filter(NPO.id == post_data.npo_id).first()
        if not npo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="НКО не найдена"
            )
    
    post = VolunteerPost(
        user_id=current_user.id,
        volunteer_id=volunteer.id,
        name=post_data.name,
        annotation=post_data.annotation,
        text=post_data.text,
        city=post_data.city,
        theme_tag=post_data.theme_tag,
        npo_id=post_data.npo_id,
        status=VolunteerPostStatus.PENDING  # По умолчанию ожидает модерации
    )
    db.add(post)
    db.flush()
    
    # Добавление тегов
    if post_data.tags:
        for tag in post_data.tags:
            post_tag = VolunteerPostTag(post_id=post.id, tag=tag)
            db.add(post_tag)
    
    # Добавление вложений
    if post_data.attachedIds:
        for file_id in post_data.attachedIds:
            attachment = VolunteerPostAttachment(post_id=post.id, file_id=file_id)
            db.add(attachment)
    
    db.commit()
    db.refresh(post)
    
    tags = [t.tag for t in post.tags]
    attached_ids = [a.file_id for a in post.attachments]
    author = get_post_author(post, db)
    npo_name = None
    if post.npo_id:
        npo = db.query(NPO).filter(NPO.id == post.npo_id).first()
        if npo:
            npo_name = npo.name
    
    return VolunteerPostResponse(
        id=post.id,
        name=post.name,
        annotation=post.annotation,
        text=post.text,
        city=post.city,
        theme_tag=post.theme_tag,
        npo_id=post.npo_id,
        npo_name=npo_name,
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
        author=author
    )

@router.put("/{post_id}", response_model=VolunteerPostResponse)
async def update_post(
    post_id: int,
    post_update: VolunteerPostUpdate,
    current_user = Depends(get_current_volunteer_user),
    db: Session = Depends(get_db)
):
    """Редактирование блога (только автором и только если не одобрен)"""
    post = db.query(VolunteerPost).filter(VolunteerPost.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Блог не найден"
        )
    
    # Проверка прав доступа
    if post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы можете редактировать только свои блоги"
        )
    
    # Можно редактировать только если пост не одобрен
    if post.status == VolunteerPostStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя редактировать одобренный блог. Создайте новый."
        )
    
    # Если редактируем, статус снова становится pending
    if post.status != VolunteerPostStatus.PENDING:
        post.status = VolunteerPostStatus.PENDING
        post.moderator_id = None
        post.moderation_comment = None
        post.moderated_at = None
    
    # Валидация тематики
    if post_update.theme_tag and post_update.theme_tag not in AVAILABLE_THEMES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимая тематика. Используйте только тематики из списка: {', '.join(AVAILABLE_THEMES)}"
        )
    
    # Валидация НКО
    if post_update.npo_id is not None:
        if post_update.npo_id:
            npo = db.query(NPO).filter(NPO.id == post_update.npo_id).first()
            if not npo:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="НКО не найдена"
                )
    
    # Обновление полей
    if post_update.name is not None:
        post.name = post_update.name
    if post_update.annotation is not None:
        post.annotation = post_update.annotation
    if post_update.text is not None:
        post.text = post_update.text
    if post_update.city is not None:
        post.city = post_update.city
    if post_update.theme_tag is not None:
        post.theme_tag = post_update.theme_tag
    if post_update.npo_id is not None:
        post.npo_id = post_update.npo_id
    
    # Обновление тегов
    if post_update.tags is not None:
        db.query(VolunteerPostTag).filter(VolunteerPostTag.post_id == post.id).delete()
        for tag in post_update.tags:
            post_tag = VolunteerPostTag(post_id=post.id, tag=tag)
            db.add(post_tag)
    
    # Обновление вложений
    if post_update.attachedIds is not None:
        db.query(VolunteerPostAttachment).filter(VolunteerPostAttachment.post_id == post.id).delete()
        for file_id in post_update.attachedIds:
            attachment = VolunteerPostAttachment(post_id=post.id, file_id=file_id)
            db.add(attachment)
    
    db.commit()
    db.refresh(post)
    
    tags = [t.tag for t in post.tags]
    attached_ids = [a.file_id for a in post.attachments]
    author = get_post_author(post, db)
    npo_name = None
    if post.npo_id:
        npo = db.query(NPO).filter(NPO.id == post.npo_id).first()
        if npo:
            npo_name = npo.name
    
    return VolunteerPostResponse(
        id=post.id,
        name=post.name,
        annotation=post.annotation,
        text=post.text,
        city=post.city,
        theme_tag=post.theme_tag,
        npo_id=post.npo_id,
        npo_name=npo_name,
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
        author=author
    )

@router.post("/{post_id}/moderate", response_model=VolunteerPostResponse)
async def moderate_post(
    post_id: int,
    moderation_data: VolunteerPostModeration,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Модерация блога администратором"""
    post = db.query(VolunteerPost).filter(VolunteerPost.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Блог не найден"
        )
    
    from datetime import datetime, timezone
    
    post.status = moderation_data.status
    post.moderator_id = current_user.id
    post.moderation_comment = moderation_data.comment
    post.moderated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(post)
    
    tags = [t.tag for t in post.tags]
    attached_ids = [a.file_id for a in post.attachments]
    author = get_post_author(post, db)
    npo_name = None
    if post.npo_id:
        npo = db.query(NPO).filter(NPO.id == post.npo_id).first()
        if npo:
            npo_name = npo.name
    
    return VolunteerPostResponse(
        id=post.id,
        name=post.name,
        annotation=post.annotation,
        text=post.text,
        city=post.city,
        theme_tag=post.theme_tag,
        npo_id=post.npo_id,
        npo_name=npo_name,
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
        author=author
    )

@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    current_user = Depends(get_current_volunteer_user),
    db: Session = Depends(get_db)
):
    """Удаление блога (только автором)"""
    post = db.query(VolunteerPost).filter(VolunteerPost.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Блог не найден"
        )
    
    # Проверка прав доступа
    if post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы можете удалять только свои блоги"
        )
    
    db.delete(post)
    db.commit()
    return {"message": "Блог успешно удален"}

