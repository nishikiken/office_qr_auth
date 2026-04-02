# 🚀 Деплой на GitHub Pages

## Шаг 1: Настройка базы данных Supabase

1. Открой Supabase: https://supabase.com/dashboard/project/hyxyablgkjtoxcxnurkk
2. Перейди в **SQL Editor**
3. Скопируй и выполни SQL из файла `supabase_setup.sql`
4. Назначь себя админом:

```sql
-- Сначала узнай свой telegram_id:
-- 1. Открой сайт с ПК: index.html
-- 2. Нажми на кнопку Debug (🐛) внизу справа
-- 3. Найди строку с твоим ID в логах

-- Потом выполни (замени YOUR_TELEGRAM_ID на свой ID):
UPDATE qr_auth_users 
SET is_admin = true 
WHERE telegram_id = YOUR_TELEGRAM_ID;

-- Для тестового админа (для проверки с ПК):
UPDATE qr_auth_users 
SET is_admin = true 
WHERE telegram_id = 999999999;
```

## Шаг 2: Пуш в GitHub

```bash
cd C:\Users\Nishiki\Documents\GitHub\office_qr_auth

# Проверь что все файлы на месте
dir

# Добавь все файлы
git add .

# Создай коммит
git commit -m "QR Auth App - ready for deployment"

# Запуш в GitHub
git push origin main
```

## Шаг 3: Настройка GitHub Pages

1. Открой репозиторий: https://github.com/YOUR_USERNAME/office_qr_auth
2. Перейди в **Settings** → **Pages**
3. В разделе **Source**:
   - Branch: `main`
   - Folder: `/ (root)`
4. Нажми **Save**

Через 1-2 минуты сайт будет доступен:
```
https://YOUR_USERNAME.github.io/office_qr_auth/
```

## Шаг 4: Создание Telegram Bot

1. Открой [@BotFather](https://t.me/BotFather) в Telegram

2. Создай нового бота:
```
/newbot
```
- Название: `QR Авторизация`
- Username: `your_qr_auth_bot` (придумай свой)

3. Создай Mini App:
```
/newapp
```
- Выбери своего бота
- **Title**: QR Авторизация
- **Description**: Система авторизации через QR-коды
- **Photo**: загрузи иконку 640x360 (можешь пропустить)
- **Web App URL**: `https://YOUR_USERNAME.github.io/office_qr_auth/`
- **Short name**: `qrauth`

4. Готово! Теперь можешь открыть бота и запустить Mini App

## Шаг 5: Тестирование

### Тест с ПК (локально):

```bash
cd C:\Users\Nishiki\Documents\GitHub\office_qr_auth
python -m http.server 8000
```

Открой в браузере:
- Обычный пользователь: http://localhost:8000
- Админ: http://localhost:8000?test=admin

### Тест через Telegram:

1. Открой своего бота в Telegram
2. Нажми на кнопку Mini App
3. Приложение откроется

## Использование

### 👤 Обычный пользователь:
- **Вкладка "Сканировать"** - сканирует QR-коды
- **Вкладка "История"** - видит свои посещения (неделя/месяц/всё время)

### 👑 Админ:
- **Вкладка "Логи"** - видит все авторизации + статистику
- **Вкладка "Генератор"** - создает QR-коды для печати

## Генерация QR-кодов (для админов)

1. Открой вкладку "Генератор"
2. Введи текст (например: `ENTRANCE_1`, `OFFICE_MAIN`, `ROOM_101`)
3. Нажми "Сгенерировать QR"
4. Скачай или распечатай QR-код
5. Повесь QR-код на входе/в офисе

## Структура файлов

```
office_qr_auth/
├── index.html          # Главная страница
├── app.js              # Логика приложения
├── style.css           # Стили
├── supabase_setup.sql  # SQL для создания таблиц
├── README.md           # Описание проекта
├── SETUP.md            # Инструкция по настройке
├── TEST_USERS.md       # Тестовые пользователи
└── DEPLOY_GITHUB.md    # Эта инструкция
```

## Troubleshooting

### Проблема: Камера не работает
- Проверь разрешения браузера на доступ к камере
- В Telegram: Settings → Privacy → Camera

### Проблема: Не показываются данные
- Проверь что выполнил SQL из `supabase_setup.sql`
- Открой Debug Console (🐛) и посмотри ошибки

### Проблема: Не работает админ-панель
- Проверь что назначил себя админом в базе данных
- Выполни SQL: `UPDATE qr_auth_users SET is_admin = true WHERE telegram_id = YOUR_ID;`

## Готово! 🎉

Приложение работает полностью на клиенте (без backend).
Все данные хранятся в Supabase с real-time обновлениями.
