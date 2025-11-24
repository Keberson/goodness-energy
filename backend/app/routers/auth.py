from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole, NPO, Volunteer, NPOStatus
from app.schemas import UserLogin, Token, NPORegistration, VolunteerRegistration, VKIDLogin, VKIDCallback, VKIDCallback, SelectedCityUpdate
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

@router.post("/vkid/login", response_model=Token)
async def vkid_login(vkid_data: VKIDLogin, db: Session = Depends(get_db)):
    """Авторизация через VK ID"""
    VK_APP_ID = os.getenv("VK_APP_ID", "")
    VK_CLIENT_SECRET = os.getenv("VK_CLIENT_SECRET", "")
    
    if not VK_APP_ID or not VK_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="VK ID не настроен на сервере"
        )
    
    # Проверяем токен через VK API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.vk.com/method/users.get",
                params={
                    "access_token": vkid_data.token,
                    "v": "5.131",
                    "fields": "id,first_name,last_name"
                },
                timeout=10.0
            )
            vk_response = response.json()
            
            if "error" in vk_response:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Неверный токен VK ID: {vk_response['error'].get('error_msg', 'Ошибка авторизации')}"
                )
            
            if "response" not in vk_response or len(vk_response["response"]) == 0:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Не удалось получить данные пользователя из VK"
                )
            
            vk_user = vk_response["response"][0]
            vk_id = vk_user["id"]
            vk_first_name = vk_user.get("first_name", "")
            vk_last_name = vk_user.get("last_name", "")
            
    except httpx.RequestError as e:
        logger.error(f"Ошибка при запросе к VK API: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при проверке токена VK ID"
        )
    
    # Определяем роль пользователя
    if vkid_data.user_type not in ["volunteer", "npo"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_type должен быть 'volunteer' или 'npo'"
        )
    
    target_role = UserRole.VOLUNTEER if vkid_data.user_type == "volunteer" else UserRole.NPO
    
    # Ищем пользователя по VK ID
    user = db.query(User).filter(User.vk_id == vk_id).first()
    
    if user:
        # Пользователь уже зарегистрирован через VK ID
        if user.role != target_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Пользователь с этим VK ID уже зарегистрирован как {user.role.value}"
            )
    else:
        # Создаем нового пользователя
        # Генерируем уникальный логин на основе VK ID
        login = f"vk_{vk_id}"
        # Проверяем, не занят ли такой логин
        counter = 1
        while db.query(User).filter(User.login == login).first():
            login = f"vk_{vk_id}_{counter}"
            counter += 1
        
        # Создаем пользователя с пустым паролем (авторизация только через VK ID)
        password_hash = get_password_hash(f"vk_{vk_id}_{VK_CLIENT_SECRET}")  # Генерируем случайный пароль
        user = User(
            login=login,
            password_hash=password_hash,
            role=target_role,
            vk_id=vk_id
        )
        db.add(user)
        db.flush()
        
        # Создаем соответствующую запись (волонтер или НКО)
        if target_role == UserRole.VOLUNTEER:
            volunteer = Volunteer(
                user_id=user.id,
                first_name=vk_first_name,
                second_name=vk_last_name,
                middle_name=None,
                about=None,
                birthday=None,
                city=None,
                sex=None,
                email=None,
                phone=None
            )
            db.add(volunteer)
            db.flush()
            user_id = volunteer.id
        else:  # NPO
            # Для НКО нужны дополнительные данные, поэтому создаем минимальную запись
            # В реальном приложении можно запросить дополнительные данные
            npo = NPO(
                user_id=user.id,
                name=f"{vk_first_name} {vk_last_name}",
                description=None,
                coordinates_lat=None,
                coordinates_lon=None,
                address=None,
                city=None,
                timetable=None,
                links=None,
                status=NPOStatus.NOT_CONFIRMED
            )
            db.add(npo)
            db.flush()
            user_id = npo.id
        
        db.commit()
        db.refresh(user)
    
    # Получаем id из соответствующей таблицы
    if user.role == UserRole.NPO:
        npo = db.query(NPO).filter(NPO.user_id == user.id).first()
        if npo:
            user_id = npo.id
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Не удалось найти НКО для пользователя"
            )
    elif user.role == UserRole.VOLUNTEER:
        volunteer = db.query(Volunteer).filter(Volunteer.user_id == user.id).first()
        if volunteer:
            user_id = volunteer.id
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Не удалось найти волонтера для пользователя"
            )
    else:
        user_id = user.id
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user_type": user.role.value, "id": user_id}

@router.post("/vkid/callback")
async def vkid_callback(callback_data: VKIDCallback, db: Session = Depends(get_db)):
    """Обработка callback от VK ID - обмен code на access_token"""
    VK_APP_ID = os.getenv("VK_APP_ID", "")
    VK_CLIENT_SECRET = os.getenv("VK_CLIENT_SECRET", "")
    
    if not VK_APP_ID or not VK_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="VK ID не настроен на сервере"
        )
    
    # Обмениваем code на access_token через VK API
    try:
        async with httpx.AsyncClient() as client:
            # Используем redirect_uri из запроса (должен совпадать с тем, что был использован при авторизации)
            redirect_uri = callback_data.redirect_uri
            
            response = await client.get(
                "https://oauth.vk.com/access_token",
                params={
                    "client_id": VK_APP_ID,
                    "client_secret": VK_CLIENT_SECRET,
                    "redirect_uri": redirect_uri,
                    "code": callback_data.code,
                },
                timeout=10.0
            )
            vk_response = response.json()
            
            if "error" in vk_response:
                error_msg = vk_response.get("error_description", vk_response.get("error", "Ошибка авторизации"))
                logger.error(f"Ошибка при обмене code на токен: {error_msg}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Ошибка авторизации VK ID: {error_msg}"
                )
            
            if "access_token" not in vk_response:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Не удалось получить access_token от VK"
                )
            
            access_token = vk_response["access_token"]
            
            # Возвращаем токен клиенту для дальнейшей авторизации
            return {"access_token": access_token}
            
    except httpx.RequestError as e:
        logger.error(f"Ошибка при запросе к VK API: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при обмене кода на токен VK ID"
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

