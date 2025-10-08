# SQLite Setup Guide

## 🎉 SQLite успешно настроен и работает!

### Что было сделано:

1. ✅ **Установлен SQLite3** - добавлен в package.json
2. ✅ **Созданы миграции для SQLite** - адаптированы под SQLite синтаксис
3. ✅ **Настроен knexfile** - поддержка SQLite конфигурации
4. ✅ **Созданы таблицы** - users, categories, products, orders
5. ✅ **Протестировано подключение** - все работает!

### Как использовать SQLite:

#### 1. Переключение на SQLite
Создайте файл `.env` в папке `backend/`:
```env
DB_CLIENT=sqlite3
DATABASE_URL=sqlite:./database.sqlite
DB_FILENAME=./database.sqlite
```

#### 2. Запуск миграций
```bash
npm run migrate:sqlite
```

#### 3. Заполнение данными
```bash
npm run seed:sqlite
```

#### 4. Тестирование подключения
```bash
npm run test:db
```

### Преимущества SQLite:

- 🚀 **Быстрая разработка** - не нужен Docker или PostgreSQL
- 📦 **Портативность** - один файл базы данных
- 🔧 **Простота** - работает из коробки
- 💾 **Локальность** - данные хранятся локально

### Структура базы данных:

```
database.sqlite
├── users (пользователи системы)
├── categories (категории товаров)
├── products (товары)
├── orders (заказы)
└── knex_migrations (история миграций)
```

### Следующие шаги:

1. Запустить сервер: `npm start`
2. Протестировать API endpoints
3. При необходимости переключиться на PostgreSQL для продакшена

### Переключение обратно на PostgreSQL:

1. Установить Docker
2. Запустить: `docker-compose up -d`
3. Изменить `.env`: `DB_CLIENT=postgresql`
4. Запустить: `npm run migrate`

---

**Статус**: ✅ SQLite полностью настроен и готов к работе!
