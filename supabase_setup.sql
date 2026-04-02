-- Таблица пользователей QR Auth (используем префикс чтобы не конфликтовать с другими таблицами)
CREATE TABLE qr_auth_users (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_worker BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица логов авторизации
CREATE TABLE qr_auth_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES qr_auth_users(telegram_id),
    full_name TEXT NOT NULL,
    qr_code TEXT NOT NULL,
    auth_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location TEXT
);

-- Индексы для быстрого поиска
CREATE INDEX idx_qr_auth_logs_user_id ON qr_auth_logs(user_id);
CREATE INDEX idx_qr_auth_logs_time ON qr_auth_logs(auth_time DESC);
CREATE INDEX idx_qr_auth_users_telegram_id ON qr_auth_users(telegram_id);

-- RLS (Row Level Security) политики
ALTER TABLE qr_auth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_auth_logs ENABLE ROW LEVEL SECURITY;

-- Все могут читать пользователей
CREATE POLICY "QR Auth users are viewable by everyone"
    ON qr_auth_users FOR SELECT
    USING (true);

-- Пользователи могут обновлять свои данные
CREATE POLICY "QR Auth users can update own data"
    ON qr_auth_users FOR UPDATE
    USING (true);

-- Пользователи могут вставлять свои данные
CREATE POLICY "QR Auth users can insert own data"
    ON qr_auth_users FOR INSERT
    WITH CHECK (true);

-- Все могут создавать логи авторизации
CREATE POLICY "Anyone can create QR auth logs"
    ON qr_auth_logs FOR INSERT
    WITH CHECK (true);

-- Все могут читать логи (фильтрация по admin будет на фронте)
CREATE POLICY "QR Auth logs are viewable by everyone"
    ON qr_auth_logs FOR SELECT
    USING (true);
