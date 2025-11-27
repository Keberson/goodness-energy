from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole, NPO, Volunteer, NPOStatus
from app.schemas import UserLogin, Token, NPORegistration, VolunteerRegistration, SelectedCityUpdate, NotificationSettingsUpdate, NotificationSettingsResponse, VKAuthCallback, VKIDAuthRequest, VKIDAuthResponse
from app.auth import verify_password, get_password_hash, create_access_token, get_current_user
from jose import jwt as jose_jwt
import json
import logging
import httpx
import os
import asyncio
import random
from urllib.parse import urlencode

logger = logging.getLogger(__name__)

router = APIRouter()

# VK OAuth настройки
VK_CLIENT_ID = os.getenv("VK_CLIENT_ID", "")
VK_CLIENT_SECRET = os.getenv("VK_CLIENT_SECRET", "")
VK_API_VERSION = "5.131"

# Определяем FRONTEND URL для redirect
# Приоритет: FRONTEND_URL > FRONTEND_BASE_URL > извлечение из VITE_API_PROD_BASE_URL > localhost
FRONTEND_URL_ENV = os.getenv("FRONTEND_URL", "").strip()
if FRONTEND_URL_ENV:
    FRONTEND_URL = FRONTEND_URL_ENV.rstrip("/")
else:
    # Используем FRONTEND_BASE_URL, если он есть
    FRONTEND_BASE_URL_ENV = os.getenv("FRONTEND_BASE_URL", "").strip()
    if FRONTEND_BASE_URL_ENV:
        FRONTEND_URL = FRONTEND_BASE_URL_ENV.rstrip("/")
    else:
        # Пытаемся извлечь базовый URL из переменной VITE_API_PROD_BASE_URL
        API_PROD_URL = os.getenv("VITE_API_PROD_BASE_URL", "").strip()
        if API_PROD_URL:
            # Убираем /api из конца, если есть
            FRONTEND_URL = API_PROD_URL.replace("/api", "").rstrip("/")
        else:
            # Fallback на localhost для разработки
            FRONTEND_URL = "http://localhost:5173"

# Определяем VK_REDIRECT_URI
# redirect_uri - это URL фронтенда, на который VK перенаправит пользователя после авторизации
# ВАЖНО: Этот URL должен ТОЧНО совпадать с тем, что указано в настройках VK приложения!
# Формат: https://your-domain.com/auth/vk/callback
# Приоритет: явно указанный VK_REDIRECT_URI > автоматически сформированный из FRONTEND_URL
VK_REDIRECT_URI_ENV = os.getenv("VK_REDIRECT_URI", "").strip()
if VK_REDIRECT_URI_ENV:
    VK_REDIRECT_URI = VK_REDIRECT_URI_ENV
else:
    # Автоматически формируем из FRONTEND_URL
    VK_REDIRECT_URI = f"{FRONTEND_URL}/auth/vk/callback"

