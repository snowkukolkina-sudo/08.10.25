# 🚀 Быстрый старт DANDY POS Backend

## 📋 Что было создано

✅ **Полнофункциональная серверная часть** с микросервисной архитектурой:

### 🏗️ Архитектура
- **API Gateway** - Express.js сервер с маршрутизацией
- **PostgreSQL** - основная база данных с миграциями
- **Redis** - кэширование и сессии
- **RabbitMQ** - асинхронные события и очереди
- **GraphQL** - современный API поверх REST

### 🔧 Сервисы
- **Catalog Service** - управление товарами и категориями
- **Orders Service** - создание и управление заказами
- **Payments Service** - обработка платежей и возвратов
- **Users Service** - аутентификация и управление пользователями
- **Fiscal Service** - фискализация и работа с ОФД

### 📊 База данных
- 9 таблиц с полной схемой
- Миграции для создания структуры
- Тестовые данные (сиды)
- Индексы для производительности

### 🔄 Очереди сообщений
- RabbitMQ с топиками и очередями
- Обработчики событий для всех сервисов
- Асинхронная обработка заказов, платежей, фискализации

## 🚀 Запуск системы

### 1. Быстрый запуск через Docker

```bash
cd backend

# Запуск всех сервисов
npm run docker:up

# Выполнение миграций
npm run migrate

# Заполнение тестовыми данными
npm run seed
```

### 2. Проверка работы

- **API Server**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **GraphQL Playground**: http://localhost:3000/graphql
- **RabbitMQ Management**: http://localhost:15672 (dandy_user/dandy_password)

### 3. Тестовые пользователи

- **Админ**: `admin` / `admin123`
- **Кассир**: `cashier1` / `cashier123`
- **Менеджер**: `manager1` / `manager123`

## 📡 API Endpoints

### REST API

```bash
# Аутентификация
POST /api/v1/users/login
{
  "username": "admin",
  "password": "admin123"
}

# Получить товары
GET /api/v1/catalog/products
Authorization: Bearer <token>

# Создать заказ
POST /api/v1/orders
{
  "type": "delivery",
  "items": [
    {
      "product_id": "770e8400-e29b-41d4-a716-446655440001",
      "quantity": 2
    }
  ],
  "customer_name": "Иван Петров",
  "customer_phone": "+7 (495) 123-45-67"
}
```

### GraphQL API

```graphql
# Получить товары
query GetProducts {
  products {
    data {
      id
      name
      price
      category {
        name
      }
    }
  }
}

# Создать заказ
mutation CreateOrder {
  createOrder(input: {
    type: DELIVERY
    items: [{
      productId: "770e8400-e29b-41d4-a716-446655440001"
      quantity: 2
    }]
    customerName: "Иван Петров"
    customerPhone: "+7 (495) 123-45-67"
  }) {
    id
    orderNumber
    totalAmount
    status
  }
}
```

## 🔄 Обработка событий

Система автоматически обрабатывает события:

- **Создание заказа** → уведомления, обновление статусов
- **Оплата** → создание фискального чека, отправка в ОФД
- **Фискализация** → подтверждение от ОФД, уведомления

## 🛠️ Разработка

### Запуск в режиме разработки

```bash
# Основной сервер
npm run dev

# Воркеры для обработки сообщений (в отдельном терминале)
npm run dev:workers
```

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
└── docker-compose.yml   # Docker Compose конфигурация
```

## 🔒 Безопасность

- JWT аутентификация
- Хеширование паролей (bcrypt)
- Rate limiting
- CORS настройки
- Валидация входных данных
- Роли и разрешения пользователей

## 📊 Мониторинг

- Логирование через Winston
- Health check endpoint
- Метрики производительности
- Аудит операций пользователей

## 🎯 Что дальше?

1. **Интеграция с фронтендом** - подключение к существующему POS интерфейсу
2. **Реальные интеграции** - подключение к ФН и банковским терминалам
3. **Мобильное приложение** - для курьеров
4. **Агрегаторы** - интеграция с Яндекс.Еда, Delivery Club
5. **Мониторинг** - Prometheus, Grafana
6. **CI/CD** - автоматическое развертывание

## 📞 Поддержка

Система готова к использованию! Все основные компоненты реализованы и протестированы.

Для вопросов и доработок обращайтесь к команде разработки DANDY.
