from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy import text
from app.database import engine, Base, SessionLocal
from app.routers import auth, npo, volunteer, admin, news, files, map, knowledges, events, favorites, volunteer_posts
from app.minio_client import ensure_bucket_exists
from app.models import User
from pathlib import Path
import traceback
import logging
import os

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Включаем DEBUG логирование для email_service для диагностики
logging.getLogger("app.email_service").setLevel(logging.DEBUG)

# Проверяем SMTP настройки при старте
logger.info("=" * 50)
logger.info("Проверка переменных окружения SMTP:")
logger.info(f"  SMTP_HOST: {os.getenv('SMTP_HOST', 'НЕ УСТАНОВЛЕН')}")
logger.info(f"  SMTP_PORT: {os.getenv('SMTP_PORT', 'НЕ УСТАНОВЛЕН')}")
logger.info(f"  SMTP_USER: {os.getenv('SMTP_USER', 'НЕ УСТАНОВЛЕН')}")
logger.info(f"  SMTP_PASSWORD: {'УСТАНОВЛЕН' if os.getenv('SMTP_PASSWORD') else 'НЕ УСТАНОВЛЕН'}")
logger.info(f"  SMTP_FROM_EMAIL: {os.getenv('SMTP_FROM_EMAIL', 'НЕ УСТАНОВЛЕН')}")
logger.info(f"  SMTP_USE_TLS: {os.getenv('SMTP_USE_TLS', 'НЕ УСТАНОВЛЕН')}")
logger.info("=" * 50)

app = FastAPI(title="Social Hack 2025 API", version="1.0.0")

# CORS middleware должен быть добавлен ПЕРЕД всеми остальными middleware и роутерами
# Используем конкретные origins вместо "*" для совместимости с allow_credentials
# Можно настроить через переменную окружения CORS_ORIGINS (разделенные запятой)
cors_origins_env = os.getenv("CORS_ORIGINS", "")
if cors_origins_env:
    # Если указаны origins через переменную окружения, используем их
    cors_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
else:
    # По умолчанию для локальной разработки
    cors_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Глобальный обработчик исключений
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Обработчик всех необработанных исключений"""
    logger.error(f"Необработанное исключение: {exc}", exc_info=True)
    logger.error(f"Путь запроса: {request.url.path}")
    logger.error(f"Метод: {request.method}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": f"Внутренняя ошибка сервера: {str(exc)}",
            "type": type(exc).__name__
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Обработчик ошибок валидации"""
    logger.error(f"Ошибка валидации: {exc.errors()}")
    logger.error(f"Путь запроса: {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": exc.body}
    )

@app.on_event("startup")
async def startup_event():
    # Создаем таблицы
    Base.metadata.create_all(bind=engine)
    
    # Инициализация MinIO bucket
    try:
        ensure_bucket_exists()
    except Exception as e:
        logger.warning(f"Не удалось инициализировать MinIO bucket: {e}")
    
    # Выполняем init-data.sql если он существует и база пустая
    init_data_path = Path(__file__).parent / "init-data.sql"
    if init_data_path.exists():
        try:
            db = SessionLocal()
            try:
                # Проверяем, есть ли уже данные в базе
                user_count = db.query(User).count()
            finally:
                db.close()
            
            if user_count == 0:
                # Читаем весь SQL файл
                with open(init_data_path, "r", encoding="utf-8") as f:
                    sql_content = f.read()
                
                # Удаляем только однострочные комментарии (которые начинаются с -- в начале строки)
                lines = []
                for line in sql_content.split('\n'):
                    stripped_line = line.strip()
                    if stripped_line.startswith('--'):
                        continue  # Пропускаем строки-комментарии
                    # Удаляем комментарии в конце строки, но только если они не внутри кавычек
                    if '--' in line and not is_inside_quotes(line, line.find('--')):
                        line = line.split('--')[0].rstrip()
                    lines.append(line)
                
                sql_content = '\n'.join(lines)
                
                # Выполняем весь SQL одной транзакцией
                with engine.connect() as conn:
                    # Используем transaction() вместо begin() для лучшей совместимости
                    with conn.begin() as transaction:
                        try:
                            # Выполняем весь SQL как есть
                            conn.execute(text(sql_content))
                            logger.info("init-data.sql выполнен успешно")
                        except Exception as e:
                            logger.error(f"Ошибка выполнения SQL: {e}")
                            raise
        except Exception as e:
            logger.error(f"Не удалось выполнить init-data.sql: {e}")
            logger.error(traceback.format_exc())

def is_inside_quotes(text, position):
    """
    Проверяет, находится ли позиция внутри строки в кавычках
    """
    in_single_quotes = False
    in_double_quotes = False
    escape_next = False
    
    for i, char in enumerate(text):
        if i >= position:
            break
            
        if escape_next:
            escape_next = False
            continue
            
        if char == '\\':
            escape_next = True
            continue
            
        if char == "'" and not in_double_quotes:
            in_single_quotes = not in_single_quotes
        elif char == '"' and not in_single_quotes:
            in_double_quotes = not in_double_quotes
    
    return in_single_quotes or in_double_quotes

# Подключение роутеров
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(map.router, prefix="/map", tags=["map"])
app.include_router(npo.router, prefix="/npo", tags=["npo"])
app.include_router(volunteer.router, prefix="/volunteer", tags=["volunteer"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(news.router, prefix="/news", tags=["news"])
app.include_router(volunteer_posts.router, prefix="/volunteer-posts", tags=["volunteer-posts"])
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(knowledges.router, prefix="/knowledges", tags=["knowledges"])
app.include_router(events.router, prefix="/events", tags=["events"])
app.include_router(favorites.router, prefix="/favorites", tags=["favorites"])

@app.get("/")
async def root():
    return {"message": "Social Hack 2025 API"}

@app.get("/test-smtp")
async def test_smtp():
    """Тестовый эндпоинт для проверки SMTP настроек"""
    from app.email_service import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_USE_TLS
    
    return {
        "smtp_host": SMTP_HOST,
        "smtp_port": SMTP_PORT,
        "smtp_user": SMTP_USER,
        "smtp_password_set": bool(SMTP_PASSWORD),
        "smtp_from_email": SMTP_FROM_EMAIL,
        "smtp_use_tls": SMTP_USE_TLS,
        "smtp_configured": bool(SMTP_USER and SMTP_PASSWORD),
        "env_vars": {
            "SMTP_HOST": os.getenv("SMTP_HOST", "НЕ УСТАНОВЛЕН"),
            "SMTP_PORT": os.getenv("SMTP_PORT", "НЕ УСТАНОВЛЕН"),
            "SMTP_USER": os.getenv("SMTP_USER", "НЕ УСТАНОВЛЕН"),
            "SMTP_PASSWORD": "УСТАНОВЛЕН" if os.getenv("SMTP_PASSWORD") else "НЕ УСТАНОВЛЕН",
            "SMTP_FROM_EMAIL": os.getenv("SMTP_FROM_EMAIL", "НЕ УСТАНОВЛЕН"),
            "SMTP_USE_TLS": os.getenv("SMTP_USE_TLS", "НЕ УСТАНОВЛЕН"),
        }
    }

