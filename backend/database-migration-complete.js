/**
 * ПОЛНАЯ МИГРАЦИЯ С LOCALSTORAGE НА POSTGRESQL/SQLITE
 * Скрипт для переноса всех данных из localStorage в реальную БД
 */

const fs = require('fs');
const path = require('path');

class DatabaseMigration {
    constructor(dbType = 'sqlite') {
        this.dbType = dbType; // 'sqlite' или 'postgresql'
        this.db = null;
        this.backupDir = path.join(__dirname, 'backups');
        this.ensureBackupDir();
    }

    ensureBackupDir() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    async connect() {
        if (this.dbType === 'sqlite') {
            const sqlite3 = require('sqlite3').verbose();
            this.db = new sqlite3.Database('./database.sqlite');
            console.log('✅ Подключено к SQLite');
        } else {
            const { Pool } = require('pg');
            this.db = new Pool({
                user: process.env.DB_USER || 'postgres',
                host: process.env.DB_HOST || 'localhost',
                database: process.env.DB_NAME || 'dandy_pizza',
                password: process.env.DB_PASSWORD || 'password',
                port: process.env.DB_PORT || 5432,
            });
            console.log('✅ Подключено к PostgreSQL');
        }
    }

    // ===== СОЗДАНИЕ ТАБЛИЦ =====
    
