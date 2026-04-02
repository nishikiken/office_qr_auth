# Инструкция для пуша в GitHub

## 1. Проверь что все файлы обновлены

```bash
cd C:\Users\Nishiki\Documents\GitHub\office_qr_auth
dir
```

Должны быть файлы:
- index.html (6:27 PM или новее)
- app.js (5:29 PM или новее)
- style.css (5:24 PM или новее)
- supabase_setup.sql
- README.md
- SETUP.md
- TEST_USERS.md
- DEPLOY_GITHUB.md
- .gitignore

## 2. Выполни SQL в Supabase

1. Открой: https://supabase.com/dashboard/project/hyxyablgkjtoxcxnurkk
2. SQL Editor → New Query
3. Скопируй содержимое `supabase_setup.sql`
4. Выполни (Run)

## 3. Пуш в GitHub

```bash
cd C:\Users\Nishiki\Documents\GitHub\office_qr_auth
git status
git add .
git commit -m "QR Auth App with navigation and generator"
git push origin main
```

## 4. После пуша

Сайт автоматически обновится на GitHub Pages через 1-2 минуты.

## 5. Назначь себя админом

1. Открой сайт в Telegram
2. Нажми Debug (🐛)
3. Найди свой telegram_id в логах
4. Выполни SQL в Supabase:

```sql
UPDATE qr_auth_users 
SET is_admin = true 
WHERE telegram_id = YOUR_TELEGRAM_ID;
```

## 6. Тестирование

Перезагрузи приложение в Telegram - должно работать!

## Если ошибка "supabase already declared"

Это кэш браузера. Решения:
1. Очисти кэш в Telegram (Settings → Data and Storage → Clear Cache)
2. Или добавь версию в URL: `?v=2`
3. Или подожди 5-10 минут пока кэш обновится

## Проверка файлов

Если что-то не работает, проверь что файлы актуальные:
- index.html должен содержать: `@supabase/supabase-js@2.39.0/dist/umd/supabase.js`
- app.js должен содержать: `let supabase;` (только один раз!)
