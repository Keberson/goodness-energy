from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import News, NewsTag, NewsAttachment
from app.schemas import NewsCreate, NewsResponse
from app.auth import get_current_admin_user

router = APIRouter()

@router.post("/{admin_id}/news", response_model=NewsResponse, status_code=status.HTTP_201_CREATED)
async def create_admin_news(
    admin_id: int,
    news_data: NewsCreate,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Добавление ресурсов для Базы знаний администратором"""
    if current_user.id != admin_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create news for your own admin account"
        )
    
    news = News(
        admin_id=current_user.id,
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

