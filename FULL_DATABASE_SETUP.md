# 🗄️ ПОЛНАЯ НАСТРОЙКА БАЗЫ ДАННЫХ

**Дата:** 29.09.2025  
**Статус:** ✅ **ГОТОВО К ЗАПУСКУ!**

---

## 🎯 ЧТО СОЗДАНО:

### **1. МИГРАЦИИ (Database Migrations):**

#### **✅ Основные таблицы (уже были):**
1. `001_create_users_table.js` - Пользователи
2. `002_create_categories_table.js` - Категории
3. `003_create_products_table.js` - Товары
4. `004_create_orders_table.js` - Заказы
5. `005_create_order_items_table.js` - Позиции заказов
6. `006_create_payments_table.js` - Платежи
7. `007_create_fiscal_receipts_table.js` - Чеки
8. `008_create_delivery_zones_table.js` - Зоны доставки
9. `009_create_audit_logs_table.js` - Аудит

#### **🆕 НОВЫЕ ТАБЛИЦЫ:**

**010 - Складской учёт (FEFO):**
- `warehouses` - Склады/точки хранения
- `warehouse_inventory` - Товары на складе с партиями
- `warehouse_operations` - Все операции (приход, списание, перемещение)
- `expiry_alerts` - Уведомления об истечении сроков годности

**011 - Система курьеров:**
- `couriers` - Курьеры
- `courier_assignments` - Назначения заказов
- `courier_locations` - GPS трекинг в реальном времени
- `courier_zones` - Зоны работы курьеров
- `courier_ratings` - Рейтинги и отзывы

**012 - Интеграции:**
- `egais_documents` - ЕГАИС (алкоголь)
- `mercury_documents` - Меркурий (ветконтроль)
- `honest_sign_marks` - Честный знак (маркировка)
- `edo_documents` - ЭДО (электронный документооборот)
- `erp_sync_log` - Синхронизация с 1С/SAP/Oracle
- `aggregator_orders` - Заказы с агрегаторов
- `kds_orders` - Kitchen Display System

**013 - Отчёты:**
- `reports` - Сохранённые отчёты
- `scheduled_reports` - Запланированные отчёты
- `daily_summaries` - Z-отчёты (дневные сводки)

---

## 🚀 КАК ЗАПУСТИТЬ:

### **Шаг 1: Установи зависимости**
```bash
cd backend
npm install knex sqlite3
```

### **Шаг 2: Запусти скрипт настройки**
```bash
node setup-full-database.js
```

### **Шаг 3: Проверь результат**
```
🎉 БАЗА ДАННЫХ УСПЕШНО НАСТРОЕНА!
📊 Созданные таблицы: 28
📄 Файл базы данных: dandy_pizza_full.db
✅ Готово к использованию!
```

---

## 📊 СТРУКТУРА БАЗЫ ДАННЫХ:

### **28 ТАБЛИЦ:**

#### **👥 Пользователи и права:**
- `users` - Пользователи системы
- `audit_logs` - Логи всех действий

#### **🍕 Товары и заказы:**
- `categories` - Категории товаров
- `products` - Товары и блюда
- `orders` - Заказы клиентов
- `order_items` - Позиции в заказах
- `payments` - Платежи
- `fiscal_receipts` - Фискальные чеки
- `delivery_zones` - Зоны доставки

#### **📦 Склад (FEFO):**
- `warehouses` - Склады
- `warehouse_inventory` - Товары с партиями и сроками
- `warehouse_operations` - Операции
- `expiry_alerts` - Контроль сроков

#### **🚚 Курьеры:**
- `couriers` - Данные курьеров
- `courier_assignments` - Назначенные заказы
- `courier_locations` - GPS позиции
- `courier_zones` - Зоны доставки
- `courier_ratings` - Отзывы

#### **🔗 Интеграции:**
- `egais_documents` - ЕГАИС
- `mercury_documents` - Меркурий
- `honest_sign_marks` - Честный знак
- `edo_documents` - ЭДО
- `erp_sync_log` - 1С/ERP
- `aggregator_orders` - Яндекс.Еда и т.д.
- `kds_orders` - Кухонный дисплей

#### **📈 Отчёты:**
- `reports` - Отчёты
- `scheduled_reports` - Расписание
- `daily_summaries` - Z-отчёты

---

## 🔧 ВОЗМОЖНОСТИ:

