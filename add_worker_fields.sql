-- Добавляем поля для редактирования работников

-- Добавляем колонку display_name (отображаемое имя)
ALTER TABLE qr_auth_users 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Добавляем колонку gender (пол: M или F)
ALTER TABLE qr_auth_users 
ADD COLUMN IF NOT EXISTS gender CHAR(1) DEFAULT 'M';

-- Комментарии
COMMENT ON COLUMN qr_auth_users.display_name IS 'Отображаемое имя работника (можно редактировать)';
COMMENT ON COLUMN qr_auth_users.gender IS 'Пол работника: M (мужской) или F (женский)';
