from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models import (
    NPO, NPOStatus, User, NPOGallery, NPOTag, Event, EventTag, 
    EventResponse as EventResponseModel, NPOCity, Favorite, FavoriteType,
    NPOView, EventView, News, EventStatus
)
from app.schemas import (
    NPOStatusUpdate, NPOResponse, EventResponse, 
    AllNPOStatisticsResponse, NPOStatisticsItem, DateStatisticsItem
)
from app.auth import get_current_admin_user
from app.analytics import generate_pdf_analytics, generate_all_npos_pdf_analytics
from fastapi.responses import StreamingResponse
from datetime import datetime
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/npo/unconfirmed", response_model=List[NPOResponse], tags=["provide"])
async def get_unconfirmed_npos(
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Получение списка неподтвержденных НКО"""
    npos = db.query(NPO).filter(NPO.status == NPOStatus.NOT_CONFIRMED).order_by(NPO.created_at.desc()).all()
    
    result = []
    for npo in npos:
        gallery_ids = [g.file_id for g in npo.gallery]
        tags = [t.tag for t in npo.tags]
        
        # Подсчет активных событий
        active_events_count = db.query(Event).filter(
            Event.npo_id == npo.id,
            Event.status.in_(["draft", "published"])
        ).count()
        
        result.append(NPOResponse(
            id=npo.id,
            name=npo.name,
            description=npo.description,
            page_content=npo.page_content,
            coordinates=[float(npo.coordinates_lat), float(npo.coordinates_lon)] if npo.coordinates_lat is not None and npo.coordinates_lon is not None else None,
            address=npo.address,
            city=NPOCity(npo.city) if npo.city else NPOCity.ANGARSK,
            timetable=npo.timetable,
            galleryIds=gallery_ids,
            tags=tags,
            links=json.loads(npo.links) if npo.links else None,
            vacancies=active_events_count,
            status=npo.status if npo.status is not None else NPOStatus.NOT_CONFIRMED,
            created_at=npo.created_at
        ))
    
    return result

@router.patch("/npo/{npo_id}/status", tags=["validate"])
async def update_npo_status(
    npo_id: int,
    status_update: NPOStatusUpdate,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Изменение статуса НКО администратором"""
    npo = db.query(NPO).filter(NPO.id == npo_id).first()
    if not npo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="НКО не найдена"
        )
    
    npo.status = status_update.status
    db.commit()
    db.refresh(npo)
    
    return {"message": "Статус НКО успешно обновлен", "npo_id": npo.id, "status": npo.status.value}