@router.post("/reg/npo", response_model=Token)
async def register_npo(npo_data: NPORegistration, db: Session = Depends(get_db)):
    # Если регистрация через VK (есть vk_id), login и password не обязательны
    if npo_data.vk_id:
        # Проверяем, не зарегистрирован ли уже пользователь с таким vk_id
        existing_user = db.query(User).filter(User.vk_id == npo_data.vk_id).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким VK ID уже зарегистрирован"
            )
        # Генерируем логин из email или vk_id, если не указан
        login = npo_data.login or (npo_data.email or f"vk_{npo_data.vk_id}")
        password_hash = None  # При регистрации через VK пароль не нужен
    else:
        # Обычная регистрация - login и password обязательны
        if not npo_data.login or not npo_data.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Логин и пароль обязательны при обычной регистрации"
            )
        # Проверка существования пользователя
        if db.query(User).filter(User.login == npo_data.login).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Логин уже зарегистрирован"
            )
        login = npo_data.login
        password_hash = get_password_hash(npo_data.password)
    
    # Создание пользователя
    user = User(
        login=login,
        password_hash=password_hash,
        role=UserRole.NPO,
        vk_id=npo_data.vk_id,  # Привязываем VK ID если указан
        notify_city_news=False,
        notify_registrations=False,
        notify_events=False
    )
    db.add(user)
    db.flush()
    
    # Валидация координат
    if not isinstance(npo_data.coordinates, list):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Координаты должны быть списком [lat, lon], получен {type(npo_data.coordinates).__name__}"
        )
    
    if len(npo_data.coordinates) != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Координаты должны содержать ровно 2 значения [lat, lon], получено {len(npo_data.coordinates)} значение(й)"
        )
    
    try:
        lat = float(npo_data.coordinates[0])
        lon = float(npo_data.coordinates[1])
    except (ValueError, TypeError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Координаты должны быть числами [lat, lon]. Ошибка: {str(e)}"
        )
    
    # Проверка диапазона координат
    if not (-90 <= lat <= 90):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Широта должна быть в диапазоне от -90 до 90, получено {lat}"
        )
    
    if not (-180 <= lon <= 180):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Долгота должна быть в диапазоне от -180 до 180, получено {lon}"
        )
    
    # Создание НКО
    npo = NPO(
        user_id=user.id,
        name=npo_data.name,
        description=npo_data.description,
        coordinates_lat=lat,
        coordinates_lon=lon,
        address=npo_data.address,
        city=npo_data.city.value,  # Сохраняем строковое значение enum
        timetable=npo_data.timetable,
        links=json.dumps(npo_data.links) if npo_data.links else None,
        status=NPOStatus.NOT_CONFIRMED  # По умолчанию НКО не подтверждена
    )
    db.add(npo)
    db.flush()
    
    # Добавление тегов
    if npo_data.tags:
        from app.models import NPOTag
        for tag in npo_data.tags:
            npo_tag = NPOTag(npo_id=npo.id, tag=tag)
            db.add(npo_tag)
    
    db.commit()
    
    # Создание токена
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user_type": user.role.value, "id": npo.id}

@router.post("/reg/vol", response_model=Token)
async def register_volunteer(vol_data: VolunteerRegistration, db: Session = Depends(get_db)):
    # Если регистрация через VK (есть vk_id), login и password не обязательны
    if vol_data.vk_id:
        # Проверка, не привязан ли уже этот VK ID к другому пользователю
        existing_vk_user = db.query(User).filter(User.vk_id == vol_data.vk_id).first()
        if existing_vk_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Этот VK аккаунт уже привязан к другому пользователю"
            )
        
        # Генерируем login и password для VK пользователя
        login = vol_data.login or (vol_data.email if vol_data.email else f"vk_{vol_data.vk_id}")
        # Проверяем, не занят ли логин
        if db.query(User).filter(User.login == login).first():
            login = f"vk_{vol_data.vk_id}_{random.randint(1000, 9999)}"
        
        password = vol_data.password or f"vk_oauth_{vol_data.vk_id}_{os.urandom(16).hex()}"
    else:
        # Обычная регистрация - login и password обязательны
        if not vol_data.login or not vol_data.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Логин и пароль обязательны для регистрации"
            )
        
        # Проверка существования пользователя
        if db.query(User).filter(User.login == vol_data.login).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Логин уже зарегистрирован"
            )
        
        login = vol_data.login
        password = vol_data.password
    
    # Создание пользователя
    password_hash = get_password_hash(password)
    user = User(
        login=login,
        password_hash=password_hash,
        role=UserRole.VOLUNTEER,
        vk_id=vol_data.vk_id,  # Привязываем VK ID если указан
        notify_city_news=False,
        notify_registrations=False,
        notify_events=False
    )
    db.add(user)
    db.flush()
    
    # Создание волонтера
    volunteer = Volunteer(
        user_id=user.id,
        first_name=vol_data.firstName,
        second_name=vol_data.secondName,
        middle_name=vol_data.middleName,
        about=vol_data.about,
        birthday=vol_data.birthday,
        city=vol_data.city,
        sex=vol_data.sex,
        email=vol_data.email,
        phone=vol_data.phone
    )
    db.add(volunteer)
    db.commit()
    
    # Создание токена
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user_type": user.role.value, "id": volunteer.id}

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.login == user_data.login).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    
    # Определяем ID пользователя в зависимости от роли
    user_id = user.id  # По умолчанию используем user.id (для ADMIN и как fallback)
    if user.role == UserRole.NPO:
        npo = db.query(NPO).filter(NPO.user_id == user.id).first()
        if npo:
            user_id = npo.id
    elif user.role == UserRole.VOLUNTEER:
        volunteer = db.query(Volunteer).filter(Volunteer.user_id == user.id).first()
        if volunteer:
            user_id = volunteer.id
    # Для ADMIN используем user.id (уже установлено по умолчанию)
    
    return {"access_token": access_token, "token_type": "bearer", "user_type": user.role.value, "id": user_id}

