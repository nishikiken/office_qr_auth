-- Добавляем политики для удаления пользователей и логов

-- Разрешаем удаление пользователей (для админов)
CREATE POLICY "Allow delete users"
    ON qr_auth_users FOR DELETE
    USING (true);

-- Разрешаем удаление логов (для админов при удалении пользователя)
CREATE POLICY "Allow delete logs"
    ON qr_auth_logs FOR DELETE
    USING (true);