@router.delete("/npo/{npo_id}", tags=["validate"])
async def delete_npo(
    npo_id: int,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Удаление НКО администратором"""
    npo = db.query(NPO).filter(NPO.id == npo_id).first()
    if not npo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="НКО не найдена"
        )
    
    # Сохраняем user_id перед удалением НКО
    user_id = npo.user_id
    
    # Удаляем НКО (каскадно удалятся связанные записи: галерея, теги, события, новости)
    db.delete(npo)
    db.flush()
    
    # Удаляем связанного пользователя
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
    
    db.commit()
    return {"message": "НКО успешно удалена"}

@router.delete("/event/{event_id}", tags=["validate"])
async def delete_event(
    event_id: int,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Удаление события администратором"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Событие не найдено"
        )
    
    # Удаляем избранные записи, связанные с этим событием (полиморфная связь без FK)
    db.query(Favorite).filter(
        Favorite.item_type == FavoriteType.EVENT,
        Favorite.item_id == event_id
    ).delete()
    
    # Удаляем само событие (каскадно на уровне БД удалятся EventView, EventTag, EventResponse, EventAttachment)
    db.delete(event)
    db.commit()
    return {"message": "Событие успешно удалено"}

@router.get("/statistics/all-npos", response_model=AllNPOStatisticsResponse, tags=["statistics"])
async def get_all_npos_statistics(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Получение статистики всех НКО для администратора"""
    
    # Получаем все НКО
    all_npos = db.query(NPO).all()
    total_npos = len(all_npos)
    
    # Общая статистика просмотров профилей с фильтрацией по датам
    profile_views_query = db.query(NPOView)
    if start_date:
        profile_views_query = profile_views_query.filter(func.date(NPOView.viewed_at) >= start_date)
    if end_date:
        profile_views_query = profile_views_query.filter(func.date(NPOView.viewed_at) <= end_date)
    
    total_profile_views = profile_views_query.count()
    
    unique_viewers_query = db.query(func.count(func.distinct(NPOView.viewer_id))).filter(
        NPOView.viewer_id.isnot(None)
    )
    if start_date:
        unique_viewers_query = unique_viewers_query.filter(func.date(NPOView.viewed_at) >= start_date)
    if end_date:
        unique_viewers_query = unique_viewers_query.filter(func.date(NPOView.viewed_at) <= end_date)
    
    total_unique_viewers = unique_viewers_query.scalar() or 0
    
    # Общая статистика событий (без фильтрации по датам, так как это дата создания события)
    total_events = db.query(Event).count()
    total_events_by_status = {}
    for event_status in EventStatus:
        count = db.query(Event).filter(Event.status == event_status).count()
        total_events_by_status[event_status.value] = count
    
    # Общая статистика новостей (без фильтрации по датам)
    total_news = db.query(News).count()
    
    # Общая статистика откликов с фильтрацией по датам
    responses_query = db.query(EventResponseModel)
    if start_date:
        responses_query = responses_query.filter(func.date(EventResponseModel.created_at) >= start_date)
    if end_date:
        responses_query = responses_query.filter(func.date(EventResponseModel.created_at) <= end_date)
    
    total_event_responses = responses_query.count()
    
    # Суммарные данные по датам для графиков (по всем НКО)
    # Просмотры профиля по дням (все НКО) с фильтрацией по датам
    all_npo_views_query = db.query(
        func.date(NPOView.viewed_at).label('date'),
        func.count(NPOView.id).label('count')
    )
    if start_date:
        all_npo_views_query = all_npo_views_query.filter(func.date(NPOView.viewed_at) >= start_date)
    if end_date:
        all_npo_views_query = all_npo_views_query.filter(func.date(NPOView.viewed_at) <= end_date)
    
    all_npo_views_by_date = all_npo_views_query.group_by(
        func.date(NPOView.viewed_at)
    ).order_by('date').all()
    
    # Просмотры событий по дням (все НКО) с фильтрацией по датам
    all_event_ids = [e.id for e in db.query(Event.id).all()]
    all_event_views_by_date = {}
    if all_event_ids:
        event_views_query = db.query(
            func.date(EventView.viewed_at).label('date'),
            func.count(EventView.id).label('count')
        ).filter(
            EventView.event_id.in_(all_event_ids)
        )
        if start_date:
            event_views_query = event_views_query.filter(func.date(EventView.viewed_at) >= start_date)
        if end_date:
            event_views_query = event_views_query.filter(func.date(EventView.viewed_at) <= end_date)
        
        event_views = event_views_query.group_by(
            func.date(EventView.viewed_at)
        ).order_by('date').all()
        
        for date, count in event_views:
            if date in all_event_views_by_date:
                all_event_views_by_date[date] += count
            else:
                all_event_views_by_date[date] = count
    
    # Отклики по дням (все НКО) с фильтрацией по датам
    all_responses_by_date = {}
    if all_event_ids:
        responses_query = db.query(
            func.date(EventResponseModel.created_at).label('date'),
            func.count(EventResponseModel.id).label('count')
        ).filter(
            EventResponseModel.event_id.in_(all_event_ids)
        )
        if start_date:
            responses_query = responses_query.filter(func.date(EventResponseModel.created_at) >= start_date)
        if end_date:
            responses_query = responses_query.filter(func.date(EventResponseModel.created_at) <= end_date)
        
        responses = responses_query.group_by(
            func.date(EventResponseModel.created_at)
        ).order_by('date').all()
        
        for date, count in responses:
            if date in all_responses_by_date:
                all_responses_by_date[date] += count
            else:
                all_responses_by_date[date] = count
    
    # Объединяем все даты для суммарной статистики
    all_total_dates = set()
    all_total_dates.update([view.date for view in all_npo_views_by_date])
    all_total_dates.update(all_event_views_by_date.keys())
    all_total_dates.update(all_responses_by_date.keys())
    
    # Создаем список суммарной статистики по датам
    total_date_statistics = []
    for date in sorted(all_total_dates):
        profile_count = next((view.count for view in all_npo_views_by_date if view.date == date), 0)
        event_count = all_event_views_by_date.get(date, 0)
        response_count = all_responses_by_date.get(date, 0)
        
        total_date_statistics.append(DateStatisticsItem(
            date=date.isoformat() if hasattr(date, 'isoformat') else str(date),
            profile_views=profile_count,
            event_views=event_count,
            responses=response_count
        ))
    
    # Статистика по каждому НКО
    npo_statistics = []
    for npo in all_npos:
        # Просмотры профиля с фильтрацией по датам
        npo_profile_views_query = db.query(NPOView).filter(NPOView.npo_id == npo.id)
        if start_date:
            npo_profile_views_query = npo_profile_views_query.filter(func.date(NPOView.viewed_at) >= start_date)
        if end_date:
            npo_profile_views_query = npo_profile_views_query.filter(func.date(NPOView.viewed_at) <= end_date)
        npo_profile_views = npo_profile_views_query.count()
        
        npo_unique_viewers_query = db.query(func.count(func.distinct(NPOView.viewer_id))).filter(
            NPOView.npo_id == npo.id,
            NPOView.viewer_id.isnot(None)
        )
        if start_date:
            npo_unique_viewers_query = npo_unique_viewers_query.filter(func.date(NPOView.viewed_at) >= start_date)
        if end_date:
            npo_unique_viewers_query = npo_unique_viewers_query.filter(func.date(NPOView.viewed_at) <= end_date)
        npo_unique_viewers = npo_unique_viewers_query.scalar() or 0
        
        # События (без фильтрации по датам, так как это дата создания события)
        npo_total_events = db.query(Event).filter(Event.npo_id == npo.id).count()
        npo_events_by_status = {}
        for event_status in EventStatus:
            count = db.query(Event).filter(
                Event.npo_id == npo.id,
                Event.status == event_status
            ).count()
            npo_events_by_status[event_status.value] = count
        
        # Новости (без фильтрации по датам)
        npo_total_news = db.query(News).filter(News.npo_id == npo.id).count()
        
        # Отклики на события с фильтрацией по датам
        npo_responses_query = db.query(EventResponseModel).join(Event).filter(
            Event.npo_id == npo.id
        )
        if start_date:
            npo_responses_query = npo_responses_query.filter(func.date(EventResponseModel.created_at) >= start_date)
        if end_date:
            npo_responses_query = npo_responses_query.filter(func.date(EventResponseModel.created_at) <= end_date)
        npo_total_responses = npo_responses_query.count()
        
        # Данные по датам для графиков с фильтрацией по датам
        date_statistics = []
        
        # Просмотры профиля по дням с фильтрацией по датам
        npo_views_query = db.query(
            func.date(NPOView.viewed_at).label('date'),
            func.count(NPOView.id).label('count')
        ).filter(
            NPOView.npo_id == npo.id
        )
        if start_date:
            npo_views_query = npo_views_query.filter(func.date(NPOView.viewed_at) >= start_date)
        if end_date:
            npo_views_query = npo_views_query.filter(func.date(NPOView.viewed_at) <= end_date)
        npo_views_by_date = npo_views_query.group_by(
            func.date(NPOView.viewed_at)
        ).order_by('date').all()
        
        # Просмотры событий по дням с фильтрацией по датам
        npo_events = db.query(Event).filter(Event.npo_id == npo.id).all()
        npo_event_ids = [e.id for e in npo_events]
        event_views_by_date = {}
        if npo_event_ids:
            event_views_query = db.query(
                func.date(EventView.viewed_at).label('date'),
                func.count(EventView.id).label('count')
            ).filter(
                EventView.event_id.in_(npo_event_ids)
            )
            if start_date:
                event_views_query = event_views_query.filter(func.date(EventView.viewed_at) >= start_date)
            if end_date:
                event_views_query = event_views_query.filter(func.date(EventView.viewed_at) <= end_date)
            
            event_views = event_views_query.group_by(
                func.date(EventView.viewed_at)
            ).order_by('date').all()
            
            for date, count in event_views:
                if date in event_views_by_date:
                    event_views_by_date[date] += count
                else:
                    event_views_by_date[date] = count
        
        # Отклики по дням с фильтрацией по датам
        responses_by_date = {}
        if npo_event_ids:
            responses_query = db.query(
                func.date(EventResponseModel.created_at).label('date'),
                func.count(EventResponseModel.id).label('count')
            ).filter(
                EventResponseModel.event_id.in_(npo_event_ids)
            )
            if start_date:
                responses_query = responses_query.filter(func.date(EventResponseModel.created_at) >= start_date)
            if end_date:
                responses_query = responses_query.filter(func.date(EventResponseModel.created_at) <= end_date)
            
            responses = responses_query.group_by(
                func.date(EventResponseModel.created_at)
            ).order_by('date').all()
            
            for date, count in responses:
                if date in responses_by_date:
                    responses_by_date[date] += count
                else:
                    responses_by_date[date] = count
        
        # Объединяем все даты
        all_dates = set()
        all_dates.update([view.date for view in npo_views_by_date])
        all_dates.update(event_views_by_date.keys())
        all_dates.update(responses_by_date.keys())
        
        # Создаем список статистики по датам
        for date in sorted(all_dates):
            profile_count = next((view.count for view in npo_views_by_date if view.date == date), 0)
            event_count = event_views_by_date.get(date, 0)
            response_count = responses_by_date.get(date, 0)
            
            date_statistics.append(DateStatisticsItem(
                date=date.isoformat() if hasattr(date, 'isoformat') else str(date),
                profile_views=profile_count,
                event_views=event_count,
                responses=response_count
            ))
        
        npo_statistics.append(NPOStatisticsItem(
            npo_id=npo.id,
            npo_name=npo.name,
            total_profile_views=npo_profile_views,
            unique_viewers=npo_unique_viewers,
            total_events=npo_total_events,
            events_by_status=npo_events_by_status,
            total_news=npo_total_news,
            total_event_responses=npo_total_responses,
            date_statistics=date_statistics if date_statistics else None
        ))
    
    return AllNPOStatisticsResponse(
        total_npos=total_npos,
        total_profile_views=total_profile_views,
        total_unique_viewers=total_unique_viewers,
        total_events=total_events,
        total_events_by_status=total_events_by_status,
        total_news=total_news,
        total_event_responses=total_event_responses,
        total_date_statistics=total_date_statistics if total_date_statistics else None,
        npo_statistics=npo_statistics
    )

@router.get("/statistics/npo/{npo_id}/export/pdf", tags=["statistics"])
async def export_npo_statistics_pdf_admin(
    npo_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Выгрузка статистики конкретного НКО в формате PDF (для администратора)"""
    try:
        # Проверяем, что НКО существует
        npo = db.query(NPO).filter(NPO.id == npo_id).first()
        if not npo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"НКО с id {npo_id} не найдена"
            )
        
        pdf_buffer = generate_pdf_analytics(npo_id, db, start_date, end_date)
        filename = f"npo_{npo_id}_analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Ошибка при генерации PDF: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при генерации PDF файла"
        )

@router.get("/statistics/export/pdf", tags=["statistics"])
async def export_all_npos_statistics_pdf(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Выгрузка общей статистики всех НКО в формате PDF"""
    try:
        # Получаем статистику с фильтрацией по датам
        statistics_response = await get_all_npos_statistics(start_date, end_date, current_user, db)
        
        # Генерируем PDF на основе общей статистики
        pdf_buffer = generate_all_npos_pdf_analytics(statistics_response, db, start_date, end_date)
        filename = f"all_npos_statistics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Ошибка при генерации PDF: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при генерации PDF файла"
        )

