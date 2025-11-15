from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import File as FileModel
from app.schemas import FileResponse
from app.auth import get_current_user
from app.minio_client import upload_file_to_minio, get_file_from_minio, delete_file_from_minio, MINIO_BUCKET
from urllib.parse import quote
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "pdf", "docx", "doc", "xlsx", "txt", "csv"}

def get_file_type(filename: str) -> str:
    ext = filename.split(".")[-1].lower()
    if ext == "jpeg":
        return "jpg"
    return ext

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

@router.post("", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Проверка расширения файла
    file_ext = get_file_type(file.filename)
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Тип файла не разрешен. Разрешенные типы: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Генерация уникального имени файла
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    
    # Чтение содержимого файла
    content = await file.read()
    
    # Загрузка файла в MinIO
    try:
        minio_path = upload_file_to_minio(content, unique_filename)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Не удалось загрузить файл в хранилище: {str(e)}"
        )
    
    # Сохранение информации о файле в БД
    db_file = FileModel(
        filename=file.filename,
        file_type=file_ext,
        file_path=unique_filename  # Сохраняем только имя объекта в MinIO
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return FileResponse(id=db_file.id, filename=db_file.filename, file_type=db_file.file_type)

@router.get("/{file_id}")
async def get_file(
    file_id: int,
    db: Session = Depends(get_db)
):
    """Получение файла по ID"""
    db_file = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not db_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Файл с id {file_id} не найден в базе данных"
        )
    
    try:
        # Получаем файл из MinIO
        # db_file.file_path содержит имя объекта в MinIO (например, "abc123.jpg")
        logger.debug(f"Попытка получить файл из MinIO: bucket={MINIO_BUCKET}, object_name={db_file.file_path}")
        file_data = get_file_from_minio(db_file.file_path)
        content_type = get_content_type(db_file.file_type)
        
        # Правильное кодирование имени файла для заголовка Content-Disposition
        # Используем RFC 2231 формат для поддержки не-ASCII символов (кириллица и т.д.)
        try:
            # Пробуем использовать оригинальное имя, если оно ASCII-совместимо
            filename_ascii = db_file.filename.encode('ascii').decode('ascii')
            # Если имя ASCII-совместимо, используем простое кодирование
            content_disposition = f'inline; filename="{filename_ascii}"'
        except UnicodeEncodeError:
            # Если имя содержит не-ASCII символы, используем RFC 2231 формат
            filename_utf8 = quote(db_file.filename.encode('utf-8'), safe='')
            # Fallback на ASCII версию для старых клиентов
            filename_ascii = db_file.filename.encode('ascii', 'ignore').decode('ascii') or 'file'
            content_disposition = f'inline; filename="{filename_ascii}"; filename*=UTF-8\'\'{filename_utf8}'
        
        return Response(
            content=file_data,
            media_type=content_type,
            headers={
                "Content-Disposition": content_disposition
            }
        )
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Ошибка получения файла из MinIO: {error_msg}")
        logger.error(f"Информация о файле: id={db_file.id}, file_path={db_file.file_path}, bucket={MINIO_BUCKET}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Не удалось получить файл из хранилища. ID файла: {file_id}, Путь: {db_file.file_path}, Ошибка: {error_msg}"
        )

@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удаление файла по ID"""
    db_file = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not db_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Файл не найден"
        )
    
    try:
        # Удаляем файл из MinIO
        delete_file_from_minio(db_file.file_path)
    except Exception as e:
        # Логируем ошибку, но продолжаем удаление из БД
        logger.warning(f"Не удалось удалить файл из MinIO: {e}")
    
    # Удаляем запись из БД
    db.delete(db_file)
    db.commit()
    
    return None

