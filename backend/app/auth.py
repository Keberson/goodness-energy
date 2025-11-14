from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole

SECRET_KEY = "your-secret-key-change-in-production"  # В продакшене использовать переменную окружения
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
        print(f"ERROR: Invalid bcrypt hash format. Hash starts with: {hashed_password[:10]}")
        print(f"ERROR: Full hash length: {len(hashed_password)}")
        # Возможно, в базе данных хранится не хеш, а сам пароль или что-то другое
        return False
    
    # Ограничение длины пароля для bcrypt (72 байта)
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        plain_password = plain_password[:72]
        password_bytes = plain_password.encode('utf-8')
    
    # Логирование для отладки
    print(f"DEBUG: plain_password length (bytes): {len(password_bytes)}")
    print(f"DEBUG: hashed_password length: {len(hashed_password) if isinstance(hashed_password, str) else 'N/A'}")
    print(f"DEBUG: hashed_password starts with: {hashed_password[:20] if isinstance(hashed_password, str) and len(hashed_password) > 20 else hashed_password}")
    
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except (ValueError, TypeError) as e:
        # Логируем ошибку для отладки
        print(f"Error verifying password: {e}")
        print(f"Password type: {type(plain_password)}, length: {len(plain_password) if isinstance(plain_password, str) else 'N/A'}")
        print(f"Hash type: {type(hashed_password)}, length: {len(hashed_password) if isinstance(hashed_password, str) else 'N/A'}")
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
        raise ValueError("Password cannot be empty")
    
    # Убеждаемся, что пароль - это строка
    if not isinstance(password, str):
        password = str(password)
    
    # Ограничение длины пароля для bcrypt (72 байта)
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        print(f"WARNING: Password too long ({len(password_bytes)} bytes), truncating to 72 bytes")
        password = password[:72]
        password_bytes = password.encode('utf-8')
    
    print(f"DEBUG HASH: Creating hash for password of length {len(password_bytes)} bytes")
    hashed = pwd_context.hash(password)
    print(f"DEBUG HASH: Created hash of length {len(hashed)}, starts with: {hashed[:20]}")
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

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    return user

def get_current_npo_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.NPO:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def get_current_volunteer_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.VOLUNTEER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def get_current_admin_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

