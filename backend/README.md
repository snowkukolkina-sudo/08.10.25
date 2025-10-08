# 🍕 DANDY POS Backend

Полнофункциональная серверная часть для кассовой системы DANDY с микросервисной архитектурой.

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- Docker и Docker Compose
- PostgreSQL 15+
- Redis 7+
- RabbitMQ 3.8+

### Установка и запуск

1. **Клонирование и установка зависимостей**
```bash
cd backend
npm install
```

2. **Настройка окружения**
```bash
cp env.example .env
# Отредактируйте .env файл с вашими настройками
```

3. **Запуск через Docker Compose (рекомендуется)**
```bash
npm run docker:up
```

4. **Или запуск вручную**
```bash
# Запуск базы данных и сервисов
docker-compose up -d postgres redis rabbitmq

# Выполнение миграций
npm run migrate

# Заполнение тестовыми данными
npm run seed

# Запуск сервера
npm run dev
```

## 🏗️ Архитектура

### Микросервисы

- **API Gateway** - маршрутизация запросов и аутентификация
- **Catalog Service** - управление каталогом товаров и категориями
- **Orders Service** - управление заказами и их статусами
- **Payments Service** - обработка платежей и возвратов
- **Users Service** - управление пользователями и аутентификация
- **Fiscal Service** - фискализация и работа с ОФД

### Технологический стек

- **Backend**: Node.js + Express
- **База данных**: PostgreSQL с Knex.js
- **Кэширование**: Redis
- **Очереди сообщений**: RabbitMQ
- **API**: REST + GraphQL
- **Аутентификация**: JWT
- **Логирование**: Winston
- **Контейнеризация**: Docker

## 📊 API Endpoints

### REST API

#### Аутентификация
- `POST /api/v1/users/login` - Вход в систему
- `POST /api/v1/users/register` - Регистрация (только админ)

#### Каталог
- `GET /api/v1/catalog/categories` - Получить категории
- `GET /api/v1/catalog/products` - Получить товары
- `POST /api/v1/catalog/products` - Создать товар
- `PUT /api/v1/catalog/products/:id` - Обновить товар

#### Заказы
- `GET /api/v1/orders` - Получить заказы
- `POST /api/v1/orders` - Создать заказ
- `PATCH /api/v1/orders/:id/status` - Обновить статус заказа
- `PATCH /api/v1/orders/:id/cancel` - Отменить заказ

#### Платежи
- `GET /api/v1/payments` - Получить платежи
- `POST /api/v1/payments` - Создать платеж
- `PATCH /api/v1/payments/:id/process` - Обработать платеж
- `PATCH /api/v1/payments/:id/refund` - Возврат платежа

#### Фискализация
- `GET /api/v1/fiscal` - Получить фискальные чеки
- `POST /api/v1/fiscal/create` - Создать фискальный чек
- `POST /api/v1/fiscal/:id/send` - Отправить чек в ОФД

### GraphQL API

GraphQL Playground доступен по адресу: `http://localhost:3000/graphql`

#### Основные запросы
```graphql
# Получить товары
query GetProducts($filters: ProductFilters) {
  products(filters: $filters) {
    data {
      id
      name
      price
      category {
        name
      }
    }
    pagination {
      page
      total
    }
  }
}

# Создать заказ
mutation CreateOrder($input: CreateOrderInput!) {
  createOrder(input: $input) {
    id
    orderNumber
    totalAmount
    status
  }
}

# Обновить статус заказа
mutation UpdateOrderStatus($id: ID!, $input: UpdateOrderStatusInput!) {
  updateOrderStatus(id: $id, input: $input) {
    id
    status
    updatedAt
  }
}
```

## 🔧 Конфигурация

### Переменные окружения

```env
# База данных
DATABASE_URL=postgresql://user:password@localhost:5432/dandy_pos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dandy_pos
DB_USER=dandy_user
DB_PASSWORD=dandy_password

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://user:password@localhost:5672

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Сервер
NODE_ENV=development
PORT=3000
```

### База данных

#### Миграции
```bash
# Применить миграции
npm run migrate

# Откатить последнюю миграцию
npx knex migrate:rollback

# Создать новую миграцию
npx knex migrate:make migration_name
```

#### Сиды (тестовые данные)
```bash
# Заполнить тестовыми данными
npm run seed

# Создать новый сид
npx knex seed:make seed_name
```

## 🔄 Очереди сообщений

### События

#### Заказы
- `order.created` - Заказ создан
- `order.updated` - Статус заказа обновлен
- `order.cancelled` - Заказ отменен

#### Платежи
- `payment.completed` - Платеж завершен
- `payment.failed` - Платеж не удался
- `payment.refunded` - Платеж возвращен

#### Фискализация
- `receipt.sent` - Чек отправлен в ОФД
- `receipt.confirmed` - Чек подтвержден ОФД
- `receipt.failed` - Ошибка отправки чека

### Обработчики сообщений

Обработчики сообщений автоматически запускаются вместе с сервером и обрабатывают события из очередей.

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Тесты с покрытием
npm run test:coverage

# Тесты в watch режиме
npm run test:watch
```

## 📝 Логирование

Логи сохраняются в папке `logs/`:
- `combined.log` - все логи
- `error.log` - только ошибки
- `exceptions.log` - необработанные исключения

Уровень логирования настраивается через переменную `LOG_LEVEL`.

## 🚀 Развертывание

### Production

1. **Настройка production окружения**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:prod_pass@prod_host:5432/dandy_pos_prod
```

2. **Запуск в production**
```bash
npm start
```

3. **Docker deployment**
```bash
docker build -t dandy-pos-backend .
docker run -d -p 3000:3000 --env-file .env dandy-pos-backend
```

### Мониторинг

- Health check: `GET /health`
- Metrics: `GET /metrics` (если настроен Prometheus)
- Logs: Winston с ротацией файлов

## 🔒 Безопасность

- JWT аутентификация
- Хеширование паролей (bcrypt)
- Rate limiting
- CORS настройки
- Helmet для безопасности заголовков
- Валидация входных данных

## 📚 Документация

- [API Documentation](docs/api.md)
- [Database Schema](docs/database.md)
- [GraphQL Schema](docs/graphql.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Разработка

### Структура проекта

```
backend/
├── src/
│   ├── config/          # Конфигурация БД, Redis, RabbitMQ
│   ├── graphql/         # GraphQL схема и резолверы
│   ├── middleware/      # Express middleware
│   ├── services/        # REST API сервисы
│   ├── utils/           # Утилиты (логгер, валидация)
│   ├── workers/         # Обработчики сообщений RabbitMQ
│   └── index.js         # Главный файл сервера
├── database/
│   ├── migrations/       # Миграции БД
│   └── seeds/           # Тестовые данные
├── docker-compose.yml   # Docker Compose конфигурация
├── Dockerfile          # Docker образ
└── package.json        # Зависимости и скрипты
```

### Соглашения

- Используйте ESLint для форматирования кода
- Пишите тесты для новой функциональности
- Документируйте API изменения
- Следуйте принципам REST и GraphQL

## 📞 Поддержка

Для вопросов и поддержки обращайтесь к команде разработки DANDY.
