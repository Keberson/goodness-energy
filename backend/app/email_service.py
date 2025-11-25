"""
Сервис для отправки email уведомлений
"""
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

# Настройки SMTP из переменных окружения
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT_STR = os.getenv("SMTP_PORT", "587")
try:
    SMTP_PORT = int(SMTP_PORT_STR)
except (ValueError, TypeError):
    logger.error(f"Неверное значение SMTP_PORT: {SMTP_PORT_STR}, используем 587")
    SMTP_PORT = 587

SMTP_USER = os.getenv("SMTP_USER", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()
SMTP_FROM_EMAIL_ENV = os.getenv("SMTP_FROM_EMAIL", "").strip()
SMTP_FROM_EMAIL = SMTP_FROM_EMAIL_ENV if SMTP_FROM_EMAIL_ENV else SMTP_USER
SMTP_USE_TLS_STR = os.getenv("SMTP_USE_TLS", "true").lower().strip()
SMTP_USE_TLS = SMTP_USE_TLS_STR == "true"

# Базовый URL фронтенда для ссылок в письмах
# Приоритет: FRONTEND_BASE_URL > извлечение из VITE_API_PROD_BASE_URL > localhost
FRONTEND_BASE_URL_ENV = os.getenv("FRONTEND_BASE_URL", "").strip()
if FRONTEND_BASE_URL_ENV:
    FRONTEND_BASE_URL = FRONTEND_BASE_URL_ENV.rstrip("/")
else:
    # Пытаемся извлечь базовый URL из переменной VITE_API_PROD_BASE_URL (если она установлена)
    # VITE_API_PROD_BASE_URL обычно имеет формат: https://domain.com/api
    # Фронтенд URL будет: https://domain.com (без /api)
    API_PROD_URL = os.getenv("VITE_API_PROD_BASE_URL", "").strip()
    if API_PROD_URL:
        # Убираем /api из конца, если есть
        if API_PROD_URL.endswith("/api"):
            FRONTEND_BASE_URL = API_PROD_URL[:-4].rstrip("/")
        elif API_PROD_URL.endswith("/api/"):
            FRONTEND_BASE_URL = API_PROD_URL[:-5].rstrip("/")
        else:
            # Если нет /api, предполагаем что это уже базовый URL
            FRONTEND_BASE_URL = API_PROD_URL.rstrip("/")
    else:
        # По умолчанию используем localhost только для разработки
        FRONTEND_BASE_URL = "http://localhost"

# Логируем используемый фронтенд URL
logger.info(f"FRONTEND_BASE_URL для email уведомлений: {FRONTEND_BASE_URL}")

def get_profile_url(user_type: str = "volunteer") -> str:
    """
    Получить URL профиля пользователя
    
    Args:
        user_type: Тип пользователя ("volunteer" или "npo")
    
    Returns:
        URL профиля
    """
    if user_type == "npo":
        return f"{FRONTEND_BASE_URL}/org"
    return f"{FRONTEND_BASE_URL}/profile"

# Логируем настройки SMTP при загрузке модуля (без пароля)
logger.info(f"Загрузка SMTP настроек: SMTP_HOST={os.getenv('SMTP_HOST', 'не установлен')}, SMTP_PORT={SMTP_PORT_STR}, SMTP_USER установлен={bool(SMTP_USER)}, SMTP_PASSWORD установлен={bool(SMTP_PASSWORD)}, SMTP_USE_TLS={SMTP_USE_TLS_STR}")

if SMTP_USER and SMTP_PASSWORD:
    logger.info(f"SMTP настроен: host={SMTP_HOST}, port={SMTP_PORT}, user={SMTP_USER}, from_email={SMTP_FROM_EMAIL}, use_tls={SMTP_USE_TLS}")
else:
    logger.warning(f"SMTP настройки не настроены! SMTP_USER={repr(SMTP_USER)}, SMTP_PASSWORD установлен={bool(SMTP_PASSWORD)}")
    logger.warning("Переменные окружения SMTP_USER и SMTP_PASSWORD должны быть установлены.")

def send_email(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None
) -> bool:
    """
    Отправка email сообщения
    
    Args:
        to_email: Email получателя
        subject: Тема письма
        html_body: HTML содержимое письма
        text_body: Текстовое содержимое (опционально)
    
    Returns:
        True если отправка успешна, False в противном случае
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning(f"SMTP настройки не настроены (SMTP_USER={bool(SMTP_USER)}, SMTP_PASSWORD={bool(SMTP_PASSWORD)}). Email не будет отправлен на {to_email}.")
        logger.warning("Установите переменные окружения SMTP_USER и SMTP_PASSWORD для отправки email уведомлений.")
        return False
    
    if not to_email:
        logger.warning(f"Email получателя не указан. Письмо не будет отправлено.")
        return False
    
    try:
        # Проверяем, что SMTP_FROM_EMAIL установлен
        if not SMTP_FROM_EMAIL:
            logger.error(f"SMTP_FROM_EMAIL не установлен. Email не будет отправлен на {to_email}.")
            return False
        
        # Создаем сообщение
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = SMTP_FROM_EMAIL
        msg['To'] = to_email
        
        # Добавляем текстовую версию
        if text_body:
            text_part = MIMEText(text_body, 'plain', 'utf-8')
            msg.attach(text_part)
        
        # Добавляем HTML версию
        html_part = MIMEText(html_body, 'html', 'utf-8')
        msg.attach(html_part)
        
        # Отправляем письмо
        # Для порта 465 используем SMTP_SSL (для Yandex, Mail.ru и т.д.)
        # Для других портов используем SMTP с TLS, если SMTP_USE_TLS=true
        logger.debug(f"Попытка подключения к SMTP: {SMTP_HOST}:{SMTP_PORT}, use_tls={SMTP_USE_TLS}")
        
        if SMTP_PORT == 465:
            # SSL соединение (для Yandex, Mail.ru и т.д.)
            logger.debug("Используем SMTP_SSL для порта 465")
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=30) as server:
                logger.debug("Подключение к SMTP серверу установлено")
                server.login(SMTP_USER, SMTP_PASSWORD)
                logger.debug("Аутентификация успешна")
                server.send_message(msg)
                logger.debug("Сообщение отправлено")
        else:
            # TLS соединение (для Gmail и большинства других сервисов)
            logger.debug(f"Используем SMTP с TLS={SMTP_USE_TLS}")
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
                if SMTP_USE_TLS:
                    logger.debug("Включаем TLS")
                    server.starttls()
                logger.debug("Подключение к SMTP серверу установлено")
                server.login(SMTP_USER, SMTP_PASSWORD)
                logger.debug("Аутентификация успешна")
                server.send_message(msg)
                logger.debug("Сообщение отправлено")
        
        logger.info(f"Email успешно отправлен на {to_email}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"Ошибка аутентификации SMTP при отправке email на {to_email}: {e}")
        logger.error("Проверьте правильность SMTP_USER и SMTP_PASSWORD")
        if "yandex" in SMTP_HOST.lower():
            logger.error("Для Yandex используйте 'Пароль приложения', а не обычный пароль аккаунта!")
            logger.error("Создайте пароль приложения: https://id.yandex.ru/security")
        elif "mail.ru" in SMTP_HOST.lower():
            logger.error("Для Mail.ru используйте 'Пароль приложения', а не обычный пароль аккаунта!")
            logger.error("Создайте пароль приложения: https://id.mail.ru/profile/security/app-passwords")
        return False
    except smtplib.SMTPException as e:
        logger.error(f"Ошибка SMTP при отправке email на {to_email}: {e}")
        return False
    except Exception as e:
        logger.error(f"Неожиданная ошибка при отправке email на {to_email}: {e}", exc_info=True)
        return False

def send_notification_city_news(
    to_email: str,
    news_title: str,
    news_text: str,
    city: str,
    news_url: Optional[str] = None
) -> bool:
    """
    Отправка уведомления о новости из города пользователя
    
    Args:
        to_email: Email получателя
        news_title: Заголовок новости
        news_text: Текст новости
        city: Название города
        news_url: URL новости (опционально)
    """
    subject = f"Новая новость из вашего города {city}"
    
    html_body = f"""
    <html>
        <body>
            <h2>Новая новость из вашего города {city}</h2>
            <h3>{news_title}</h3>
            <p>{news_text[:200]}{'...' if len(news_text) > 200 else ''}</p>
            {f'<p><a href="{news_url}">Читать полностью</a></p>' if news_url else ''}
            <hr>
            <p style="color: #888; font-size: 12px;">
                Вы получили это письмо, потому что подписаны на уведомления о новостях из вашего города.
                Вы можете изменить настройки уведомлений в <a href="{get_profile_url()}">своем профиле</a>.
            </p>
        </body>
    </html>
    """
    
    text_body = f"""
Новая новость из вашего города {city}

{news_title}

{news_text[:200]}{'...' if len(news_text) > 200 else ''}

{f'Читать полностью: {news_url}' if news_url else ''}

---
Вы получили это письмо, потому что подписаны на уведомления о новостях из вашего города.
Вы можете изменить настройки уведомлений в своем профиле: {get_profile_url()}
    """
    
    return send_email(to_email, subject, html_body, text_body)

def send_notification_registration(
    to_email: str,
    new_user_type: str,
    new_user_name: Optional[str] = None
) -> bool:
    """
    Отправка уведомления о регистрации нового пользователя
    
    Args:
        to_email: Email получателя
        new_user_type: Тип нового пользователя (volunteer/npo)
        new_user_name: Имя нового пользователя (опционально)
    """
    user_type_text = "волонтер" if new_user_type == "volunteer" else "НКО" if new_user_type == "npo" else "пользователь"
    
    subject = f"Новая регистрация: {user_type_text}"
    
    html_body = f"""
    <html>
        <body>
            <h2>Новая регистрация на платформе</h2>
            <p>На платформе зарегистрировался новый {user_type_text}{f': {new_user_name}' if new_user_name else ''}.</p>
            <hr>
            <p style="color: #888; font-size: 12px;">
                Вы получили это письмо, потому что подписаны на уведомления о регистрациях.
                Вы можете изменить настройки уведомлений в <a href="{get_profile_url()}">своем профиле</a>.
            </p>
        </body>
    </html>
    """
    
    text_body = f"""
Новая регистрация на платформе

На платформе зарегистрировался новый {user_type_text}{f': {new_user_name}' if new_user_name else ''}.

---
Вы получили это письмо, потому что подписаны на уведомления о регистрациях.
Вы можете изменить настройки уведомлений в своем профиле: {get_profile_url()}
    """
    
    return send_email(to_email, subject, html_body, text_body)

def send_notification_event(
    to_email: str,
    event_name: str,
    event_description: str,
    event_city: str,
    event_start: str,
    event_url: Optional[str] = None
) -> bool:
    """
    Отправка уведомления о новом событии
    
    Args:
        to_email: Email получателя
        event_name: Название события
        event_description: Описание события
        event_city: Город события
        event_start: Дата и время начала события
        event_url: URL события (опционально)
    """
    # Проверяем, что все обязательные поля заполнены
    if not event_name:
        event_name = "Событие"
    if not event_description:
        event_description = "Описание отсутствует"
    if not event_city:
        event_city = "Город не указан"
    if not event_start:
        event_start = "Дата не указана"
    
    subject = f"Новое событие: {event_name}"
    
    html_body = f"""
    <html>
        <body>
            <h2>Новое событие</h2>
            <h3>{event_name}</h3>
            <p><strong>Город:</strong> {event_city}</p>
            <p><strong>Дата начала:</strong> {event_start}</p>
            <p>{event_description[:200]}{'...' if len(event_description) > 200 else ''}</p>
            {f'<p><a href="{event_url}">Подробнее о событии</a></p>' if event_url else ''}
            <hr>
            <p style="color: #888; font-size: 12px;">
                Вы получили это письмо, потому что подписаны на уведомления о событиях.
                Вы можете изменить настройки уведомлений в <a href="{get_profile_url()}">своем профиле</a>.
            </p>
        </body>
    </html>
    """
    
    text_body = f"""
Новое событие

{event_name}

Город: {event_city}
Дата начала: {event_start}

{event_description[:200]}{'...' if len(event_description) > 200 else ''}

{f'Подробнее о событии: {event_url}' if event_url else ''}

---
Вы получили это письмо, потому что подписаны на уведомления о событиях.
Вы можете изменить настройки уведомлений в своем профиле: {get_profile_url()}
    """
    
    return send_email(to_email, subject, html_body, text_body)

def send_notification_event_cancelled(
    to_email: str,
    event_name: str,
    event_description: str,
    event_city: str,
    event_start: str,
    event_url: Optional[str] = None
) -> bool:
    """
    Отправка уведомления об отмене события
    
    Args:
        to_email: Email получателя
        event_name: Название события
        event_description: Описание события
        event_city: Город события
        event_start: Дата и время начала события
        event_url: URL события (опционально)
    """
    # Проверяем, что все обязательные поля заполнены
    if not event_name:
        event_name = "Событие"
    if not event_description:
        event_description = "Описание отсутствует"
    if not event_city:
        event_city = "Город не указан"
    if not event_start:
        event_start = "Дата не указана"
    
    subject = f"Событие отменено: {event_name}"
    
    html_body = f"""
    <html>
        <body>
            <h2 style="color: #d32f2f;">Событие отменено</h2>
            <h3>{event_name}</h3>
            <p><strong>Город:</strong> {event_city}</p>
            <p><strong>Дата начала:</strong> {event_start}</p>
            <p>{event_description[:200]}{'...' if len(event_description) > 200 else ''}</p>
            <p style="color: #d32f2f; font-weight: bold;">К сожалению, это событие было отменено организатором.</p>
            {f'<p><a href="{event_url}">Подробнее о событии</a></p>' if event_url else ''}
            <hr>
            <p style="color: #888; font-size: 12px;">
                Вы получили это письмо, потому что подписаны на уведомления о событиях.
                Вы можете изменить настройки уведомлений в <a href="{get_profile_url()}">своем профиле</a>.
            </p>
        </body>
    </html>
    """
    
    text_body = f"""
Событие отменено

{event_name}

Город: {event_city}
Дата начала: {event_start}

{event_description[:200]}{'...' if len(event_description) > 200 else ''}

К сожалению, это событие было отменено организатором.

{f'Подробнее о событии: {event_url}' if event_url else ''}

---
Вы получили это письмо, потому что подписаны на уведомления о событиях.
Вы можете изменить настройки уведомлений в своем профиле: {get_profile_url()}
    """
    
    return send_email(to_email, subject, html_body, text_body)

