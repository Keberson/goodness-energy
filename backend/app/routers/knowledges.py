from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Knowledge, KnowledgeTag, KnowledgeAttachment, File as FileModel, News, NewsType, UserRole, User
from app.schemas import KnowledgeCreate, KnowledgeUpdate, KnowledgeResponse
from app.auth import get_current_admin_user
from app.minio_client import get_file_from_minio
from urllib.parse import quote
import logging
import zipfile
import io
import os

logger = logging.getLogger(__name__)

def get_content_type(file_type: str) -> str:
    """Возвращает MIME тип для файла"""
    content_types = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "pdf": "application/pdf",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "doc": "application/msword",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "txt": "text/plain",
        "csv": "text/csv"
    }
    return content_types.get(file_type.lower(), "application/octet-stream")

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

@router.get("/{knowledge_id}", response_model=KnowledgeResponse)
async def get_knowledge_by_id(knowledge_id: int, db: Session = Depends(get_db)):
    """Получение записи из базы знаний по ID"""
    knowledge = db.query(Knowledge).filter(Knowledge.id == knowledge_id).first()
    if not knowledge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Запись в базе знаний не найдена"
        )
    
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
    
    # Создаем системную новость о новом материале в базе знаний
    try:
        # Получаем базовый URL фронтенда
        FRONTEND_BASE_URL_ENV = os.getenv("FRONTEND_BASE_URL", "").strip()
        if FRONTEND_BASE_URL_ENV:
            frontend_url = FRONTEND_BASE_URL_ENV.rstrip("/")
        else:
            # Пытаемся извлечь из VITE_API_PROD_BASE_URL
            API_PROD_URL = os.getenv("VITE_API_PROD_BASE_URL", "").strip()
            if API_PROD_URL:
                if API_PROD_URL.endswith("/api"):
                    frontend_url = API_PROD_URL[:-4].rstrip("/")
                elif API_PROD_URL.endswith("/api/"):
                    frontend_url = API_PROD_URL[:-5].rstrip("/")
                else:
                    frontend_url = API_PROD_URL.rstrip("/")
            else:
                frontend_url = "http://localhost:5173"
        
        # Создаем ссылку на материал
        knowledge_link = f"{frontend_url}/knowledges/{knowledge.id}"
        
        # Создаем системную новость
        system_news = News(
            user_id=current_user.id,
            admin_id=current_user.id,
            name=f"Создан новый материал: {knowledge.name}",
            annotation=f"В базе знаний появился новый материал: {knowledge.name}",
            text=f'<p>Создан новый материал в базе знаний: <strong>{knowledge.name}</strong></p><p><a href="{knowledge_link}">Перейти к материалу</a></p>',
            type=NewsType.SYSTEM,
            city=None  # Системные новости не привязаны к городу
        )
        db.add(system_news)
        db.commit()
        logger.info(f"Создана системная новость о материале {knowledge.id}")
    except Exception as e:
        logger.error(f"Ошибка при создании системной новости: {e}")
        # Не прерываем выполнение, если не удалось создать новость
    
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

@router.get("/{knowledge_id}/download")
async def download_knowledge_files(
    knowledge_id: int,
    db: Session = Depends(get_db)
):
    """Скачивание всех файлов базы знаний (архив если файлов много, один файл если один)"""
    knowledge = db.query(Knowledge).filter(Knowledge.id == knowledge_id).first()
    if not knowledge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Запись в базе знаний не найдена"
        )
    
    # Получаем все файлы из attachments
    attachments = db.query(KnowledgeAttachment).filter(
        KnowledgeAttachment.knowledge_id == knowledge_id
    ).all()
    
    if not attachments:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="У записи нет прикрепленных файлов"
        )
    
    # Получаем информацию о файлах
    file_ids = [att.file_id for att in attachments]
    files = db.query(FileModel).filter(FileModel.id.in_(file_ids)).all()
    
    if len(files) == 1:
        # Если один файл - отдаем его напрямую
        file = files[0]
        try:
            file_data = get_file_from_minio(file.file_path)
            content_type = get_content_type(file.file_type)
            
            # Правильное кодирование имени файла для заголовка Content-Disposition
            try:
                filename_ascii = file.filename.encode('ascii').decode('ascii')
                content_disposition = f'attachment; filename="{filename_ascii}"'
            except UnicodeEncodeError:
                filename_utf8 = quote(file.filename.encode('utf-8'), safe='')
                filename_ascii = file.filename.encode('ascii', 'ignore').decode('ascii') or 'file'
                content_disposition = f'attachment; filename="{filename_ascii}"; filename*=UTF-8\'\'{filename_utf8}'
            
            return Response(
                content=file_data,
                media_type=content_type,
                headers={
                    "Content-Disposition": content_disposition
                }
            )
        except Exception as e:
            logger.error(f"Ошибка получения файла из MinIO: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Не удалось получить файл из хранилища: {str(e)}"
            )
    else:
        # Если файлов несколько - создаем ZIP архив
        try:
            zip_buffer = io.BytesIO()
            
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                for file in files:
                    try:
                        file_data = get_file_from_minio(file.file_path)
                        # Используем оригинальное имя файла в архиве
                        zip_file.writestr(file.filename, file_data)
                    except Exception as e:
                        logger.warning(f"Не удалось добавить файл {file.filename} в архив: {str(e)}")
                        # Продолжаем работу, даже если один файл не удалось добавить
            
            zip_buffer.seek(0)
            
            # Формируем имя архива на основе названия базы знаний
            archive_name = f"{knowledge.name}.zip"
            # Очищаем имя от недопустимых символов
            archive_name = "".join(c for c in archive_name if c.isalnum() or c in (' ', '-', '_', '.')).strip()
            if not archive_name:
                archive_name = f"knowledge_{knowledge_id}_files.zip"
            
            # Правильное кодирование имени архива
            try:
                filename_ascii = archive_name.encode('ascii').decode('ascii')
                content_disposition = f'attachment; filename="{filename_ascii}"'
            except UnicodeEncodeError:
                filename_utf8 = quote(archive_name.encode('utf-8'), safe='')
                filename_ascii = archive_name.encode('ascii', 'ignore').decode('ascii') or 'files.zip'
                content_disposition = f'attachment; filename="{filename_ascii}"; filename*=UTF-8\'\'{filename_utf8}'
            
            return Response(
                content=zip_buffer.getvalue(),
                media_type="application/zip",
                headers={
                    "Content-Disposition": content_disposition
                }
            )
        except Exception as e:
            logger.error(f"Ошибка создания архива: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Не удалось создать архив: {str(e)}"
            )