    async createTables() {
        console.log('📊 Создание таблиц...');
        
        const tables = [
            // Пользователи
            `CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                name TEXT,
                email TEXT,
                phone TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME
            )`,
            
            // Категории
            `CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                name_en TEXT,
                sort_order INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                icon TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Товары
            `CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                category_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                vat INTEGER DEFAULT 20,
                photo TEXT,
                is_active BOOLEAN DEFAULT 1,
                stock INTEGER DEFAULT 0,
                unit TEXT DEFAULT 'шт',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )`,
            
            // Заказы
            `CREATE TABLE IF NOT EXISTS orders (
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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Позиции заказа
            `CREATE TABLE IF NOT EXISTS order_items (
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
            )`,
            
            // Смены
            `CREATE TABLE IF NOT EXISTS shifts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                shift_number INTEGER NOT NULL,
                cashier_name TEXT NOT NULL,
                cashier_id TEXT NOT NULL,
                opened_at DATETIME NOT NULL,
                closed_at DATETIME,
                receipts_count INTEGER DEFAULT 0,
                total_cash REAL DEFAULT 0,
                total_card REAL DEFAULT 0,
                total_sbp REAL DEFAULT 0,
                fiscal_document TEXT,
                status TEXT DEFAULT 'open',
                FOREIGN KEY (cashier_id) REFERENCES users(id)
            )`,
            
            // Фискальные чеки
            `CREATE TABLE IF NOT EXISTS fiscal_receipts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL,
                shift_id INTEGER NOT NULL,
                receipt_number INTEGER NOT NULL,
                fiscal_document TEXT NOT NULL,
                fiscal_sign TEXT NOT NULL,
                fiscal_datetime DATETIME NOT NULL,
                qr_code TEXT,
                amount REAL NOT NULL,
                payment_type TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (shift_id) REFERENCES shifts(id)
            )`,
            
            // Склад
            `CREATE TABLE IF NOT EXISTS warehouse (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id TEXT NOT NULL,
                product_name TEXT NOT NULL,
                quantity REAL NOT NULL,
                unit TEXT NOT NULL,
                min_quantity REAL DEFAULT 0,
                expiry_date DATE,
                supplier TEXT,
                purchase_price REAL,
                batch_number TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id)
            )`,
            
            // Курьеры
            `CREATE TABLE IF NOT EXISTS couriers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT,
                rating REAL DEFAULT 5.0,
                status TEXT DEFAULT 'offline',
                latitude REAL,
                longitude REAL,
                last_location_update DATETIME,
                orders_completed INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const sql of tables) {
            await this.query(sql);
        }
        
        console.log('✅ Таблицы созданы');
    }

    // ===== МИГРАЦИЯ ДАННЫХ ИЗ LOCALSTORAGE =====
    
    async migrateFromLocalStorage(localStorageData) {
        console.log('🔄 Начало миграции данных из localStorage...');
        
        try {
            // Мигрируем пользователей
            if (localStorageData.users) {
                await this.migrateUsers(localStorageData.users);
            }
            
            // Мигрируем категории и товары
            if (localStorageData.categories) {
                await this.migrateCategories(localStorageData.categories);
            }
            if (localStorageData.products) {
                await this.migrateProducts(localStorageData.products);
            }
            
            // Мигрируем заказы
            if (localStorageData.orders) {
                await this.migrateOrders(localStorageData.orders);
            }
            
            // Мигрируем курьеров
            if (localStorageData.couriers) {
                await this.migrateCouriers(localStorageData.couriers);
            }
            
            console.log('✅ Миграция завершена успешно!');
        } catch (error) {
            console.error('❌ Ошибка миграции:', error);
            throw error;
        }
    }

    async migrateUsers(users) {
        console.log('👥 Миграция пользователей...');
        for (const user of users) {
            await this.query(
                `INSERT OR REPLACE INTO users (id, username, password, role, name, email, phone, is_active, created_at, last_login)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [user.id, user.username, user.password, user.role, user.name, user.email, user.phone, 
                 user.isActive ? 1 : 0, user.createdAt, user.lastLogin]
            );
        }
        console.log(`✅ Мигрировано пользователей: ${users.length}`);
    }

    async migrateCategories(categories) {
        console.log('📂 Миграция категорий...');
        for (const cat of categories) {
            await this.query(
                `INSERT OR REPLACE INTO categories (id, name, name_en, sort_order, is_active, icon, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [cat.id, cat.name, cat.nameEn, cat.sortOrder || 0, 1, cat.icon, new Date().toISOString()]
            );
        }
        console.log(`✅ Мигрировано категорий: ${categories.length}`);
    }

    async migrateProducts(products) {
        console.log('🍕 Миграция товаров...');
        for (const prod of products) {
            await this.query(
                `INSERT OR REPLACE INTO products (id, category_id, name, description, price, vat, photo, is_active, stock, unit, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [prod.id, prod.categoryId, prod.name, prod.description, prod.price, prod.vat || 20,
                 prod.photo, 1, prod.stock || 0, 'шт', new Date().toISOString()]
            );
        }
        console.log(`✅ Мигрировано товаров: ${products.length}`);
    }

    async migrateOrders(orders) {
        console.log('📦 Миграция заказов...');
        for (const order of orders) {
            // Вставляем заказ
            await this.query(
                `INSERT OR REPLACE INTO orders (id, customer_name, customer_phone, customer_email, address, 
                 apartment, delivery_type, payment_method, status, total, order_comment, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [order.id, order.customerName, order.customerPhone, order.customerEmail, order.address,
                 order.apartment, order.deliveryType, order.paymentMethod, order.status, order.total,
                 order.comment, order.createdAt || new Date().toISOString()]
            );
            
            // Вставляем позиции заказа
            if (order.items && order.items.length > 0) {
                for (const item of order.items) {
                    await this.query(
                        `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, extras, total)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [order.id, item.id, item.name, item.price, item.quantity || 1,
                         JSON.stringify(item.extras || []), item.total || (item.price * (item.quantity || 1))]
                    );
                }
            }
        }
        console.log(`✅ Мигрировано заказов: ${orders.length}`);
    }

    async migrateCouriers(couriers) {
        console.log('🚴 Миграция курьеров...');
        for (const courier of couriers) {
            await this.query(
                `INSERT OR REPLACE INTO couriers (id, name, phone, email, rating, status, orders_completed, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [courier.id, courier.name, courier.phone, courier.email, courier.rating || 5.0,
                 courier.status || 'offline', courier.ordersCompleted || 0, new Date().toISOString()]
            );
        }
        console.log(`✅ Мигрировано курьеров: ${couriers.length}`);
    }

    // ===== БЭКАПЫ =====
    
    async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(this.backupDir, `backup-${timestamp}.sql`);
        
        console.log('💾 Создание бэкапа...');
        
        // Экспорт всей БД
        const tables = ['users', 'categories', 'products', 'orders', 'order_items', 
                       'shifts', 'fiscal_receipts', 'warehouse', 'couriers'];
        
        let backup = '-- DANDY PIZZA DATABASE BACKUP\n';
        backup += `-- Date: ${new Date().toISOString()}\n\n`;
        
        for (const table of tables) {
            const rows = await this.query(`SELECT * FROM ${table}`);
            backup += `\n-- Table: ${table}\n`;
            backup += `DELETE FROM ${table};\n`;
            
            for (const row of rows) {
                const columns = Object.keys(row).join(', ');
                const values = Object.values(row).map(v => 
                    typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v
                ).join(', ');
                backup += `INSERT INTO ${table} (${columns}) VALUES (${values});\n`;
            }
        }
        
        fs.writeFileSync(backupFile, backup);
        console.log(`✅ Бэкап создан: ${backupFile}`);
        
        return backupFile;
    }

    async restoreBackup(backupFile) {
        console.log('📂 Восстановление из бэкапа...');
        
        const sql = fs.readFileSync(backupFile, 'utf8');
        const statements = sql.split(';').filter(s => s.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                await this.query(statement);
            }
        }
        
        console.log('✅ Бэкап восстановлен');
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
    
    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (this.dbType === 'sqlite') {
                if (sql.includes('INSERT') || sql.includes('UPDATE') || sql.includes('DELETE')) {
                    this.db.run(sql, params, function(err) {
                        if (err) reject(err);
                        else resolve({ lastID: this.lastID, changes: this.changes });
                    });
                } else {
                    this.db.all(sql, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                }
            } else {
                this.db.query(sql, params)
                    .then(result => resolve(result.rows))
                    .catch(reject);
            }
        });
    }

    async close() {
        if (this.dbType === 'sqlite') {
            this.db.close();
        } else {
            await this.db.end();
        }
        console.log('✅ Соединение закрыто');
    }
}

// ===== ЗАПУСК МИГРАЦИИ =====

async function runMigration() {
    const migration = new DatabaseMigration('sqlite'); // или 'postgresql'
    
    try {
        await migration.connect();
        await migration.createTables();
        
        // Пример данных из localStorage (замените на реальные)
        const localStorageData = {
            users: JSON.parse(localStorage.getItem('users') || '[]'),
            categories: JSON.parse(localStorage.getItem('categories') || '[]'),
            products: JSON.parse(localStorage.getItem('products') || '[]'),
            orders: JSON.parse(localStorage.getItem('orders') || '[]'),
            couriers: JSON.parse(localStorage.getItem('couriers') || '[]')
        };
        
        await migration.migrateFromLocalStorage(localStorageData);
        await migration.createBackup();
        
        console.log('🎉 Миграция завершена успешно!');
    } catch (error) {
        console.error('❌ Ошибка:', error);
    } finally {
        await migration.close();
    }
}

// Экспорт
module.exports = DatabaseMigration;

// Если запускается напрямую
if (require.main === module) {
    runMigration();
}
