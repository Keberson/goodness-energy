"""
Модуль для генерации аналитики НКО в форматах CSV и PDF
"""
import csv
import io
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models import (
    NPO, NPOView, EventView, Event, EventResponse as EventResponseModel,
    News, User
)
import matplotlib
matplotlib.use('Agg')  # Используем backend без GUI
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib import font_manager
import logging

# Настройка шрифтов для matplotlib (для поддержки русского языка)
plt.rcParams['font.family'] = ['DejaVu Sans', 'Arial', 'sans-serif']
plt.rcParams['axes.unicode_minus'] = False  # Исправляет проблему с минусом

# Настройка локали для дат (опционально, если нужна русская локализация)
try:
    import locale
    locale.setlocale(locale.LC_TIME, 'ru_RU.UTF-8')
except:
    pass  # Если русская локаль недоступна, используем английскую

logger = logging.getLogger(__name__)


def generate_csv_analytics(npo_id: int, db: Session) -> io.BytesIO:
    """
    Генерирует CSV файл с сырыми данными аналитики НКО
    
    Включает:
    - Просмотры профиля НКО
    - Просмотры событий
    - Отклики на события
    - Новости
    - События
    """
    npo = db.query(NPO).filter(NPO.id == npo_id).first()
    if not npo:
        raise ValueError(f"НКО с id {npo_id} не найдена")
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['#', 'Тип данных', 'Дата/Время', 'Детали'])
    
    row_num = 1
    
    # Просмотры профиля НКО
    npo_views = db.query(NPOView).filter(NPOView.npo_id == npo_id).order_by(NPOView.viewed_at).all()
    for view in npo_views:
        viewer_info = "Неавторизованный пользователь"
        if view.viewer_id:
            user = db.query(User).filter(User.id == view.viewer_id).first()
            if user:
                viewer_info = f"Пользователь: {user.login} (ID: {view.viewer_id})"
        writer.writerow([
            row_num,
            'Просмотр профиля НКО',
            view.viewed_at.strftime('%Y-%m-%d %H:%M:%S') if view.viewed_at else '',
            viewer_info
        ])
        row_num += 1
    
    # Просмотры событий
    events = db.query(Event).filter(Event.npo_id == npo_id).all()
    for event in events:
        event_views = db.query(EventView).filter(EventView.event_id == event.id).order_by(EventView.viewed_at).all()
        for view in event_views:
            viewer_info = "Неавторизованный пользователь"
            if view.viewer_id:
                user = db.query(User).filter(User.id == view.viewer_id).first()
                if user:
                    viewer_info = f"Пользователь: {user.login} (ID: {view.viewer_id})"
            writer.writerow([
                row_num,
                f'Просмотр события: {event.name}',
                view.viewed_at.strftime('%Y-%m-%d %H:%M:%S') if view.viewed_at else '',
                f"Событие ID: {event.id}, {viewer_info}"
            ])
            row_num += 1
    
    # Отклики на события
    for event in events:
        responses = db.query(EventResponseModel).filter(EventResponseModel.event_id == event.id).order_by(EventResponseModel.created_at).all()
        for response in responses:
            volunteer = response.volunteer
            volunteer_info = f"Волонтер: {volunteer.first_name} {volunteer.second_name} (ID: {volunteer.id})"
            writer.writerow([
                row_num,
                f'Отклик на событие: {event.name}',
                response.created_at.strftime('%Y-%m-%d %H:%M:%S') if response.created_at else '',
                f"Событие ID: {event.id}, {volunteer_info}"
            ])
            row_num += 1
    
    # События
    for event in events:
        writer.writerow([
            row_num,
            'Событие',
            event.created_at.strftime('%Y-%m-%d %H:%M:%S') if event.created_at else '',
            f"Название: {event.name}, Статус: {event.status.value}, Количество участников: {event.quantity or 'Не указано'}"
        ])
        row_num += 1
    
    # Новости
    news_list = db.query(News).filter(News.npo_id == npo_id).order_by(News.created_at).all()
    for news in news_list:
        writer.writerow([
            row_num,
            'Новость',
            news.created_at.strftime('%Y-%m-%d %H:%M:%S') if news.created_at else '',
            f"Название: {news.name}, Тип: {news.type.value}"
        ])
        row_num += 1
    
    # Конвертируем StringIO в BytesIO с UTF-8 BOM для Excel
    output.seek(0)
    content = output.getvalue()
    # Добавляем BOM для правильного отображения в Excel
    bytes_output = io.BytesIO()
    bytes_output.write('\ufeff'.encode('utf-8'))  # UTF-8 BOM
    bytes_output.write(content.encode('utf-8'))
    bytes_output.seek(0)
    return bytes_output