@router.get("/selected-city")
async def get_selected_city(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение выбранного города пользователя"""
    return {"selected_city": current_user.selected_city}

@router.put("/selected-city")
async def update_selected_city(
    city_update: SelectedCityUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновление выбранного города пользователя"""
    current_user.selected_city = city_update.city
    db.commit()
    db.refresh(current_user)
    return {"selected_city": current_user.selected_city}

@router.get("/notification-settings", response_model=NotificationSettingsResponse)
async def get_notification_settings(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение настроек уведомлений текущего пользователя"""
    return NotificationSettingsResponse(
        notify_city_news=current_user.notify_city_news,
        notify_registrations=current_user.notify_registrations,
        notify_events=current_user.notify_events
    )

@router.put("/notification-settings", response_model=NotificationSettingsResponse)
async def update_notification_settings(
    settings_update: NotificationSettingsUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновление настроек уведомлений текущего пользователя"""
    if settings_update.notify_city_news is not None:
        current_user.notify_city_news = settings_update.notify_city_news
    if settings_update.notify_registrations is not None:
        current_user.notify_registrations = settings_update.notify_registrations
    if settings_update.notify_events is not None:
        current_user.notify_events = settings_update.notify_events
    
    db.commit()
    db.refresh(current_user)
    
    return NotificationSettingsResponse(
        notify_city_news=current_user.notify_city_news,
        notify_registrations=current_user.notify_registrations,
        notify_events=current_user.notify_events
    )

# VK OAuth endpoints
@router.get("/vk/login")
async def vk_login(request: Request):
    """Перенаправление на страницу авторизации VK"""
    if not VK_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="VK OAuth не настроен. Установите VK_CLIENT_ID"
        )
    
    # Получаем redirect_uri из запроса или используем дефолтный
    redirect_uri = request.query_params.get("redirect_uri", VK_REDIRECT_URI)
    
    # Нормализуем redirect_uri (убираем trailing slash, если есть)
    redirect_uri = redirect_uri.rstrip("/")
    
    # Логируем для отладки
    logger.info(f"VK OAuth login: client_id={VK_CLIENT_ID[:5]}..., redirect_uri={redirect_uri}")
    
    # Параметры для VK OAuth
    # Важно: не указываем scope, если он не нужен, или используем минимальные права
    params = {
        "client_id": VK_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "display": "page",
        "response_type": "code",
        "v": VK_API_VERSION
    }
    
    # Добавляем scope только если нужно получить email
    # Но для начала попробуем без scope
    # Если нужен email, можно добавить: params["scope"] = "email"
    
    vk_auth_url = f"https://oauth.vk.com/authorize?{urlencode(params)}"
    logger.info(f"VK OAuth URL: {vk_auth_url[:150]}...")
    return RedirectResponse(url=vk_auth_url)

@router.get("/vk/callback")
async def vk_callback(
    code: str = None,
    error: str = None,
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Обработка callback от VK OAuth"""
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка авторизации VK: {error}"
        )
    
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Код авторизации не получен"
        )
    
    if not VK_CLIENT_ID or not VK_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="VK OAuth не настроен"
        )
    
    # Получаем redirect_uri из запроса
    redirect_uri = request.query_params.get("redirect_uri", VK_REDIRECT_URI) if request else VK_REDIRECT_URI
    # Нормализуем redirect_uri (убираем trailing slash)
    redirect_uri = redirect_uri.rstrip("/")
    
    logger.info(f"VK OAuth callback: redirect_uri={redirect_uri}, code={'получен' if code else 'не получен'}")
    
    # Обмениваем код на access token
    async with httpx.AsyncClient() as client:
        token_response = await client.get(
            "https://oauth.vk.com/access_token",
            params={
                "client_id": VK_CLIENT_ID,
                "client_secret": VK_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "code": code
            }
        )
        
        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Не удалось получить access token от VK"
            )
        
        token_data = token_response.json()
        
        if "error" in token_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ошибка VK: {token_data.get('error_description', token_data.get('error'))}"
            )
        
        access_token = token_data.get("access_token")
        vk_user_id = token_data.get("user_id")
        email = token_data.get("email")
        
        if not access_token or not vk_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Не удалось получить данные от VK"
            )
        
        # Получаем информацию о пользователе из VK API
        user_info_response = await client.get(
            "https://api.vk.com/method/users.get",
            params={
                "user_ids": vk_user_id,
                "fields": "first_name,last_name,photo_200",
                "access_token": access_token,
                "v": VK_API_VERSION
            }
        )
        
        if user_info_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Не удалось получить информацию о пользователе от VK"
            )
        
        user_info_data = user_info_response.json()
        
        if "error" in user_info_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ошибка VK API: {user_info_data.get('error', {}).get('error_msg', 'Unknown error')}"
            )
        
        vk_user = user_info_data.get("response", [{}])[0]
        first_name = vk_user.get("first_name", "")
        last_name = vk_user.get("last_name", "")
        
        # Ищем существующего пользователя по VK ID
        user = db.query(User).filter(User.vk_id == vk_user_id).first()
        
        if user:
            # Пользователь уже существует, обновляем данные если нужно
            if email and not user.login:
                # Если у пользователя нет логина, используем email
                user.login = email
        else:
            # Создаем нового пользователя
            # Генерируем логин на основе VK ID или email
            login = email if email else f"vk_{vk_user_id}"
            
            # Проверяем, не занят ли логин
            existing_user = db.query(User).filter(User.login == login).first()
            if existing_user:
                # Если логин занят, добавляем случайный суффикс
                login = f"vk_{vk_user_id}_{random.randint(1000, 9999)}"
            
            # Создаем пользователя с пустым паролем (OAuth пользователи не используют пароль)
            # Используем случайный хеш для пароля, так как он не будет использоваться
            password_hash = get_password_hash(f"vk_oauth_{vk_user_id}_{os.urandom(16).hex()}")
            
            user = User(
                login=login,
                password_hash=password_hash,
                role=UserRole.VOLUNTEER,  # По умолчанию создаем как волонтера
                vk_id=vk_user_id,
                notify_city_news=False,
                notify_registrations=False,
                notify_events=False
            )
            db.add(user)
            db.flush()
            
            # Создаем профиль волонтера
            volunteer = Volunteer(
                user_id=user.id,
                first_name=first_name,
                second_name=last_name,
                email=email if email else None
            )
            db.add(volunteer)
            db.flush()
            db.commit()
            
            # Создаем токен
            access_token_jwt = create_access_token(data={"sub": str(user.id)})
            
            # Возвращаем токен через redirect с параметрами
            redirect_url = f"{FRONTEND_URL}/auth/vk/success?token={access_token_jwt}&user_type={user.role.value}&id={volunteer.id}"
            return RedirectResponse(url=redirect_url)
        
        # Если пользователь существует, создаем токен и перенаправляем
        db.commit()
        
        # Определяем ID пользователя в зависимости от роли
        user_id = user.id
        if user.role == UserRole.NPO:
            npo = db.query(NPO).filter(NPO.user_id == user.id).first()
            if npo:
                user_id = npo.id
        elif user.role == UserRole.VOLUNTEER:
            volunteer = db.query(Volunteer).filter(Volunteer.user_id == user.id).first()
            if volunteer:
                user_id = volunteer.id
        
        access_token_jwt = create_access_token(data={"sub": str(user.id)})
        
        redirect_url = f"{FRONTEND_URL}/auth/vk/success?token={access_token_jwt}&user_type={user.role.value}&id={user_id}"
        return RedirectResponse(url=redirect_url)

@router.post("/vk/auth", response_model=Token)
async def vk_auth(vk_data: VKAuthCallback, db: Session = Depends(get_db)):
    """Альтернативный endpoint для VK авторизации через POST (для прямого вызова)"""
    if not vk_data.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Код авторизации не предоставлен"
        )
    
    # Используем ту же логику, что и в callback
    # Это упрощенная версия для прямого вызова API
    redirect_uri = vk_data.redirect_uri or VK_REDIRECT_URI
    
    async with httpx.AsyncClient() as client:
        token_response = await client.get(
            "https://oauth.vk.com/access_token",
            params={
                "client_id": VK_CLIENT_ID,
                "client_secret": VK_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "code": vk_data.code
            }
        )
        
        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Не удалось получить access token от VK"
            )
        
        token_data = token_response.json()
        
        if "error" in token_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ошибка VK: {token_data.get('error_description', token_data.get('error'))}"
            )
        
        access_token = token_data.get("access_token")
        vk_user_id = token_data.get("user_id")
        email = token_data.get("email")
        
        if not access_token or not vk_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Не удалось получить данные от VK"
            )
        
        # Получаем информацию о пользователе
        user_info_response = await client.get(
            "https://api.vk.com/method/users.get",
            params={
                "user_ids": vk_user_id,
                "fields": "first_name,last_name",
                "access_token": access_token,
                "v": VK_API_VERSION
            }
        )
        
        if user_info_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Не удалось получить информацию о пользователе от VK"
            )
        
        user_info_data = user_info_response.json()
        
        if "error" in user_info_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ошибка VK API: {user_info_data.get('error', {}).get('error_msg', 'Unknown error')}"
            )
        
        vk_user = user_info_data.get("response", [{}])[0]
        first_name = vk_user.get("first_name", "")
        last_name = vk_user.get("last_name", "")
        
        # Ищем или создаем пользователя
        user = db.query(User).filter(User.vk_id == vk_user_id).first()
        
        if not user:
            login = email if email else f"vk_{vk_user_id}"
            existing_user = db.query(User).filter(User.login == login).first()
            if existing_user:
                login = f"vk_{vk_user_id}"
            
            password_hash = get_password_hash(f"vk_oauth_{vk_user_id}_{os.urandom(16).hex()}")
            
            user = User(
                login=login,
                password_hash=password_hash,
                role=UserRole.VOLUNTEER,
                vk_id=vk_user_id,
                notify_city_news=False,
                notify_registrations=False,
                notify_events=False
            )
            db.add(user)
            db.flush()
            
            volunteer = Volunteer(
                user_id=user.id,
                first_name=first_name,
                second_name=last_name,
                email=email if email else None
            )
            db.add(volunteer)
            db.commit()
            
            access_token_jwt = create_access_token(data={"sub": str(user.id)})
            return {"access_token": access_token_jwt, "token_type": "bearer", "user_type": user.role.value, "id": volunteer.id}
        
        # Пользователь существует
        user_id = user.id
        if user.role == UserRole.NPO:
            npo = db.query(NPO).filter(NPO.user_id == user.id).first()
            if npo:
                user_id = npo.id
        elif user.role == UserRole.VOLUNTEER:
            volunteer = db.query(Volunteer).filter(Volunteer.user_id == user.id).first()
            if volunteer:
                user_id = volunteer.id
        
        access_token_jwt = create_access_token(data={"sub": str(user.id)})
        return {"access_token": access_token_jwt, "token_type": "bearer", "user_type": user.role.value, "id": user_id}

@router.post("/vk/id", response_model=VKIDAuthResponse)
async def vk_id_auth(vk_data: VKIDAuthRequest, request: Request, db: Session = Depends(get_db)):
    """Авторизация через VK ID SDK (новый метод)
    Принимает access_token от VK ID SDK и получает данные пользователя через VK API на бэкенде
    Если пользователь существует - возвращает токен
    Если пользователя нет - возвращает данные VK для регистрации
    """
    vk_access_token = vk_data.access_token
    id_token = vk_data.id_token
    user_data = vk_data.user_data  # Данные пользователя, полученные на фронтенде
    
    logger.info(f"VK ID auth: получен access_token, id_token и user_data, начинаем получение данных пользователя")
    
    vk_user_id = None
    first_name = None
    last_name = None
    email = None
    bdate = None
    sex = None
    city_name = None
    phone = None
    
    # Сначала используем данные, полученные на фронтенде (если есть)
    if user_data:
        vk_user_id = user_data.get("id") or user_data.get("user_id")
        if isinstance(vk_user_id, str):
            try:
                vk_user_id = int(vk_user_id)
            except ValueError:
                pass
        first_name = user_data.get("first_name")
        last_name = user_data.get("last_name")
        email = user_data.get("email")
        bdate = user_data.get("bdate")
        sex = user_data.get("sex")
        city_name = user_data.get("city")
        phone = user_data.get("phone")
        logger.info(f"Получены данные из user_data (фронтенд): user_id={vk_user_id}, first_name={first_name}, last_name={last_name}, email={email}, bdate={bdate}, sex={sex}, city={city_name}, phone={phone}")
    
    # Сначала пытаемся получить данные из id_token (JWT) - это не требует запросов к VK API
    if id_token:
        try:
            # Декодируем id_token без проверки подписи
            # Используем алгоритм None, чтобы не требовать ключ
            id_token_parts = id_token.split('.')
            if len(id_token_parts) == 3:
                import base64
                import json
                # Декодируем payload (вторая часть JWT)
                payload = id_token_parts[1]
                # Добавляем padding если нужно
                padding = len(payload) % 4
                if padding:
                    payload += '=' * (4 - padding)
                payload_decoded = base64.urlsafe_b64decode(payload)
                id_token_data = json.loads(payload_decoded)
                
                # Логируем все данные из id_token для отладки
                logger.info(f"id_token data keys: {list(id_token_data.keys())}")
                logger.info(f"id_token data: {id_token_data}")
                
                vk_user_id = id_token_data.get("sub") or id_token_data.get("user_id") or id_token_data.get("id")
                if isinstance(vk_user_id, str):
                    try:
                        vk_user_id = int(vk_user_id)
                    except ValueError:
                        pass
                email = id_token_data.get("email")
                first_name = id_token_data.get("given_name") or id_token_data.get("first_name") or id_token_data.get("name")
                last_name = id_token_data.get("family_name") or id_token_data.get("last_name")
                bdate = id_token_data.get("birthdate") or id_token_data.get("bdate")
                # В id_token обычно нет пола, города и телефона, они доступны только через API
                logger.info(f"Получены данные из id_token: user_id={vk_user_id}, email={email}, first_name={first_name}, last_name={last_name}, bdate={bdate}")
        except Exception as e:
            logger.warning(f"Не удалось декодировать id_token: {e}", exc_info=True)
    
    # Всегда делаем запрос к VK API для получения полных данных пользователя
    # Даже если получили user_id из id_token, нужны расширенные данные (first_name, last_name, email, bdate, sex, city, phone)
    # Используем заголовки от клиента, чтобы VK видел правильный IP
    api_data_received = False
    async with httpx.AsyncClient() as client:
        try:
            # Получаем информацию о пользователе через VK API
            # Передаем заголовки от клиента, чтобы VK видел правильный источник запроса
            headers = {}
            if request:
                # Передаем User-Agent и другие заголовки от клиента
                if "user-agent" in request.headers:
                    headers["User-Agent"] = request.headers["user-agent"]
                if "x-forwarded-for" in request.headers:
                    headers["X-Forwarded-For"] = request.headers["x-forwarded-for"]
            
            # Если получили user_id из id_token, используем его в запросе
            params = {
                "access_token": vk_access_token,
                "v": VK_API_VERSION,
                "fields": "email,bdate,sex,city,contacts"  # Получаем расширенные данные
            }
            if vk_user_id:
                params["user_ids"] = vk_user_id
            
            user_info_response = await client.get(
                "https://api.vk.com/method/users.get",
                params=params,
                headers=headers
            )
            
            if user_info_response.status_code == 200:
                user_info_data = user_info_response.json()
                logger.info(f"VK API response: {user_info_data}")
                
                if "error" in user_info_data:
                    error_msg = user_info_data.get('error', {}).get('error_msg', 'Unknown error')
                    error_code = user_info_data.get('error', {}).get('error_code', 'Unknown')
                    logger.error(f"VK API error: {error_msg} (code: {error_code})")
                    
                    # Если ошибка связана с IP (error_code 5), но у нас есть данные из id_token, используем их
                    if error_code == 5 and vk_user_id:
                        logger.warning(f"VK API вернул ошибку IP, но используем данные из id_token: user_id={vk_user_id}")
                        # Оставляем данные из id_token, которые уже есть
                    else:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Ошибка VK API: {error_msg}"
                        )
                elif "response" in user_info_data and len(user_info_data["response"]) > 0:
                    user_info = user_info_data["response"][0]
                    api_data_received = True
                    
                    # Обновляем vk_user_id, если его не было из id_token
                    if not vk_user_id:
                        vk_user_id = user_info.get("id")
                    
                    # Получаем основные данные (перезаписываем, если были из id_token, так как API более актуальные)
                    first_name = user_info.get("first_name") or first_name
                    last_name = user_info.get("last_name") or last_name
                    email = user_info.get("email") or email
                    
                    # Дополнительные поля из VK API
                    bdate = user_info.get("bdate")  # Дата рождения в формате "DD.MM.YYYY" или "DD.MM"
                    sex = user_info.get("sex")  # 1 - женский, 2 - мужской, 0 - не указан
                    city_info = user_info.get("city")
                    city_name = city_info.get("title") if isinstance(city_info, dict) else None
                    # Телефон может быть в contacts, но обычно не доступен через users.get
                    # Для получения телефона нужны специальные права
                    phone = user_info.get("mobile_phone") or user_info.get("phone")
                    
                    logger.info(f"Получены данные через VK API: user_id={vk_user_id}, first_name={first_name}, last_name={last_name}, email={email}, bdate={bdate}, sex={sex}, city={city_name}, phone={phone}")
                else:
                    logger.warning(f"VK API response не содержит данных пользователя: {user_info_data}")
                    if not vk_user_id:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Не удалось получить данные пользователя от VK API"
                        )
            else:
                error_text = user_info_response.text
                logger.error(f"VK API HTTP error: {error_text}")
                if not vk_user_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Ошибка при запросе к VK API: {error_text[:200]}"
                    )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Не удалось получить данные через VK API: {e}", exc_info=True)
            if not vk_user_id:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Внутренняя ошибка при получении данных от VK: {str(e)}"
                )
    
    if not vk_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Не удалось получить user_id от VK ID"
        )
    
    # Ищем существующего пользователя по VK ID
    user = db.query(User).filter(User.vk_id == vk_user_id).first()
    
    if not user:
        # Пользователя нет - возвращаем данные для регистрации
        return VKIDAuthResponse(
            user_exists=False,
            vk_id=vk_user_id,
            vk_data={
                "first_name": first_name or "",
                "last_name": last_name or "",
                "email": email,
                "bdate": bdate,
                "sex": sex,  # 1 - женский, 2 - мужской, 0 - не указан
                "city": city_name,
                "phone": phone,
            }
        )
    
    # Пользователь существует - авторизуем
    user_id = user.id
    if user.role == UserRole.NPO:
        npo = db.query(NPO).filter(NPO.user_id == user.id).first()
        if npo:
            user_id = npo.id
    elif user.role == UserRole.VOLUNTEER:
        volunteer = db.query(Volunteer).filter(Volunteer.user_id == user.id).first()
        if volunteer:
            user_id = volunteer.id
    
    access_token_jwt = create_access_token(data={"sub": str(user.id)})
    token = Token(
        access_token=access_token_jwt,
        token_type="bearer",
        user_type=user.role.value,
        id=user_id
    )
    
    return VKIDAuthResponse(
        user_exists=True,
        token=token
    )

