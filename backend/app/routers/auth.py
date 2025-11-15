from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole, NPO, Volunteer
from app.schemas import UserLogin, Token, NPORegistration, VolunteerRegistration
from app.auth import verify_password, get_password_hash, create_access_token
import json

router = APIRouter()

@router.post("/reg/npo", response_model=Token)
async def register_npo(npo_data: NPORegistration, db: Session = Depends(get_db)):
    # Проверка существования пользователя
    if db.query(User).filter(User.login == npo_data.login).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Login already registered"
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
            detail="At least one tag is required"
        )
    
    # Валидация координат
    if not isinstance(npo_data.coordinates, list):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coordinates must be a list [lat, lon], got {type(npo_data.coordinates).__name__}"
        )
    
    if len(npo_data.coordinates) != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coordinates must contain exactly 2 values [lat, lon], got {len(npo_data.coordinates)} value(s)"
        )
    
    try:
        lat = float(npo_data.coordinates[0])
        lon = float(npo_data.coordinates[1])
    except (ValueError, TypeError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coordinates must be numbers [lat, lon]. Error: {str(e)}"
        )
    
    # Проверка диапазона координат
    if not (-90 <= lat <= 90):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Latitude must be between -90 and 90, got {lat}"
        )
    
    if not (-180 <= lon <= 180):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Longitude must be between -180 and 180, got {lon}"
        )
    
    # Создание НКО
    npo = NPO(
        user_id=user.id,
        name=npo_data.name,
        description=npo_data.description,
        coordinates_lat=lat,
        coordinates_lon=lon,
        address=npo_data.address,
        timetable=npo_data.timetable,
        links=json.dumps(npo_data.links) if npo_data.links else None
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
    return {"access_token": access_token, "token_type": "bearer", "user_type": user.role.value}

@router.post("/reg/vol", response_model=Token)
async def register_volunteer(vol_data: VolunteerRegistration, db: Session = Depends(get_db)):
    # Проверка существования пользователя
    if db.query(User).filter(User.login == vol_data.login).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Login already registered"
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
    return {"access_token": access_token, "token_type": "bearer", "user_type": user.role.value}

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.login == user_data.login).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect login or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Проверка пароля
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect login or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user_type": user.role.value}

