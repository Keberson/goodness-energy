from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole, NPO, Volunteer, NPOStatus
from app.schemas import UserLogin, Token, NPORegistration, VolunteerRegistration, SelectedCityUpdate, NotificationSettingsUpdate, NotificationSettingsResponse
from app.auth import verify_password, get_password_hash, create_access_token, get_current_user
import json
import logging
import httpx
import os

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/reg/npo", response_model=Token)
async def register_npo(npo_data: NPORegistration, db: Session = Depends(get_db)):
    # Проверка существования пользователя
    if db.query(User).filter(User.login == npo_data.login).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Логин уже зарегистрирован"
        )
    
    # Создание пользователя
    password_hash = get_password_hash(npo_data.password)
    user = User(
        login=npo_data.login,
        password_hash=password_hash,
        role=UserRole.NPO
    )
    db.add(user)
    db.flush()
    
    # Валидация обязательных полей
    if len(npo_data.tags) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Требуется хотя бы один тег"
        )
    
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
    # Проверка существования пользователя
    if db.query(User).filter(User.login == vol_data.login).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Логин уже зарегистрирован"
        )
    
    # Создание пользователя
    password_hash = get_password_hash(vol_data.password)
    user = User(
        login=vol_data.login,
        password_hash=password_hash,
        role=UserRole.VOLUNTEER
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
    try:
        logger.info(f"Попытка входа пользователя: {user_data.login}")
        user = db.query(User).filter(User.login == user_data.login).first()
        if not user:
            logger.warning(f"Пользователь с логином {user_data.login} не найден")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный логин или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Проверка пароля
        logger.debug(f"Проверка пароля для пользователя {user_data.login}")
        if not verify_password(user_data.password, user.password_hash):
            logger.warning(f"Неверный пароль для пользователя {user_data.login}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный логин или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Получаем id из соответствующей таблицы в зависимости от роли
        logger.debug(f"Получение ID для пользователя {user_data.login} с ролью {user.role}")
        user_id = None
        if user.role == UserRole.NPO:
            npo = db.query(NPO).filter(NPO.user_id == user.id).first()
            if npo:
                user_id = npo.id
        elif user.role == UserRole.VOLUNTEER:
            volunteer = db.query(Volunteer).filter(Volunteer.user_id == user.id).first()
            if volunteer:
                user_id = volunteer.id
        elif user.role == UserRole.ADMIN:
            # Для админа используем id из таблицы users
            user_id = user.id
        
        if user_id is None:
            logger.error(f"Не удалось найти связанную запись для пользователя {user_data.login} с ролью {user.role}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Не удалось найти связанную запись пользователя"
            )
        
        logger.info(f"Успешный вход пользователя {user_data.login} с ролью {user.role}, ID: {user_id}")
        access_token = create_access_token(data={"sub": str(user.id)})
        return {"access_token": access_token, "token_type": "bearer", "user_type": user.role.value, "id": user_id}
    except HTTPException:
        # Пробрасываем HTTPException как есть
        raise
    except Exception as e:
        logger.error(f"Неожиданная ошибка при входе пользователя {user_data.login}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Внутренняя ошибка сервера: {str(e)}"
        )

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
    return {"message": "Выбранный город успешно обновлен", "selected_city": current_user.selected_city}

@router.get("/notification-settings", response_model=NotificationSettingsResponse)
async def get_notification_settings(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получение настроек уведомлений пользователя"""
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
    """Обновление настроек уведомлений пользователя"""
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