### **✅ Складской учёт FEFO:**
```sql
-- Автоматический выбор товара по сроку годности
SELECT * FROM warehouse_inventory 
WHERE product_id = '...' 
  AND status = 'available'
  AND expiry_date > CURRENT_DATE
ORDER BY expiry_date ASC  -- First Expired, First Out
LIMIT 1;
```

### **✅ GPS трекинг курьеров:**
```sql
-- Последнее местоположение курьера
SELECT * FROM courier_locations 
WHERE courier_id = '...'
ORDER BY recorded_at DESC 
LIMIT 1;
```

### **✅ Контроль маркировки (Честный знак):**
```sql
-- Проверка статуса марки
SELECT * FROM honest_sign_marks 
WHERE sgtin = 'код_марки'
  AND status = 'available';
```

### **✅ Синхронизация с 1С:**
```sql
-- Логи синхронизации
SELECT * FROM erp_sync_log 
WHERE entity_type = 'products'
  AND status = 'failed';
```

### **✅ Z-отчёт за день:**
```sql
-- Дневная сводка
SELECT * FROM daily_summaries 
WHERE business_date = CURRENT_DATE;
```

---

## 📋 ТЕСТОВЫЕ ДАННЫЕ:

После запуска создаются:
- ✅ Администратор: `admin` / `admin123`
- ✅ Главный склад: `MAIN001`
- ✅ 2 курьера (Иван, Пётр)
- ✅ Инициализированный Z-отчёт на сегодня

---

## 🔄 ИНТЕГРАЦИИ:

### **ЕГАИС (Алкоголь):**
```javascript
// Создание накладной
await db('egais_documents').insert({
  document_type: 'WayBill',
  document_number: 'TTN-001',
  document_date: new Date(),
  status: 'draft',
  document_data: { /* XML данные */ }
});
```

### **Меркурий (Ветконтроль):**
```javascript
// Регистрация ВСД
await db('mercury_documents').insert({
  document_type: 'VSD',
  vsd_number: 'ВСД-123456',
  product_id: '...',
  issue_date: new Date(),
  status: 'active'
});
```

### **Честный знак:**
```javascript
// Регистрация марки
await db('honest_sign_marks').insert({
  product_id: '...',
  gtin: '1234567890123',
  sgtin: '01234567890123...',
  status: 'available'
});
```

### **1С:**
```javascript
// Синхронизация товара
await db('erp_sync_log').insert({
  erp_system: '1c',
  entity_type: 'products',
  entity_id: '...',
  operation: 'sync',
  direction: 'to_erp',
  status: 'pending'
});
```

---

## 🎯 ЧТО ДАЛЬШЕ:

### **1. Интеграция с кодом:**
Создать API endpoints для работы с новыми таблицами:
- `/api/warehouse/*` - Складские операции
- `/api/couriers/*` - Управление курьерами
- `/api/kds/*` - Kitchen Display System
- `/api/reports/*` - Генерация отчётов

### **2. Фоновые задачи:**
- Проверка сроков годности (expiry_alerts)
- Синхронизация с 1С
- Отправка данных в ЕГАИС/Меркурий
- GPS трекинг курьеров

### **3. WebSocket для реального времени:**
- Обновления KDS
- Местоположение курьеров
- Статусы заказов

---

## ⚠️ ВАЖНО:

### **Для production:**
1. Замени SQLite на PostgreSQL
2. Настрой индексы для производительности
3. Добавь backup-стратегию
4. Настрой репликацию

### **Для интеграций:**
1. Получи API ключи от провайдеров
2. Настрой сертификаты (ЭЦП для ЕГАИС/ЭДО)
3. Пройди тестирование в песочницах

---

## 🎉 ИТОГО:

✅ **28 таблиц** - Полная структура БД  
✅ **FEFO** - Контроль сроков годности  
✅ **GPS трекинг** - Курьеры в реальном времени  
✅ **ЕГАИС/Меркурий/Честный знак** - Готовы к интеграции  
✅ **1С синхронизация** - Логирование операций  
✅ **KDS** - Kitchen Display System  
✅ **Отчёты** - Z-отчёты и аналитика  

**БАЗА ДАННЫХ ГОТОВА ДЛЯ РЕАЛЬНОГО РЕСТОРАНА! 🍕🚀**

---

**Файлы:**
- `backend/database/migrations/010_create_warehouse_tables.js`
- `backend/database/migrations/011_create_couriers_tables.js`
- `backend/database/migrations/012_create_integrations_tables.js`
- `backend/database/migrations/013_create_reports_tables.js`
- `backend/setup-full-database.js`

**Запуск:** `cd backend && node setup-full-database.js`
