from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole
import logging
import os

logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")  # В продакшене обязательно установить переменную окружения SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 дней

# Инициализация CryptContext
# Патч для обхода проблемы с длинным тестовым хешем при определении версии bcrypt
import passlib.handlers.bcrypt as bcrypt_module

# Сохраняем оригинальную функцию detect_wrap_bug
if hasattr(bcrypt_module, 'detect_wrap_bug'):
    _original_detect_wrap_bug = bcrypt_module.detect_wrap_bug
    
    def _patched_detect_wrap_bug(ident):
        """Патч для detect_wrap_bug, который использует короткий секрет"""
        try:
            # Используем короткий секрет вместо длинного тестового
            secret = b"test" * 10  # 40 байт - безопасная длина
            bug_hash = bcrypt_module._test_hash(ident)
            from passlib.utils.handlers import consteq
            from passlib.handlers.bcrypt import _bcrypt
            test_hash = _bcrypt.hashpw(secret, bug_hash)
            return not consteq(test_hash, bug_hash)
        except Exception:
            return False
    
    # Применяем патч ДО инициализации CryptContext
    bcrypt_module.detect_wrap_bug = _patched_detect_wrap_bug

# Теперь инициализируем CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Проверка пароля.
    
    Args:
        plain_password: Пароль в открытом виде (строка)
        hashed_password: Хешированный пароль (строка)
    
    Returns:
        True если пароль совпадает, False иначе
    """
    if not plain_password or not hashed_password:
        return False
    
    # Убеждаемся, что пароль - это строка
    if not isinstance(plain_password, str):
        plain_password = str(plain_password)
    
    # Убеждаемся, что хеш - это строка
    if not isinstance(hashed_password, str):
        hashed_password = str(hashed_password)
    
    # Очистка хеша от лишних пробелов и переносов строк
    hashed_password = hashed_password.strip()
    
    # Проверка формата хеша bcrypt (должен начинаться с $2a$, $2b$ или $2y$)
    if not hashed_password.startswith(('$2a$', '$2b$', '$2y$')):
        logger.error(f"Неверный формат bcrypt хеша. Хеш начинается с: {hashed_password[:10]}")
        logger.error(f"Полная длина хеша: {len(hashed_password)}")
        # Возможно, в базе данных хранится не хеш, а сам пароль или что-то другое
        return False
    
    # Ограничение длины пароля для bcrypt (72 байта)
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        plain_password = plain_password[:72]
        password_bytes = plain_password.encode('utf-8')
    
    # Логирование для отладки
    logger.debug(f"Длина plain_password (байты): {len(password_bytes)}")
    logger.debug(f"Длина hashed_password: {len(hashed_password) if isinstance(hashed_password, str) else 'N/A'}")
    logger.debug(f"hashed_password начинается с: {hashed_password[:20] if isinstance(hashed_password, str) and len(hashed_password) > 20 else hashed_password}")
    
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except (ValueError, TypeError) as e:
        # Логируем ошибку для отладки
        logger.error(f"Ошибка проверки пароля: {e}")
        logger.error(f"Тип пароля: {type(plain_password)}, длина: {len(plain_password) if isinstance(plain_password, str) else 'N/A'}")
        logger.error(f"Тип хеша: {type(hashed_password)}, длина: {len(hashed_password) if isinstance(hashed_password, str) else 'N/A'}")
        return False

def get_password_hash(password: str) -> str:
    """
    Хеширование пароля.
    
    Args:
        password: Пароль в открытом виде (строка)
    
    Returns:
        Хешированный пароль
    """
    if not password:
        raise ValueError("Пароль не может быть пустым")
    
    # Убеждаемся, что пароль - это строка
    if not isinstance(password, str):
        password = str(password)
    
    # Ограничение длины пароля для bcrypt (72 байта)
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        logger.warning(f"Пароль слишком длинный ({len(password_bytes)} байт), обрезаем до 72 байт")
        password = password[:72]
        password_bytes = password.encode('utf-8')
    
    logger.debug(f"Создание хеша для пароля длиной {len(password_bytes)} байт")
    hashed = pwd_context.hash(password)
    logger.debug(f"Создан хеш длиной {len(hashed)}, начинается с: {hashed[:20]}")
    return hashed

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_token_from_request(request: Request) -> Optional[str]:
    """Извлекает токен из заголовка Authorization"""
    authorization = request.headers.get("Authorization")
    if not authorization:
        return None
    
    if authorization.startswith("Bearer "):
        return authorization[7:]
    return None

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Пробуем получить токен из HTTPBearer
    token = None
    if credentials:
        token = credentials.credentials
        logger.debug(f"Токен из HTTPBearer (первые 20 символов): {token[:20] if token else 'None'}...")
    
    # Если токен не получен через HTTPBearer, пробуем извлечь напрямую из Request
    if not token:
        token = get_token_from_request(request)
        logger.debug(f"Токен из Request (первые 20 символов): {token[:20] if token else 'None'}...")
    
    if not token:
        logger.debug("Токен не найден")
        raise credentials_exception
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        logger.debug(f"Декодированный user_id (как строка): {user_id_str}")
        if user_id_str is None:
            logger.debug("user_id равен None в payload")
            raise credentials_exception
        # Преобразуем строку обратно в int
        user_id: int = int(user_id_str)
        logger.debug(f"Преобразован user_id в int: {user_id}")
    except (JWTError, ValueError, TypeError) as e:
        logger.debug(f"Ошибка декодирования токена: {e}")
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        logger.debug(f"Пользователь с id {user_id} не найден")
        raise credentials_exception
    
    logger.debug(f"Успешная аутентификация пользователя: {user.login}, роль: {user.role}")
    return user

def get_current_npo_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.NPO:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав доступа"
        )
    return current_user

def get_current_volunteer_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.VOLUNTEER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав доступа"
        )
    return current_user

def get_current_admin_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав доступа"
        )
    return current_user

async def get_optional_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Получение текущего пользователя, если он авторизован. Возвращает None для неавторизованных."""
    token = None
    if credentials:
        token = credentials.credentials
    if not token:
        token = get_token_from_request(request)
    
    if not token:
        return None
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            return None
        user_id: int = int(user_id_str)
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except (JWTError, ValueError, TypeError):
        return None