def generate_pdf_analytics(npo_id: int, db: Session) -> io.BytesIO:
    """
    Генерирует PDF файл с красивой аналитикой и графиками
    
    Включает:
    - Общую статистику
    - График активности пользователей по времени (просмотры профиля)
    - График просмотров событий по времени
    - График откликов на события по времени
    - Статистику по событиям
    """
    npo = db.query(NPO).filter(NPO.id == npo_id).first()
    if not npo:
        raise ValueError(f"НКО с id {npo_id} не найдена")
    
    # Создаем PDF в памяти
    buffer = io.BytesIO()
    pdf = PdfPages(buffer)
    
    # Получаем данные для графиков
    # Просмотры профиля по дням
    npo_views = db.query(
        func.date(NPOView.viewed_at).label('date'),
        func.count(NPOView.id).label('count')
    ).filter(
        NPOView.npo_id == npo_id
    ).group_by(
        func.date(NPOView.viewed_at)
    ).order_by('date').all()
    
    # Просмотры событий по дням
    events = db.query(Event).filter(Event.npo_id == npo_id).all()
    event_ids = [e.id for e in events]
    event_views_by_date = {}
    if event_ids:
        event_views = db.query(
            func.date(EventView.viewed_at).label('date'),
            func.count(EventView.id).label('count')
        ).filter(
            EventView.event_id.in_(event_ids)
        ).group_by(
            func.date(EventView.viewed_at)
        ).order_by('date').all()
        
        for date, count in event_views:
            if date in event_views_by_date:
                event_views_by_date[date] += count
            else:
                event_views_by_date[date] = count
    
    # Отклики на события по дням
    responses_by_date = {}
    if event_ids:
        responses = db.query(
            func.date(EventResponseModel.created_at).label('date'),
            func.count(EventResponseModel.id).label('count')
        ).filter(
            EventResponseModel.event_id.in_(event_ids)
        ).group_by(
            func.date(EventResponseModel.created_at)
        ).order_by('date').all()
        
        for date, count in responses:
            if date in responses_by_date:
                responses_by_date[date] += count
            else:
                responses_by_date[date] = count
    
    # Общая статистика
    total_profile_views = db.query(NPOView).filter(NPOView.npo_id == npo_id).count()
    unique_viewers = db.query(func.count(func.distinct(NPOView.viewer_id))).filter(
        NPOView.npo_id == npo_id,
        NPOView.viewer_id.isnot(None)
    ).scalar() or 0
    
    total_events = len(events)
    total_event_views = db.query(EventView).filter(EventView.event_id.in_(event_ids)).count() if event_ids else 0
    total_responses = db.query(EventResponseModel).filter(EventResponseModel.event_id.in_(event_ids)).count() if event_ids else 0
    total_news = db.query(News).filter(News.npo_id == npo_id).count()
    
    # События по статусам
    events_by_status = {}
    for event in events:
        status = event.status.value
        events_by_status[status] = events_by_status.get(status, 0) + 1
    
    # Страница 1: Общая статистика
    fig, ax = plt.subplots(figsize=(11, 8.5))
    fig.suptitle(f'Аналитика НКО: {npo.name}', fontsize=18, fontweight='bold', y=0.95)
    
    # Текстовая статистика с лучшим форматированием
    stats_lines = [
        "ОБЩАЯ СТАТИСТИКА",
        "",
        "Просмотры профиля:",
        f"  • Всего просмотров: {total_profile_views}",
        f"  • Уникальных посетителей: {unique_viewers}",
        "",
        "События:",
        f"  • Всего событий: {total_events}",
        f"  • Просмотров событий: {total_event_views}",
        f"  • Откликов на события: {total_responses}",
        "",
        "Новости:",
        f"  • Всего новостей: {total_news}",
    ]
    
    if events_by_status:
        stats_lines.append("")
        stats_lines.append("События по статусам:")
        status_labels = {
            'draft': 'Черновик',
            'published': 'Опубликовано',
            'cancelled': 'Отменено',
            'completed': 'Завершено'
        }
        for status, count in events_by_status.items():
            label = status_labels.get(status, status)
            stats_lines.append(f"  • {label}: {count}")
    
    stats_lines.append("")
    stats_lines.append(f"Дата формирования отчета: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    stats_text = "\n".join(stats_lines)
    
    # Размещаем текст в верхней части страницы
    ax.text(0.1, 0.85, stats_text, fontsize=12, verticalalignment='top',
             family='monospace', transform=ax.transAxes,
             bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.3))
    ax.axis('off')
    pdf.savefig(fig, bbox_inches='tight')
    plt.close(fig)
    
    # Страница 2: График активности пользователей (просмотры профиля)
    if npo_views:
        fig, ax = plt.subplots(figsize=(11, 8.5))
        dates = [view.date for view in npo_views]
        counts = [view.count for view in npo_views]
        
        # Если данных мало, используем столбчатую диаграмму
        if len(dates) == 1:
            ax.bar(dates, counts, color='#2E86AB', alpha=0.7, width=0.8)
            # Добавляем подпись значения
            for i, (date, count) in enumerate(zip(dates, counts)):
                ax.text(date, count, str(count), ha='center', va='bottom', fontsize=12, fontweight='bold')
        else:
            ax.plot(dates, counts, marker='o', linewidth=2.5, markersize=8, color='#2E86AB', label='Просмотры')
            ax.fill_between(dates, counts, alpha=0.3, color='#2E86AB')
            # Добавляем подписи значений выше точек
            for date, count in zip(dates, counts):
                # Добавляем небольшой отступ сверху от значения
                offset = max(counts) * 0.02 if max(counts) > 0 else 0.2
                ax.text(date, count + offset, str(count), ha='center', va='bottom', fontsize=10, fontweight='bold')
        
        # Настраиваем временную шкалу только для реальных дат
        ax.set_xlim([min(dates) - timedelta(days=1), max(dates) + timedelta(days=1)])
        
        # Форматируем даты на оси X
        if len(dates) <= 10:
            ax.set_xticks(dates)
            ax.set_xticklabels([date.strftime('%d.%m.%Y') for date in dates], rotation=45, ha='right')
        else:
            # Если дат много, показываем каждую N-ю
            step = max(1, len(dates) // 10)
            ax.set_xticks(dates[::step])
            ax.set_xticklabels([date.strftime('%d.%m.%Y') for date in dates[::step]], rotation=45, ha='right')
        
        ax.set_xlabel('Дата', fontsize=12, fontweight='bold')
        ax.set_ylabel('Количество просмотров', fontsize=12, fontweight='bold')
        ax.set_title('Активность пользователей: Просмотры профиля НКО', fontsize=14, fontweight='bold', pad=20)
        ax.grid(True, alpha=0.3, linestyle='--')
        ax.set_ylim(bottom=0)
        
        plt.tight_layout()
        pdf.savefig(fig, bbox_inches='tight')
        plt.close(fig)
    
    # Страница 3: График просмотров событий
    if event_views_by_date:
        fig, ax = plt.subplots(figsize=(11, 8.5))
        dates = sorted(event_views_by_date.keys())
        counts = [event_views_by_date[date] for date in dates]
        
        # Настраиваем ширину столбцов в зависимости от количества данных
        width = 0.8 if len(dates) > 1 else 0.6
        bars = ax.bar(dates, counts, color='#A23B72', alpha=0.7, width=width)
        
        # Добавляем подписи значений на столбцах
        for date, count in zip(dates, counts):
            ax.text(date, count, str(count), ha='center', va='bottom', fontsize=11, fontweight='bold')
        
        # Настраиваем временную шкалу только для реальных дат
        if len(dates) == 1:
            ax.set_xlim([dates[0] - timedelta(days=1), dates[0] + timedelta(days=1)])
        else:
            ax.set_xlim([min(dates) - timedelta(days=1), max(dates) + timedelta(days=1)])
        
        # Форматируем даты на оси X
        if len(dates) <= 10:
            ax.set_xticks(dates)
            ax.set_xticklabels([date.strftime('%d.%m.%Y') for date in dates], rotation=45, ha='right')
        else:
            step = max(1, len(dates) // 10)
            ax.set_xticks(dates[::step])
            ax.set_xticklabels([date.strftime('%d.%m.%Y') for date in dates[::step]], rotation=45, ha='right')
        
        ax.set_xlabel('Дата', fontsize=12, fontweight='bold')
        ax.set_ylabel('Количество просмотров', fontsize=12, fontweight='bold')
        ax.set_title('Просмотры событий по датам', fontsize=14, fontweight='bold', pad=20)
        ax.grid(True, alpha=0.3, axis='y', linestyle='--')
        ax.set_ylim(bottom=0)
        
        plt.tight_layout()
        pdf.savefig(fig, bbox_inches='tight')
        plt.close(fig)
    
    # Страница 4: График откликов на события
    if responses_by_date:
        fig, ax = plt.subplots(figsize=(11, 8.5))
        dates = sorted(responses_by_date.keys())
        counts = [responses_by_date[date] for date in dates]
        
        # Настраиваем ширину столбцов в зависимости от количества данных
        width = 0.8 if len(dates) > 1 else 0.6
        bars = ax.bar(dates, counts, color='#F18F01', alpha=0.7, width=width)
        
        # Добавляем подписи значений на столбцах
        for date, count in zip(dates, counts):
            ax.text(date, count, str(count), ha='center', va='bottom', fontsize=11, fontweight='bold')
        
        # Настраиваем временную шкалу только для реальных дат
        if len(dates) == 1:
            ax.set_xlim([dates[0] - timedelta(days=1), dates[0] + timedelta(days=1)])
        else:
            ax.set_xlim([min(dates) - timedelta(days=1), max(dates) + timedelta(days=1)])
        
        # Форматируем даты на оси X
        if len(dates) <= 10:
            ax.set_xticks(dates)
            ax.set_xticklabels([date.strftime('%d.%m.%Y') for date in dates], rotation=45, ha='right')
        else:
            step = max(1, len(dates) // 10)
            ax.set_xticks(dates[::step])
            ax.set_xticklabels([date.strftime('%d.%m.%Y') for date in dates[::step]], rotation=45, ha='right')
        
        ax.set_xlabel('Дата', fontsize=12, fontweight='bold')
        ax.set_ylabel('Количество откликов', fontsize=12, fontweight='bold')
        ax.set_title('Отклики на события по датам', fontsize=14, fontweight='bold', pad=20)
        ax.grid(True, alpha=0.3, axis='y', linestyle='--')
        ax.set_ylim(bottom=0)
        
        plt.tight_layout()
        pdf.savefig(fig, bbox_inches='tight')
        plt.close(fig)
    
    # Страница 5: Сводный график активности
    if npo_views or event_views_by_date or responses_by_date:
        fig, ax = plt.subplots(figsize=(11, 8.5))
        
        # Объединяем все даты
        all_dates = set()
        if npo_views:
            all_dates.update([view.date for view in npo_views])
        if event_views_by_date:
            all_dates.update(event_views_by_date.keys())
        if responses_by_date:
            all_dates.update(responses_by_date.keys())
        
        if all_dates:
            all_dates = sorted(all_dates)
            
            profile_counts = []
            event_counts = []
            response_counts = []
            
            for date in all_dates:
                # Просмотры профиля
                profile_count = next((view.count for view in npo_views if view.date == date), 0)
                profile_counts.append(profile_count)
                
                # Просмотры событий
                event_count = event_views_by_date.get(date, 0)
                event_counts.append(event_count)
                
                # Отклики
                response_count = responses_by_date.get(date, 0)
                response_counts.append(response_count)
            
            x = range(len(all_dates))
            # Настраиваем ширину столбцов в зависимости от количества дат
            if len(all_dates) == 1:
                width = 0.6
                x_positions = [0]
            else:
                width = min(0.25, 0.8 / len(all_dates))
                x_positions = x
            
            bars1 = ax.bar([i - width for i in x_positions], profile_counts, width, 
                          label='Просмотры профиля', color='#2E86AB', alpha=0.7)
            bars2 = ax.bar(x_positions, event_counts, width, 
                          label='Просмотры событий', color='#A23B72', alpha=0.7)
            bars3 = ax.bar([i + width for i in x_positions], response_counts, width, 
                          label='Отклики', color='#F18F01', alpha=0.7)
            
            # Добавляем подписи значений на столбцах
            for bars in [bars1, bars2, bars3]:
                for bar in bars:
                    height = bar.get_height()
                    if height > 0:
                        ax.text(bar.get_x() + bar.get_width()/2., height,
                               f'{int(height)}', ha='center', va='bottom', fontsize=9, fontweight='bold')
            
            # Форматируем даты на оси X
            if len(all_dates) <= 15:
                ax.set_xticks(x_positions)
                ax.set_xticklabels([date.strftime('%d.%m.%Y') for date in all_dates], rotation=45, ha='right')
            else:
                step = max(1, len(all_dates) // 15)
                ax.set_xticks(x_positions[::step])
                ax.set_xticklabels([date.strftime('%d.%m.%Y') for date in all_dates[::step]], rotation=45, ha='right')
            
            ax.set_xlabel('Дата', fontsize=12, fontweight='bold')
            ax.set_ylabel('Количество', fontsize=12, fontweight='bold')
            ax.set_title('Сводная активность пользователей', fontsize=14, fontweight='bold', pad=20)
            # Размещаем легенду в верхнем правом углу
            ax.legend(loc='upper right', fontsize=10, framealpha=0.9)
            ax.grid(True, alpha=0.3, axis='y', linestyle='--')
            ax.set_ylim(bottom=0)
            
            plt.tight_layout()
            pdf.savefig(fig, bbox_inches='tight')
            plt.close(fig)
    
    pdf.close()
    buffer.seek(0)
    return buffer

