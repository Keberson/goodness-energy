# API Documentation

## Аутентификация

Все защищенные эндпоинты требуют Bearer токен в заголовке:
```
Authorization: Bearer {token}
```

## Эндпоинты

### 1. Карта с точками НКО
- **GET** `/map/npo`
- **Описание**: Возвращает массив объектов с координатами и информацией о НКО
- **Ответ**: 
```json
[
  {
    "coordinates": [55.7558, 37.6173],
    "info": {
      "id": 1,
      "name": "Название НКО",
      "description": "Описание",
      "coordinates": [55.7558, 37.6173],
      "address": "Адрес",
      "timetable": "Расписание",
      "galleryIds": [1, 2, 3],
      "tags": ["тег1", "тег2"],
      "links": {},
      "vacancies": 5,
      "created_at": "2025-01-01T00:00:00"
    }
  }
]
```

### 2. Список всех организаций
- **GET** `/npo`
- **Описание**: Возвращает массив всех НКО
- **Ответ**: Массив объектов `NPOResponse`

### 3. Кабинет НКО

#### 3.1 Регистрация и управление НКО

**Загрузка файла**
- **POST** `/files`
- **Требует**: Bearer токен
- **Body**: `multipart/form-data` с полем `file`
- **Поддерживаемые форматы**: jpg, png, pdf, docx, doc, xlsx, txt, csv
- **Ответ**: `{ "id": 1, "filename": "file.jpg", "file_type": "jpg" }`

**Регистрация НКО**
- **POST** `/auth/reg/npo`
- **Body**:
```json
{
  "login": "npo_login",
  "password": "password",
  "psrn": "1234567890",
  "name": "Название НКО",
  "description": "Описание",
  "coordinates": [55.7558, 37.6173],
  "address": "Адрес",
  "galleryIds": [1, 2],
  "tags": ["тег1", "тег2"],
  "links": {},
  "timetable": "Пн-Пт 9:00-18:00"
}
```
- **Ответ**: `{ "access_token": "...", "token_type": "bearer" }`

**Обновление НКО**
- **PUT** `/npo/{id}`
- **Требует**: Bearer токен (NPO)
- **Body**: `NPOUpdate` (все поля опциональны)

**Удаление НКО**
- **DELETE** `/npo/{id}`
- **Требует**: Bearer токен (NPO)

#### 3.2 События

**Создание события**
- **POST** `/npo/{npo_id}/event`
- **Требует**: Bearer токен (NPO)
- **Body**:
```json
{
  "name": "Название события",
  "description": "Описание",
  "start": "2025-01-01T10:00:00",
  "end": "2025-01-01T18:00:00",
  "coordinates": [55.7558, 37.6173],
  "quantity": 10,
  "tags": ["тег1", "тег2"]
}
```

**Обновление события**
- **PUT** `/npo/{npo_id}/event/{event_id}`
- **Требует**: Bearer токен (NPO)

**Удаление события**
- **DELETE** `/npo/{npo_id}/event/{event_id}`
- **Требует**: Bearer токен (NPO)

**Изменение статуса события**
- **PATCH** `/npo/{npo_id}/event/{event_id}/status`
- **Требует**: Bearer токен (NPO)
- **Body**: `{ "status": "published" }`
- **Статусы**: `draft`, `published`, `cancelled`, `completed`

#### 3.3 Новости НКО

**Публикация новости**
- **POST** `/npo/{npo_id}/news`
- **Требует**: Bearer токен (NPO)
- **Body**:
```json
{
  "name": "Заголовок",
  "text": "Текст новости",
  "attachedIds": [1, 2],
  "tags": ["тег1"],
  "type": "blog"
}
```
- **Типы**: `blog`, `edu`, `docs`

### 4. Кабинет Волонтера

**Регистрация волонтера**
- **POST** `/auth/reg/vol`
- **Body**:
```json
{
  "login": "volunteer_login",
  "password": "password",
  "firstName": "Имя",
  "secondName": "Фамилия",
  "middleName": "Отчество",
  "about": "О себе",
  "birthday": "2000-01-01T00:00:00",
  "city": "Город",
  "sex": "M",
  "email": "email@example.com",
  "phone": "+79991234567"
}
```

**Обновление профиля**
- **PUT** `/volunteer/{id}`
- **Требует**: Bearer токен (Volunteer)

**Удаление профиля**
- **DELETE** `/volunteer/{id}`
- **Требует**: Bearer токен (Volunteer)

**Отклик на событие**
- **POST** `/volunteer/event/{event_id}`
- **Требует**: Bearer токен
- **Body**: `{ "userId": 1 }`

**Удаление отклика**
- **DELETE** `/volunteer/event/{event_id}/{user_id}`
- **Требует**: Bearer токен

**Создание новости**
- **POST** `/volunteer/{id}/news`
- **Требует**: Bearer токен (Volunteer)
- **Body**: Аналогично новостям НКО, но `type` только `blog`

### 5. Новости/База знаний

**Получение всех новостей**
- **GET** `/news`
- **Ответ**: Массив объектов `NewsResponse`

### 6. Кабинет администратора

**Добавление ресурса**
- **POST** `/admin/{id}/news`
- **Требует**: Bearer токен (Admin)
- **Body**: Аналогично новостям НКО

### 7. Авторизация

**Логин**
- **POST** `/auth/login`
- **Body**: `{ "login": "user_login", "password": "password" }`
- **Ответ**: `{ "access_token": "...", "token_type": "bearer" }`

