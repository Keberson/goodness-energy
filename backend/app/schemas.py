from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import NewsType, EventStatus, NPOStatus, NPOCity, FavoriteType

# Схемы аутентификации
class UserLogin(BaseModel):
    login: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: str  # "volunteer" | "npo" | "admin"
    id: int  # ID из таблицы volunteers/npos/users (для admin)

class SelectedCityUpdate(BaseModel):
    city: str  # Выбранный город пользователя

# Схемы настроек уведомлений
class NotificationSettingsUpdate(BaseModel):
    notify_city_news: Optional[bool] = None  # Уведомления о новостях из города
    notify_registrations: Optional[bool] = None  # Уведомления о регистрациях
    notify_events: Optional[bool] = None  # Уведомления о событиях

class NotificationSettingsResponse(BaseModel):
    notify_city_news: bool
    notify_registrations: bool
    notify_events: bool
    
    class Config:
        from_attributes = True

# Регистрация НКО
class NPORegistration(BaseModel):
    login: str
    password: str
    name: str
    description: str
    coordinates: List[float]  # [lat, lon] - обязательное поле при регистрации
    address: str  # обязательное поле при регистрации
    city: NPOCity  # обязательное поле при регистрации
    tags: List[str]  # хотя бы один тег (обязательно)
    links: Optional[dict] = None
    timetable: Optional[str] = None

# Регистрация волонтера
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

# Схемы НКО
class NPOUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    page_content: Optional[str] = None  # HTML-контент страницы профиля
    galleryIds: Optional[List[int]] = None
    tags: Optional[List[str]] = None
    links: Optional[dict] = None
    timetable: Optional[str] = None
    city: Optional[NPOCity] = None
    address: Optional[str] = None
    coordinates: Optional[List[float]] = None  # [lat, lon]

class NPOResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    page_content: Optional[str]  # HTML-контент страницы профиля
    coordinates: Optional[List[float]]  # [lat, lon]
    address: Optional[str]
    city: NPOCity
    timetable: Optional[str]
    galleryIds: List[int]
    tags: List[str]
    links: Optional[dict]
    vacancies: int  # Количество активных событий
    status: NPOStatus
    created_at: datetime
    
    class Config:
        from_attributes = True

class NPOMapPoint(BaseModel):
    coordinates: List[float]  # [lat, lon]
    info: NPOResponse

# Схемы событий
class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    start: datetime
    end: datetime
    coordinates: Optional[List[float]] = None  # [lat, lon]
    quantity: Optional[int] = None
    tags: Optional[List[str]] = None
    city: NPOCity  # Обязательное поле - город проведения события
    attachedIds: Optional[List[int]] = None  # ID файлов (изображений)

class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    coordinates: Optional[List[float]] = None
    quantity: Optional[int] = None
    tags: Optional[List[str]] = None
    city: Optional[NPOCity] = None
    attachedIds: Optional[List[int]] = None  # ID файлов (изображений)

class EventStatusUpdate(BaseModel):
    status: EventStatus

class EventResponse(BaseModel):
    id: int
    npo_id: int
    npo_name: Optional[str] = None  # Название НКО, проводящего событие
    name: str
    description: Optional[str]
    start: datetime
    end: datetime
    coordinates: Optional[List[float]]
    quantity: Optional[int]
    status: EventStatus
    tags: List[str]
    city: Optional[str]  # Город НКО, создавшего событие
    attachedIds: List[int] = []  # ID файлов (изображений)
    created_at: datetime
    
    class Config:
        from_attributes = True

# Схемы волонтера
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

class VolunteerResponse(BaseModel):
    id: int
    firstName: str
    secondName: str
    middleName: Optional[str]
    about: Optional[str]
    birthday: Optional[datetime]
    city: Optional[str]
    sex: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class EventResponseCreate(BaseModel):
    userId: int

# Схемы новостей
class NewsCreate(BaseModel):
    name: str
    annotation: Optional[str] = None  # Краткое описание для списка новостей
    text: str
    attachedIds: Optional[List[int]] = None
    tags: Optional[List[str]] = None
    type: NewsType

