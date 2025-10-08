/**
 * БЫСТРАЯ НАСТРОЙКА БД ДЛЯ DANDY PIZZA
 * Создаёт SQLite базу данных и все таблицы
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Путь к БД
const dbPath = path.join(__dirname, 'dandy_pizza.db');

console.log('🚀 Начинаем настройку базы данных...');
console.log('📁 Путь к БД:', dbPath);

// Создаём подключение
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Ошибка подключения к БД:', err);
        process.exit(1);
    }
    console.log('✅ Подключено к SQLite');
});

// SQL для создания всех таблиц
const createTableSQL = `
-- 1. ПОЛЬЗОВАТЕЛИ
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_login TEXT
);

-- 2. КАТЕГОРИИ
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    icon TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. ТОВАРЫ
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    vat INTEGER DEFAULT 20,
    photo TEXT,
    is_active INTEGER DEFAULT 1,
    stock INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'шт',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 4. ЗАКАЗЫ
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    address TEXT,
    apartment TEXT,
    entrance TEXT,
    floor TEXT,
    intercom TEXT,
    address_comment TEXT,
    order_comment TEXT,
    delivery_type TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    total REAL NOT NULL,
    delivery_cost REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    promo_code TEXT,
    fiscal_document TEXT,
    receipt_number TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 5. ПОЗИЦИИ ЗАКАЗА
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_price REAL NOT NULL,
    quantity INTEGER DEFAULT 1,
    extras TEXT,
    total REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 6. СМЕНЫ
CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shift_number INTEGER NOT NULL,
    cashier_name TEXT NOT NULL,
    cashier_id TEXT NOT NULL,
    opened_at TEXT NOT NULL,
    closed_at TEXT,
    receipts_count INTEGER DEFAULT 0,
    total_cash REAL DEFAULT 0,
    total_card REAL DEFAULT 0,
    total_sbp REAL DEFAULT 0,
    fiscal_document TEXT,
    status TEXT DEFAULT 'open',
    FOREIGN KEY (cashier_id) REFERENCES users(id)
);

-- 7. ФИСКАЛЬНЫЕ ЧЕКИ
CREATE TABLE IF NOT EXISTS fiscal_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    shift_id INTEGER NOT NULL,
    receipt_number INTEGER NOT NULL,
    fiscal_document TEXT NOT NULL,
    fiscal_sign TEXT NOT NULL,
    fiscal_datetime TEXT NOT NULL,
    qr_code TEXT,
    amount REAL NOT NULL,
    payment_type TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

-- 8. СКЛАД
CREATE TABLE IF NOT EXISTS warehouse (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    min_quantity REAL DEFAULT 0,
    expiry_date TEXT,
    supplier TEXT,
    purchase_price REAL,
    batch_number TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 9. КУРЬЕРЫ
CREATE TABLE IF NOT EXISTS couriers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    rating REAL DEFAULT 5.0,
    status TEXT DEFAULT 'offline',
    latitude REAL,
    longitude REAL,
    last_location_update TEXT,
    orders_completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 10. КЛИЕНТЫ (для системы лояльности)
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    birthday TEXT,
    bonuses INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    level TEXT DEFAULT 'Новичок',
    discount REAL DEFAULT 0,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    registered_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 11. ПРОМОКОДЫ
CREATE TABLE IF NOT EXISTS promo_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL,
    min_order_amount REAL DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TEXT,
    valid_until TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

// Функция создания таблиц
function createTables() {
    return new Promise((resolve, reject) => {
        db.exec(createTableSQL, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Функция добавления тестовых данных
function insertTestData() {
    return new Promise((resolve, reject) => {
        const testDataSQL = `
        -- Тестовый админ
        INSERT OR IGNORE INTO users (id, username, password, role, name, email, phone)
        VALUES ('admin_1', 'admin', 'admin123', 'admin', 'Администратор', 'admin@dandy.ru', '+7 (999) 123-45-67');

        -- Тестовый кассир
        INSERT OR IGNORE INTO users (id, username, password, role, name)
        VALUES ('cashier_1', 'cashier1', 'cashier123', 'cashier', 'Кассир Иван');

        -- Тестовые категории
        INSERT OR IGNORE INTO categories (id, name, name_en, sort_order)
        VALUES 
            ('pizza', 'Пицца', 'Pizza', 1),
            ('rolls', 'Роллы', 'Rolls', 2),
            ('drinks', 'Напитки', 'Drinks', 3),
            ('desserts', 'Десерты', 'Desserts', 4);

        -- Тестовые товары
        INSERT OR IGNORE INTO products (id, category_id, name, price, photo)
        VALUES 
            ('pizza-margarita', 'pizza', 'Пицца Маргарита', 399, '/assets/pizza.jpg'),
            ('pizza-pepperoni', 'pizza', 'Пицца Пепперони', 499, '/assets/pizza.jpg'),
            ('roll-philadelphia', 'rolls', 'Ролл Филадельфия', 450, '/assets/roll.jpg'),
            ('roll-california', 'rolls', 'Ролл Калифорния', 420, '/assets/roll.jpg');

        -- Тестовый курьер
        INSERT OR IGNORE INTO couriers (id, name, phone, rating)
        VALUES 
            ('courier_1', 'Алексей', '+7 (999) 111-11-11', 4.8),
            ('courier_2', 'Дмитрий', '+7 (999) 222-22-22', 4.9);
        `;

        db.exec(testDataSQL, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Основная функция
async function setup() {
    try {
        console.log('\n📊 Создание таблиц...');
        await createTables();
        console.log('✅ Таблицы созданы успешно!');

        console.log('\n📝 Добавление тестовых данных...');
        await insertTestData();
        console.log('✅ Тестовые данные добавлены!');

        console.log('\n🎉 База данных настроена успешно!');
        console.log('\n📋 Создано таблиц: 11');
        console.log('   - users (пользователи)');
        console.log('   - categories (категории)');
        console.log('   - products (товары)');
        console.log('   - orders (заказы)');
        console.log('   - order_items (позиции заказа)');
        console.log('   - shifts (смены)');
        console.log('   - fiscal_receipts (чеки)');
        console.log('   - warehouse (склад)');
        console.log('   - couriers (курьеры)');
        console.log('   - customers (клиенты/лояльность)');
        console.log('   - promo_codes (промокоды)');

        console.log('\n👤 Тестовые пользователи:');
        console.log('   Админ: admin / admin123');
        console.log('   Кассир: cashier1 / cashier123');

        console.log('\n✅ Готово! Можно запускать сервер!');
        
    } catch (error) {
        console.error('\n❌ Ошибка настройки БД:', error);
    } finally {
        db.close();
    }
}

// Запуск
setup();
