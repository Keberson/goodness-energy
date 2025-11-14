from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import File as FileModel
from app.schemas import FileResponse
from app.auth import get_current_user
import os
import uuid
from pathlib import Path

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "pdf", "docx", "doc", "xlsx", "txt", "csv"}

def get_file_type(filename: str) -> str:
    ext = filename.split(".")[-1].lower()
    if ext == "jpeg":
        return "jpg"
    return ext

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
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Генерация уникального имени файла
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Сохранение файла
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Сохранение информации о файле в БД
    db_file = FileModel(
        filename=file.filename,
        file_type=file_ext,
        file_path=str(file_path)
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return FileResponse(id=db_file.id, filename=db_file.filename, file_type=db_file.file_type)