class NewsUpdate(BaseModel):
    name: Optional[str] = None
    annotation: Optional[str] = None
    text: Optional[str] = None
    attachedIds: Optional[List[int]] = None
    tags: Optional[List[str]] = None
    type: Optional[NewsType] = None

class NewsResponse(BaseModel):
    id: int
    name: str
    annotation: Optional[str] = None
    text: str
    attachedIds: List[int]
    tags: List[str]
    type: NewsType
    created_at: datetime
    user_id: int  # ID пользователя, создавшего новость
    author: str  # Имя автора: для волонтёра - имя и фамилия, для НКО - название НКО, для админа - "Администратор"
    
    class Config:
        from_attributes = True

# Схема файла
class FileResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    
    class Config:
        from_attributes = True

# Схема для обновления статуса НКО администратором
class NPOStatusUpdate(BaseModel):
    status: NPOStatus

# Схемы базы знаний
class KnowledgeCreate(BaseModel):
    name: str
    text: str
    attachedIds: Optional[List[int]] = None
    tags: Optional[List[str]] = None
    links: Optional[List[str]] = None

class KnowledgeUpdate(BaseModel):
    name: Optional[str] = None
    text: Optional[str] = None
    attachedIds: Optional[List[int]] = None
    tags: Optional[List[str]] = None
    links: Optional[List[str]] = None

class KnowledgeResponse(BaseModel):
    id: int
    name: str
    text: str
    attachedIds: List[int]
    tags: List[str]
    links: Optional[List[str]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Схемы статистики
class ProfileViewerStats(BaseModel):
    viewer_id: Optional[int]
    viewer_login: Optional[str]
    view_count: int
    last_viewed_at: Optional[datetime]

class EventStats(BaseModel):
    event_id: int
    event_name: str
    view_count: int
    response_count: int
    status: EventStatus
    created_at: datetime

class NPOStatisticsResponse(BaseModel):
    # Статистика просмотров профиля
    total_profile_views: int
    unique_viewers: int
    profile_viewers: List[ProfileViewerStats]
    
    # Статистика событий
    total_events: int
    events_by_status: dict  # {status: count}
    event_stats: List[EventStats]
    
    # Статистика новостей
    total_news: int
    
    # Статистика откликов
    total_event_responses: int

class DateStatisticsItem(BaseModel):
    """Статистика по дате"""
    date: str  # Дата в формате YYYY-MM-DD
    profile_views: int
    event_views: int
    responses: int

class NPOStatisticsItem(BaseModel):
    """Статистика для одного НКО"""
    npo_id: int
    npo_name: str
    total_profile_views: int
    unique_viewers: int
    total_events: int
    events_by_status: dict  # {status: count}
    total_news: int
    total_event_responses: int
    date_statistics: Optional[List[DateStatisticsItem]] = None  # Данные по датам для графиков

class AllNPOStatisticsResponse(BaseModel):
    """Статистика всех НКО для администратора"""
    # Общая статистика по всем НКО
    total_npos: int
    total_profile_views: int
    total_unique_viewers: int
    total_events: int
    total_events_by_status: dict  # {status: count}
    total_news: int
    total_event_responses: int
    total_date_statistics: Optional[List[DateStatisticsItem]] = None  # Суммарные данные по датам для графиков
    
    # Статистика по каждому НКО
    npo_statistics: List[NPOStatisticsItem]

# Схемы избранного
class FavoriteCreate(BaseModel):
    item_type: FavoriteType
    item_id: int

class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    item_type: FavoriteType
    item_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class FavoriteItemResponse(BaseModel):
    """Ответ с информацией об избранном элементе"""
    favorite_id: int
    item_type: FavoriteType
    item_id: int
    created_at: datetime
    # Данные элемента (новость, событие или материал)
    item: dict  # Будет содержать NewsResponse, EventResponse или KnowledgeResponse

# Схемы координат городов
class CityCoordinatesResponse(BaseModel):
    city_name: str
    center: List[float]  # [lat, lon]
    zoom: int
    
    class Config:
        from_attributes = True