# QR Auth Mini App для Telegram

Telegram Mini App для авторизации через QR-коды с админ-панелью.

## Функционал

### Для пользователей:
- Сканирование QR-кода или другой метки
- Отправка данных авторизации

### Для админов:
- Просмотр всех авторизаций в реальном времени
- ФИО пользователя и время авторизации

## Структура проекта

```
qr_auth_app/
├── frontend/
│   ├── index.html          # Главная страница (сканер QR)
│   ├── admin.html          # Админ-панель
│   ├── app.js              # Логика приложения
│   └── style.css           # Стили
├── backend/
│   ├── main.py             # FastAPI сервер
│   └── database.py         # Supabase клиент
├── supabase_setup.sql      # SQL для создания таблиц
└── README.md
```

## Установка

1. Установите зависимости:
```bash
pip install fastapi uvicorn supabase python-telegram-bot
```

2. Настройте Supabase (см. supabase_setup.sql)

3. Создайте `.env` файл с переменными:
```
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
BOT_TOKEN=your_bot_token
```

4. Запустите backend:
```bash
cd backend
uvicorn main:app --reload
```

5. Настройте Mini App в BotFather
