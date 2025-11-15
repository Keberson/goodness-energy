# Social Hack 2025 Backend API

Бэкенд сервис на FastAPI для платформы социальных проектов.

## Установка

### Локальная установка

1. Установите зависимости:
```bash
pip install -r requirements.txt
```

2. Запустите сервер:
```bash
uvicorn main:app --reload
```

API будет доступен по адресу: http://localhost:8000

Документация API (Swagger): http://localhost:8000/docs

### Docker развертывание

#### Вариант 1: Использование Docker Compose (рекомендуется)

Docker Compose автоматически развернет PostgreSQL и Backend в отдельных контейнерах.

1. Запустите контейнеры:
```bash
docker-compose up -d
```

2. Проверьте статус:
```bash
docker-compose ps
```

3. Просмотр логов:
```bash
docker-compose logs -f backend
```

4. Остановите контейнеры:
```bash
docker-compose down
```

5. Остановите и удалите данные (volumes):
```bash
docker-compose down -v
```

**Контейнеры:**
- `postgres` - PostgreSQL база данных (порт 5432)
- `backend` - FastAPI приложение (порт 8000)
- `minio` - MinIO объектное хранилище (порт 9000 - API, порт 9001 - консоль)

Контейнеры автоматически настроены для работы друг с другом через Docker сеть.

#### Вариант 2: Использование Docker напрямую

1. Запустите PostgreSQL:
```bash
docker run -d --name social_hack_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=social_hack \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

2. Соберите образ backend:
```bash
docker build -t social-hack-backend .
```

3. Запустите контейнер backend:
```bash
docker run -d -p 8000:8000 --name social_hack_backend \
  --link social_hack_db:postgres \
  -e DATABASE_URL=postgresql://postgres:postgres@postgres:5432/social_hack \
  -v $(pwd)/uploads:/app/uploads \
  social-hack-backend
```

API будет доступен по адресу: http://localhost:8000

## Структура проекта

```
.
├── app/
│   ├── __init__.py
│   ├── database.py          # Настройка БД
│   ├── models.py            # SQLAlchemy модели
│   ├── schemas.py           # Pydantic схемы
│   ├── auth.py              # Аутентификация и JWT
│   ├── minio_client.py      # Клиент MinIO для работы с файлами
│   └── routers/
│       ├── __init__.py
│       ├── auth.py          # Регистрация и авторизация
│       ├── npo.py           # Эндпоинты НКО
│       ├── volunteer.py     # Эндпоинты волонтеров
│       ├── admin.py         # Эндпоинты администратора
│       ├── news.py          # Новости/База знаний
│       ├── files.py         # Загрузка файлов (MinIO)
│       └── map.py           # Карта с точками
├── main.py                  # Точка входа
├── requirements.txt         # Зависимости
├── Dockerfile               # Docker образ
├── docker-compose.yml       # Docker Compose конфигурация
├── .dockerignore           # Исключения для Docker
└── README.md
```

## API Endpoints

### Аутентификация
- `POST /auth/reg/npo` - Регистрация НКО
- `POST /auth/reg/vol` - Регистрация волонтера
- `POST /auth/login` - Авторизация (получение JWT токена)

### Карта и НКО
- `GET /map/npo` - Карта с точками НКО
- `GET /npo` - Список всех организаций

### Кабинет НКО
- `POST /files` - Загрузка файла
- `PUT /npo/{id}` - Обновление НКО
- `DELETE /npo/{id}` - Удаление НКО
- `POST /npo/{id}/event` - Создание события
- `PUT /npo/{id}/event/{event_id}` - Обновление события
- `DELETE /npo/{id}/event/{event_id}` - Удаление события
- `PATCH /npo/{id}/event/{event_id}/status` - Изменение статуса события
- `POST /npo/{id}/news` - Публикация новостей

### Кабинет Волонтера
- `PUT /volunteer/{id}` - Обновление профиля
- `DELETE /volunteer/{id}` - Удаление профиля
- `POST /volunteer/event/{event_id}` - Отклик на событие
- `DELETE /volunteer/event/{event_id}/{user_id}` - Удаление отклика
- `POST /volunteer/{id}/news` - Создание новости

### Новости/База знаний
- `GET /news` - Получение всех новостей

### Кабинет администратора
- `POST /admin/{id}/news` - Добавление ресурсов для Базы знаний

## Аутентификация

Все защищенные эндпоинты требуют Bearer токен в заголовке:
```
Authorization: Bearer {token}
```

Токен получается при авторизации через `/auth/login` или регистрации.

## База данных

### Docker (рекомендуется)
При использовании Docker Compose автоматически разворачивается PostgreSQL в отдельном контейнере. Данные сохраняются в Docker volume `postgres_data`.

### Локальная разработка
По умолчанию используется PostgreSQL. Для использования SQLite установите переменную окружения:
```bash
export DATABASE_URL=sqlite:///./social_hack.db
```

### Подключение к PostgreSQL в Docker
```bash
docker exec -it social_hack_db psql -U postgres -d social_hack
```

### Переменные окружения для PostgreSQL
- `POSTGRES_USER` - пользователь (по умолчанию: postgres)
- `POSTGRES_PASSWORD` - пароль (по умолчанию: postgres)
- `POSTGRES_DB` - название базы данных (по умолчанию: social_hack)
- `DATABASE_URL` - строка подключения для приложения

## Загрузка файлов

Поддерживаемые форматы: jpg, png, pdf, docx, doc, xlsx, txt, csv

Файлы сохраняются в MinIO объектное хранилище.

### MinIO

MinIO запускается в Docker контейнере и используется для хранения всех загружаемых файлов.

**Эндпоинты:**
- `POST /files` - Загрузка файла (требует аутентификации)
- `GET /files/{file_id}` - Получение файла по ID
- `DELETE /files/{file_id}` - Удаление файла (требует аутентификации)

**Переменные окружения для MinIO:**
- `MINIO_ENDPOINT` - адрес MinIO сервера (по умолчанию: minio:9000)
- `MINIO_ROOT_USER` - имя пользователя MinIO (по умолчанию: minioadmin)
- `MINIO_ROOT_PASSWORD` - пароль MinIO (по умолчанию: minioadmin)
- `MINIO_SECURE` - использовать HTTPS (по умолчанию: false)
- `MINIO_BUCKET` - имя bucket для файлов (по умолчанию: files)
- `MINIO_PORT` - порт для MinIO API (по умолчанию: 9000)
- `MINIO_CONSOLE_PORT` - порт для MinIO консоли (по умолчанию: 9001)

**Доступ к MinIO консоли:**
После запуска контейнеров MinIO консоль будет доступна по адресу: http://localhost:9001
Используйте `MINIO_ROOT_USER` и `MINIO_ROOT_PASSWORD` для входа.

