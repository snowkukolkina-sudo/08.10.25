-- Инициализация базы данных DANDY POS
-- Этот файл выполняется при первом запуске PostgreSQL контейнера

-- Создание расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Создание схемы для аудита (если нужно)
-- CREATE SCHEMA IF NOT EXISTS audit;

-- Настройка часового пояса
SET timezone = 'Europe/Moscow';

-- Создание пользователя для приложения (если не существует)
-- DO $$
-- BEGIN
--     IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'dandy_app') THEN
--         CREATE ROLE dandy_app WITH LOGIN PASSWORD 'dandy_app_password';
--     END IF;
-- END
-- $$;

-- Предоставление прав пользователю
-- GRANT ALL PRIVILEGES ON DATABASE dandy_pos TO dandy_app;
-- GRANT ALL PRIVILEGES ON SCHEMA public TO dandy_app;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dandy_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dandy_app;

-- Создание индексов для производительности (будут созданы после миграций)
-- Эти индексы будут созданы автоматически через миграции Knex.js

-- Настройка логирования
-- ALTER SYSTEM SET log_statement = 'all';
-- ALTER SYSTEM SET log_min_duration_statement = 1000; -- Логировать запросы дольше 1 секунды
-- SELECT pg_reload_conf();

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Комментарии к базе данных
COMMENT ON DATABASE dandy_pos IS 'База данных для кассовой системы DANDY POS';
