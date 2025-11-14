from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import NewsType, EventStatus

# Auth schemas
class UserLogin(BaseModel):
    login: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# NPO Registration
class NPORegistration(BaseModel):
    login: str
    password: str
    psrn: str
    name: str
    description: str
    coordinates: List[float]  # [lat, lon] - обязательное поле при регистрации
    address: str  # обязательное поле при регистрации
    galleryIds: List[int]  # хотя бы одна фотка (обязательно)
    tags: List[str]  # хотя бы один тег (обязательно)
    links: Optional[dict] = None
    timetable: Optional[str] = None

# Volunteer Registration
class VolunteerRegistration(BaseModel):
    login: str
    password: str
    firstName: str
    secondName: str
    middleName: Optional[str] = None
    about: Optional[str] = None
    birthday: Optional[datetime] = None
    city: Optional[str] = None
    sex: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

# NPO schemas
class NPOUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    galleryIds: Optional[List[int]] = None
    tags: Optional[List[str]] = None
    links: Optional[dict] = None
    timetable: Optional[str] = None

class NPOResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    coordinates: Optional[List[float]]  # [lat, lon]
    address: Optional[str]
    timetable: Optional[str]
    galleryIds: List[int]
    tags: List[str]
    links: Optional[dict]
    vacancies: int  # Количество активных событий
    created_at: datetime
    
    class Config:
        from_attributes = True

class NPOMapPoint(BaseModel):
    coordinates: List[float]  # [lat, lon]
    info: NPOResponse

# Event schemas
class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    start: datetime
    end: datetime
    coordinates: Optional[List[float]] = None  # [lat, lon]
    quantity: Optional[int] = None
    tags: Optional[List[str]] = None

class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    coordinates: Optional[List[float]] = None
    quantity: Optional[int] = None
    tags: Optional[List[str]] = None

class EventStatusUpdate(BaseModel):
    status: EventStatus

class EventResponse(BaseModel):
    id: int
    npo_id: int
    name: str
    description: Optional[str]
    start: datetime
    end: datetime
    coordinates: Optional[List[float]]
    quantity: Optional[int]
    status: EventStatus
    tags: List[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Volunteer schemas
class VolunteerUpdate(BaseModel):
    firstName: Optional[str] = None
    secondName: Optional[str] = None
    middleName: Optional[str] = None
    about: Optional[str] = None
    birthday: Optional[datetime] = None
    city: Optional[str] = None
    sex: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class EventResponseCreate(BaseModel):
    userId: int

# News schemas
class NewsCreate(BaseModel):
    name: str
    text: str
    attachedIds: Optional[List[int]] = None
    tags: Optional[List[str]] = None
    type: NewsType

class NewsResponse(BaseModel):
    id: int
    name: str
    text: str
    attachedIds: List[int]
    tags: List[str]
    type: NewsType
    created_at: datetime
    
    class Config:
        from_attributes = True

# File schema
class FileResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    
    class Config:
        from_attributes = True

