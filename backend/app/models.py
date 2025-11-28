from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, Enum as SQLEnum, ARRAY, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    NPO = "npo"
    VOLUNTEER = "volunteer"
    ADMIN = "admin"

class NewsType(str, enum.Enum):
    THEME = "theme"  # Публикация (было "edu", потом "Тематика")
    DOCS = "docs"  # Документы
    SYSTEM = "system"  # Системный

class VolunteerPostStatus(str, enum.Enum):
    PENDING = "pending"  # Ожидает модерации
    APPROVED = "approved"  # Одобрено
    REJECTED = "rejected"  # Отклонено

class NewsStatus(str, enum.Enum):
    PUBLISHED = "published"  # Опубликовано
    REJECTED = "rejected"  # Отклонено
    PENDING = "pending"  # На проверке

class EventStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class NPOStatus(str, enum.Enum):
    CONFIRMED = "confirmed"
    NOT_CONFIRMED = "not_confirmed"

class NPOCity(str, enum.Enum):
    ANGARSK = "Ангарск"
    BAIKALSK = "Байкальск"
    BALAKOVO = "Балаково"
    BILIBINO = "Билибино"
    VOLGODONSK = "Волгодонск"
    GLAZOV = "Глазов"
    DESNOGORSK = "Десногорск"
    DIMITROVGRAD = "Димитровград"
    ZHELEZNOGORSK = "Железногорск"
    ZATO_ZARECHNY = "ЗАТО Заречный"
    ZARECHNY = "Заречный"
    ZELENOGORSK = "Зеленогорск"
    KRASNOKAMENSK = "Краснокаменск"
    KURCHATOV = "Курчатов"
    LESNOY = "Лесной"
    NEMAN = "Неман"
    NOVOVORONEZH = "Нововоронеж"
    NOVOURALSK = "Новоуральск"
    OBNINSK = "Обнинск"
    OZERSK = "Озерск"
    PEVEK = "Певек"
    POLYARNYE_ZORI = "Полярные Зори"
    SAROV = "Саров"
    SEVERSK = "Северск"
    SNEEZHINSK = "Снежинск"
    SOVETSK = "Советск"
    SOSNOVY_BOR = "Сосновый Бор"
    TREHGORNY = "Трехгорный"
    UDOMLYA = "Удомля"
    USOLYE_SIBIRSKOE = "Усолье-Сибирское"
    ELEKTROSTAL = "Электросталь"
    ENERGODAR = "Энергодар"
    NIZHNY_NOVGOROD = "Нижний Новгород"
    OMSK = "Омск"
    OZERSK_YO = "Озёрск"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    login = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    vk_id = Column(Integer, unique=True, index=True, nullable=True)  # VK ID пользователя
    selected_city = Column(String, nullable=True)  # Выбранный город пользователя
    # Настройки email уведомлений
    notify_city_news = Column(Boolean, default=False, server_default='false', nullable=False)  # Уведомления о новостях из города
    notify_registrations = Column(Boolean, default=False, server_default='false', nullable=False)  # Уведомления о регистрациях
    notify_events = Column(Boolean, default=False, server_default='false', nullable=False)  # Уведомления о событиях
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class File(Base):
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # jpg, png, pdf, docx, etc.
    file_path = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

class NPO(Base):
    __tablename__ = "npos"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    page_content = Column(Text)  # HTML-контент страницы профиля, созданный через редактор
    coordinates_lat = Column(Float)
    coordinates_lon = Column(Float)
    address = Column(String)
    city = Column(String, nullable=False)  # Храним строковые значения, валидация через Pydantic
    timetable = Column(Text)  # JSON строка или текст
    links = Column(Text)  # JSON строка
    status = Column(SQLEnum(NPOStatus), default=NPOStatus.NOT_CONFIRMED)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", backref="npo")
    gallery = relationship("NPOGallery", back_populates="npo", cascade="all, delete-orphan")
    tags = relationship("NPOTag", back_populates="npo", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="npo", cascade="all, delete-orphan")
    news = relationship("News", back_populates="npo", cascade="all, delete-orphan")

