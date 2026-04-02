# Тестовые пользователи для проверки с ПК

## Как тестировать с компьютера

Просто открой `index.html` в браузере:

### Обычный пользователь (по умолчанию)
```
file:///path/to/qr_auth_app/frontend/index.html
```
или
```
http://localhost:8000/index.html
```

Тестовый ID: `123456789`
Имя: "Тестовый Пользователь"

### Админ
Добавь параметр `?test=admin` к URL:
```
file:///path/to/qr_auth_app/frontend/index.html?test=admin
```
или
```
http://localhost:8000/index.html?test=admin
```

Тестовый ID: `999999999`
Имя: "Админ Тестовый"

## Назначение админа в базе

Чтобы тестовый админ работал, выполни SQL в Supabase:

```sql
-- Для тестового админа
UPDATE qr_auth_users 
SET is_admin = true 
WHERE telegram_id = 999999999;

-- Для своего реального аккаунта (узнай ID через Debug Console)
UPDATE qr_auth_users 
SET is_admin = true 
WHERE telegram_id = YOUR_REAL_TELEGRAM_ID;
```

## Запуск локального сервера

Если нужен локальный сервер для тестирования:

```bash
cd qr_auth_app/frontend
python -m http.server 8000
```

Потом открой: http://localhost:8000
