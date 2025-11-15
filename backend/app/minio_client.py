from minio import Minio
from minio.error import S3Error
import os
import io
import logging

logger = logging.getLogger(__name__)

# Конфигурация MinIO из переменных окружения
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ROOT_USER", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_ROOT_PASSWORD", "minioadmin")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "files")

# Создаем клиент MinIO
minio_client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=MINIO_SECURE
)

def ensure_bucket_exists(bucket_name: str = MINIO_BUCKET):
    """Проверяет существование bucket и создает его, если не существует"""
    try:
        if not minio_client.bucket_exists(bucket_name):
            minio_client.make_bucket(bucket_name)
            logger.info(f"Bucket '{bucket_name}' успешно создан")
        else:
            logger.debug(f"Bucket '{bucket_name}' уже существует")
    except S3Error as e:
        logger.error(f"Ошибка создания bucket: {e}")
        raise

def upload_file_to_minio(file_data: bytes, object_name: str, bucket_name: str = MINIO_BUCKET) -> str:
    """Загружает файл в MinIO и возвращает путь к объекту"""
    ensure_bucket_exists(bucket_name)
    
    file_stream = io.BytesIO(file_data)
    file_length = len(file_data)
    
    try:
        minio_client.put_object(
            bucket_name,
            object_name,
            file_stream,
            length=file_length
        )
        return f"{bucket_name}/{object_name}"
    except S3Error as e:
        logger.error(f"Ошибка загрузки файла в MinIO: {e}")
        raise

def get_file_from_minio(object_name: str, bucket_name: str = MINIO_BUCKET) -> bytes:
    """Получает файл из MinIO и возвращает его содержимое"""
    try:
        # Проверяем существование bucket
        if not minio_client.bucket_exists(bucket_name):
            raise Exception(f"Bucket '{bucket_name}' не существует")
        
        # Проверяем существование объекта
        try:
            minio_client.stat_object(bucket_name, object_name)
        except S3Error as stat_error:
            raise Exception(f"Объект '{object_name}' не найден в bucket '{bucket_name}': {stat_error}")
        
        response = minio_client.get_object(bucket_name, object_name)
        file_data = response.read()
        response.close()
        response.release_conn()
        return file_data
    except S3Error as e:
        error_msg = f"Ошибка MinIO S3: {e} (bucket: {bucket_name}, object: {object_name})"
        logger.error(f"Ошибка получения файла из MinIO: {error_msg}")
        raise Exception(error_msg) from e
    except Exception as e:
        error_msg = f"Ошибка получения файла из MinIO: {e} (bucket: {bucket_name}, object: {object_name})"
        logger.error(error_msg)
        raise

def delete_file_from_minio(object_name: str, bucket_name: str = MINIO_BUCKET) -> bool:
    """Удаляет файл из MinIO"""
    try:
        minio_client.remove_object(bucket_name, object_name)
        return True
    except S3Error as e:
        logger.error(f"Ошибка удаления файла из MinIO: {e}")
        raise

def get_file_url(object_name: str, bucket_name: str = MINIO_BUCKET, expires_in_seconds: int = 3600) -> str:
    """Генерирует временный URL для доступа к файлу"""
    try:
        url = minio_client.presigned_get_object(
            bucket_name,
            object_name,
            expires=expires_in_seconds
        )
        return url
    except S3Error as e:
        logger.error(f"Ошибка генерации presigned URL: {e}")
        raise

