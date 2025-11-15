from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    NPO = "npo"
    VOLUNTEER = "volunteer"
    ADMIN = "admin"

class NewsType(str, enum.Enum):
    BLOG = "blog"
    EDU = "edu"
    DOCS = "docs"

class EventStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    login = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
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
    coordinates_lat = Column(Float)
    coordinates_lon = Column(Float)
    address = Column(String)
    timetable = Column(Text)  # JSON строка или текст
    links = Column(Text)  # JSON строка
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
    status = Column(SQLEnum(EventStatus), default=EventStatus.DRAFT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    npo = relationship("NPO", back_populates="events")
    tags = relationship("EventTag", back_populates="event", cascade="all, delete-orphan")
    responses = relationship("EventResponse", back_populates="event", cascade="all, delete-orphan")

class EventTag(Base):
    __tablename__ = "event_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    tag = Column(String, nullable=False)
    
    event = relationship("Event", back_populates="tags")

class EventResponse(Base):
    __tablename__ = "event_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    volunteer_id = Column(Integer, ForeignKey("volunteers.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    event = relationship("Event", back_populates="responses")
    volunteer = relationship("Volunteer", back_populates="event_responses")

class News(Base):
    __tablename__ = "news"
    
    id = Column(Integer, primary_key=True, index=True)
    npo_id = Column(Integer, ForeignKey("npos.id"), nullable=True)
    volunteer_id = Column(Integer, ForeignKey("volunteers.id"), nullable=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    type = Column(SQLEnum(NewsType), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
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