class NPOGallery(Base):
    __tablename__ = "npo_gallery"
    
    id = Column(Integer, primary_key=True, index=True)
    npo_id = Column(Integer, ForeignKey("npos.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    
    npo = relationship("NPO", back_populates="gallery")
    file = relationship("File")

class NPOTag(Base):
    __tablename__ = "npo_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    npo_id = Column(Integer, ForeignKey("npos.id"), nullable=False)
    tag = Column(String, nullable=False)
    
    npo = relationship("NPO", back_populates="tags")

class Volunteer(Base):
    __tablename__ = "volunteers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    second_name = Column(String, nullable=False)
    middle_name = Column(String)
    about = Column(Text)
    birthday = Column(DateTime)
    city = Column(String)
    sex = Column(String)
    email = Column(String)
    phone = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", backref="volunteer")
    event_responses = relationship("EventResponse", back_populates="volunteer", cascade="all, delete-orphan")
    news = relationship("News", back_populates="volunteer", cascade="all, delete-orphan")
    posts = relationship("VolunteerPost", back_populates="volunteer", cascade="all, delete-orphan")

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    npo_id = Column(Integer, ForeignKey("npos.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    start = Column(DateTime, nullable=False)
    end = Column(DateTime, nullable=False)
    coordinates_lat = Column(Float)
    coordinates_lon = Column(Float)
    quantity = Column(Integer)  # Количество участников
    city = Column(String, nullable=False)  # Город проведения события
    status = Column(SQLEnum(EventStatus), default=EventStatus.DRAFT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    npo = relationship("NPO", back_populates="events")
    tags = relationship("EventTag", back_populates="event", cascade="all, delete-orphan")
    responses = relationship("EventResponse", back_populates="event", cascade="all, delete-orphan")
    attachments = relationship("EventAttachment", back_populates="event", cascade="all, delete-orphan")

class EventTag(Base):
    __tablename__ = "event_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    tag = Column(String, nullable=False)
    
    event = relationship("Event", back_populates="tags")

class EventResponse(Base):
    __tablename__ = "event_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    volunteer_id = Column(Integer, ForeignKey("volunteers.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    event = relationship("Event", back_populates="responses")
    volunteer = relationship("Volunteer", back_populates="event_responses")

class EventAttachment(Base):
    __tablename__ = "event_attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    
    event = relationship("Event", back_populates="attachments")
    file = relationship("File")

class News(Base):
    __tablename__ = "news"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ID пользователя, создавшего новость
    npo_id = Column(Integer, ForeignKey("npos.id"), nullable=True)
    volunteer_id = Column(Integer, ForeignKey("volunteers.id"), nullable=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    annotation = Column(String, nullable=True)  # Краткое описание для списка новостей
    text = Column(Text, nullable=False)
    type = Column(SQLEnum(NewsType), nullable=False)
    # Опциональное поле города. Если указано, новость будет фильтроваться по этому городу.
    # Если не указано, для обратной совместимости может использоваться город НКО/волонтёра.
    city = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Поля для автоматической модерации
    is_auto_moderated = Column(Boolean, default=False, server_default='false', nullable=False)  # Проверено ли автоматически
    auto_moderated_at = Column(DateTime(timezone=True), nullable=True)  # Дата автоматической модерации
    status = Column(SQLEnum(NewsStatus), default=NewsStatus.PUBLISHED, nullable=False)  # Статус новости
    explanation = Column(Text, nullable=True)  # Пояснение модератора, если есть
    
    user = relationship("User", foreign_keys=[user_id])
    npo = relationship("NPO", back_populates="news")
    volunteer = relationship("Volunteer", back_populates="news")
    tags = relationship("NewsTag", back_populates="news", cascade="all, delete-orphan")
    attachments = relationship("NewsAttachment", back_populates="news", cascade="all, delete-orphan")

class NewsTag(Base):
    __tablename__ = "news_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    news_id = Column(Integer, ForeignKey("news.id"), nullable=False)
    tag = Column(String, nullable=False)
    
    news = relationship("News", back_populates="tags")

class NewsAttachment(Base):
    __tablename__ = "news_attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    news_id = Column(Integer, ForeignKey("news.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    
    news = relationship("News", back_populates="attachments")
    file = relationship("File")

class VolunteerPost(Base):
    __tablename__ = "volunteer_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    volunteer_id = Column(Integer, ForeignKey("volunteers.id"), nullable=False)
    name = Column(String, nullable=False)
    annotation = Column(String, nullable=True)  # Краткое описание
    text = Column(Text, nullable=False)
    city = Column(String, nullable=True)  # Опциональный город
    theme_tag = Column(String, nullable=True)  # Опциональная тематика
    npo_id = Column(Integer, ForeignKey("npos.id"), nullable=True)  # Опциональная привязка к НКО
    status = Column(SQLEnum(VolunteerPostStatus), default=VolunteerPostStatus.PENDING, nullable=False)
    moderator_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # ID администратора, который модерировал
    moderation_comment = Column(Text, nullable=True)  # Комментарий модератора
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    moderated_at = Column(DateTime(timezone=True), nullable=True)  # Дата модерации
    
    user = relationship("User", foreign_keys=[user_id])
    volunteer = relationship("Volunteer", back_populates="posts")
    npo = relationship("NPO")
    moderator = relationship("User", foreign_keys=[moderator_id])
    tags = relationship("VolunteerPostTag", back_populates="post", cascade="all, delete-orphan")
    attachments = relationship("VolunteerPostAttachment", back_populates="post", cascade="all, delete-orphan")

class VolunteerPostTag(Base):
    __tablename__ = "volunteer_post_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("volunteer_posts.id"), nullable=False)
    tag = Column(String, nullable=False)
    
    post = relationship("VolunteerPost", back_populates="tags")

class VolunteerPostAttachment(Base):
    __tablename__ = "volunteer_post_attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("volunteer_posts.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    
    post = relationship("VolunteerPost", back_populates="attachments")
    file = relationship("File")

class Knowledge(Base):
    __tablename__ = "knowledges"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    links = Column(ARRAY(String))  # Список строк
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    tags = relationship("KnowledgeTag", back_populates="knowledge", cascade="all, delete-orphan")
    attachments = relationship("KnowledgeAttachment", back_populates="knowledge", cascade="all, delete-orphan")

class KnowledgeTag(Base):
    __tablename__ = "knowledge_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    knowledge_id = Column(Integer, ForeignKey("knowledges.id"), nullable=False)
    tag = Column(String, nullable=False)
    
    knowledge = relationship("Knowledge", back_populates="tags")

class KnowledgeAttachment(Base):
    __tablename__ = "knowledge_attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    knowledge_id = Column(Integer, ForeignKey("knowledges.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    
    knowledge = relationship("Knowledge", back_populates="attachments")
    file = relationship("File")

class NPOView(Base):
    __tablename__ = "npo_views"
    
    id = Column(Integer, primary_key=True, index=True)
    npo_id = Column(Integer, ForeignKey("npos.id"), nullable=False)
    viewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # null для неавторизованных пользователей
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    npo = relationship("NPO")
    viewer = relationship("User")

class EventView(Base):
    __tablename__ = "event_views"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    viewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # null для неавторизованных пользователей
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    event = relationship("Event")
    viewer = relationship("User")

class FavoriteType(str, enum.Enum):
    NEWS = "news"
    EVENT = "event"
    KNOWLEDGE = "knowledge"

class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_type = Column(SQLEnum(FavoriteType), nullable=False)  # news, event, knowledge
    item_id = Column(Integer, nullable=False)  # ID новости, события или материала
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", backref="favorites")
    
    __table_args__ = (
        # Уникальный индекс: один пользователь не может добавить один и тот же элемент дважды
        UniqueConstraint('user_id', 'item_type', 'item_id', name='uq_user_item'),
    )

class CityCoordinates(Base):
    __tablename__ = "city_coordinates"
    
    id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String, unique=True, nullable=False, index=True)  # Название города
    center_lat = Column(Float, nullable=False)  # Широта центра города
    center_lon = Column(Float, nullable=False)  # Долгота центра города
    zoom = Column(Integer, nullable=False)  # Уровень зума для карты
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

