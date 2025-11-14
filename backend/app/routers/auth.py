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
    
    # Проверка существования ПСРН
    if db.query(NPO).filter(NPO.psrn == npo_data.psrn).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PSRN already registered"
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
    if len(npo_data.galleryIds) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one gallery image is required"
        )
    
    if len(npo_data.tags) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one tag is required"
        )
    
    if len(npo_data.coordinates) != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coordinates must be [lat, lon]"
        )
    
    # Создание НКО
    npo = NPO(
        user_id=user.id,
        psrn=npo_data.psrn,
        name=npo_data.name,
        description=npo_data.description,
        coordinates_lat=npo_data.coordinates[0],
        coordinates_lon=npo_data.coordinates[1],
        address=npo_data.address,
        timetable=npo_data.timetable,
        links=json.dumps(npo_data.links) if npo_data.links else None
    )
    db.add(npo)
    db.flush()
    
    # Добавление галереи
    if npo_data.galleryIds:
        from app.models import NPOGallery
        for file_id in npo_data.galleryIds:
            gallery_item = NPOGallery(npo_id=npo.id, file_id=file_id)
            db.add(gallery_item)
    
    # Добавление тегов
    if npo_data.tags:
        from app.models import NPOTag
        for tag in npo_data.tags:
            npo_tag = NPOTag(npo_id=npo.id, tag=tag)
            db.add(npo_tag)
    
    db.commit()
    
    # Создание токена
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

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
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

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
    # Логирование для отладки
    print(f"DEBUG LOGIN: user.password_hash type: {type(user.password_hash)}")
    print(f"DEBUG LOGIN: user.password_hash length: {len(str(user.password_hash))}")
    print(f"DEBUG LOGIN: user.password_hash value (first 50 chars): {str(user.password_hash)[:50]}")
    print(f"DEBUG LOGIN: user_data.password type: {type(user_data.password)}")
    print(f"DEBUG LOGIN: user_data.password length: {len(str(user_data.password))}")
    
    if not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect login or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

