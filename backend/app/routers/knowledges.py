from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Knowledge, KnowledgeTag, KnowledgeAttachment
from app.schemas import KnowledgeCreate, KnowledgeUpdate, KnowledgeResponse
from app.auth import get_current_admin_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("", response_model=List[KnowledgeResponse])
async def get_all_knowledges(db: Session = Depends(get_db)):
    """Получение всех данных из базы знаний"""
    knowledges = db.query(Knowledge).order_by(Knowledge.created_at.desc()).all()
    result = []
    
    for knowledge in knowledges:
        tags = [t.tag for t in knowledge.tags]
        attached_ids = [a.file_id for a in knowledge.attachments]
        
        result.append(KnowledgeResponse(
            id=knowledge.id,
            name=knowledge.name,
            text=knowledge.text,
            attachedIds=attached_ids,
            tags=tags,
            links=knowledge.links,
            created_at=knowledge.created_at
        ))
    
    return result

@router.post("", response_model=KnowledgeResponse, status_code=status.HTTP_201_CREATED)
async def create_knowledge(
    knowledge_data: KnowledgeCreate,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Публикация нового поста в базе знаний (только для администратора)"""
    knowledge = Knowledge(
        name=knowledge_data.name,
        text=knowledge_data.text,
        links=knowledge_data.links
    )
    db.add(knowledge)
    db.flush()
    
    # Добавление тегов
    if knowledge_data.tags:
        for tag in knowledge_data.tags:
            knowledge_tag = KnowledgeTag(knowledge_id=knowledge.id, tag=tag)
            db.add(knowledge_tag)
    
    # Добавление вложений
    if knowledge_data.attachedIds:
        for file_id in knowledge_data.attachedIds:
            attachment = KnowledgeAttachment(knowledge_id=knowledge.id, file_id=file_id)
            db.add(attachment)
    
    db.commit()
    db.refresh(knowledge)
    
    tags = [t.tag for t in knowledge.tags]
    attached_ids = [a.file_id for a in knowledge.attachments]
    
    return KnowledgeResponse(
        id=knowledge.id,
        name=knowledge.name,
        text=knowledge.text,
        attachedIds=attached_ids,
        tags=tags,
        links=knowledge.links,
        created_at=knowledge.created_at
    )

@router.put("/{knowledge_id}", response_model=KnowledgeResponse)
async def update_knowledge(
    knowledge_id: int,
    knowledge_update: KnowledgeUpdate,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Редактирование записи в базе знаний (только для администратора)"""
    knowledge = db.query(Knowledge).filter(Knowledge.id == knowledge_id).first()
    if not knowledge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Запись в базе знаний не найдена"
        )
    
    # Обновление полей
    if knowledge_update.name is not None:
        knowledge.name = knowledge_update.name
    if knowledge_update.text is not None:
        knowledge.text = knowledge_update.text
    if knowledge_update.links is not None:
        knowledge.links = knowledge_update.links
    
    # Обновление тегов
    if knowledge_update.tags is not None:
        db.query(KnowledgeTag).filter(KnowledgeTag.knowledge_id == knowledge.id).delete()
        for tag in knowledge_update.tags:
            knowledge_tag = KnowledgeTag(knowledge_id=knowledge.id, tag=tag)
            db.add(knowledge_tag)
    
    # Обновление вложений
    if knowledge_update.attachedIds is not None:
        db.query(KnowledgeAttachment).filter(KnowledgeAttachment.knowledge_id == knowledge.id).delete()
        for file_id in knowledge_update.attachedIds:
            attachment = KnowledgeAttachment(knowledge_id=knowledge.id, file_id=file_id)
            db.add(attachment)
    
    db.commit()
    db.refresh(knowledge)
    
    tags = [t.tag for t in knowledge.tags]
    attached_ids = [a.file_id for a in knowledge.attachments]
    
    return KnowledgeResponse(
        id=knowledge.id,
        name=knowledge.name,
        text=knowledge.text,
        attachedIds=attached_ids,
        tags=tags,
        links=knowledge.links,
        created_at=knowledge.created_at
    )

@router.delete("/{knowledge_id}")
async def delete_knowledge(
    knowledge_id: int,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Удаление записи из базы знаний (только для администратора)"""
    knowledge = db.query(Knowledge).filter(Knowledge.id == knowledge_id).first()
    if not knowledge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Запись в базе знаний не найдена"
        )
    
    db.delete(knowledge)
    db.commit()
    return {"message": "Запись в базе знаний успешно удалена"}

