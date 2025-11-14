from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import News
from app.schemas import NewsResponse

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

