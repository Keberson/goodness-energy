from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database import engine, Base, SessionLocal
from app.routers import auth, npo, volunteer, admin, news, files, map, knowledges, events, favorites
from app.minio_client import ensure_bucket_exists
from app.models import User
from pathlib import Path
import traceback
import logging
import os

logger = logging.getLogger(__name__)

app = FastAPI(title="Social Hack 2025 API", version="1.0.0")

# CORS middleware должен быть добавлен сразу после создания app
# Получаем разрешенные origins из переменных окружения или используем по умолчанию
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://89.169.178.111,http://localhost:5173,http://localhost:3000")

# Разбиваем строку на список origins
allow_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

# Если origins не указаны, используем дефолтные значения
if not allow_origins:
    allow_origins = ["http://89.169.178.111", "http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,  # Явно указываем разрешенные origins
    allow_credentials=True,  # Разрешаем credentials для работы с cookies и авторизацией
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Кэширование preflight запросов на 1 час
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
                # База пустая, выполняем init-data.sql используя SQLAlchemy engine
                with open(init_data_path, "r", encoding="utf-8") as f:
                    sql_content = f.read()
                
                # Удаляем комментарии и пустые строки
                lines = sql_content.split('\n')
                cleaned_lines = []
                for line in lines:
                    # Удаляем комментарии из строки (все что после --)
                    if '--' in line:
                        comment_pos = line.find('--')
                        before_comment = line[:comment_pos]
                        # Простая проверка - если перед -- нет открывающей одинарной кавычки
                        if "'" not in before_comment or before_comment.count("'") % 2 == 0:
                            line = line[:comment_pos].rstrip()
                    
                    if line.strip():
                        cleaned_lines.append(line)
                
                sql_content = '\n'.join(cleaned_lines)
                
                # Удаляем BEGIN; и COMMIT; так как транзакцию управляем сами
                sql_content = sql_content.replace("BEGIN;", "").replace("COMMIT;", "").strip()
                
                # Разбиваем на команды по точке с запятой и выполняем
                statements = [s.strip() for s in sql_content.split(';') if s.strip()]
                sql_keywords = ['INSERT', 'SELECT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP']
                
                with engine.connect() as conn:
                    trans = conn.begin()
                    try:
                        for i, statement in enumerate(statements, 1):
                            cleaned_statement = statement.replace('\n', ' ').replace('\r', ' ').strip()
                            if not cleaned_statement:
                                continue
                            
                            # Проверяем, что команда содержит SQL ключевые слова
                            upper_statement = cleaned_statement.upper()
                            if not any(keyword in upper_statement for keyword in sql_keywords):
                                logger.warning(f"Пропуск не-SQL команды #{i}: {cleaned_statement[:50]}...")
                                continue
                            
                            try:
                                conn.execute(text(statement))
                            except Exception as e:
                                logger.error(f"Ошибка выполнения команды #{i}: {statement[:200]}...")
                                logger.error(f"Полная ошибка: {e}")
                                raise
                        trans.commit()
                        logger.info("init-data.sql выполнен успешно")
                    except Exception as e:
                        trans.rollback()
                        raise
        except Exception as e:
            logger.error(f"Не удалось выполнить init-data.sql: {e}")
            logger.error(traceback.format_exc())

# Подключение роутеров
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(map.router, prefix="/map", tags=["map"])
app.include_router(npo.router, prefix="/npo", tags=["npo"])
app.include_router(volunteer.router, prefix="/volunteer", tags=["volunteer"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(news.router, prefix="/news", tags=["news"])
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(knowledges.router, prefix="/knowledges", tags=["knowledges"])
app.include_router(events.router, prefix="/events", tags=["events"])
app.include_router(favorites.router, prefix="/favorites", tags=["favorites"])

@app.get("/")
async def root():
    return {"message": "Social Hack 2025 API"}

