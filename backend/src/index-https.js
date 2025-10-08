/**
 * DANDY PIZZA - HTTPS СЕРВЕР
 * Безопасный сервер с SSL/TLS шифрованием
 */

const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Порты
const HTTP_PORT = 3000;
const HTTPS_PORT = 3443;

// ===== MIDDLEWARE =====

// Безопасность
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https:", "http:"],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Rate limiting - защита от DDoS
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов с одного IP
    message: 'Слишком много запросов с этого IP, попробуйте позже'
});

app.use('/api/', limiter);

// CORS
app.use(cors({
    origin: ['http://localhost:3000', 'https://localhost:3443'],
    credentials: true
}));

// Парсинг JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ===== СТАТИЧЕСКИЕ ФАЙЛЫ =====

const publicPath = path.join(__dirname, '../../');
app.use(express.static(publicPath));

// ===== БАЗА ДАННЫХ =====

const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '../dandy_pizza.db');
const db = new sqlite3.Database(dbPath);

console.log('💾 База данных подключена:', dbPath);

// ===== API ENDPOINTS =====

// Здоровье сервера
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        ssl: true,
        secure: req.secure
    });
});

// Получить все заказы
app.get('/api/orders', (req, res) => {
    db.all('SELECT * FROM orders ORDER BY created_at DESC', (err, orders) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Для каждого заказа получаем позиции
        const promises = orders.map(order => {
            return new Promise((resolve) => {
                db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id], (err, items) => {
                    order.items = items || [];
                    resolve(order);
                });
            });
        });

        Promise.all(promises).then(ordersWithItems => {
            res.json({ success: true, data: ordersWithItems });
        });
    });
});

// Получить заказ по ID
app.get('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    
    db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, order) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!order) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        db.all('SELECT * FROM order_items WHERE order_id = ?', [orderId], (err, items) => {
            order.items = items || [];
            res.json({ success: true, data: order });
        });
    });
});

// Создать заказ
app.post('/api/orders', (req, res) => {
    const order = req.body;
    const orderId = order.id || `ORD-${Date.now()}`;

    const sql = `INSERT INTO orders (id, customer_name, customer_phone, customer_email, 
                 address, apartment, delivery_type, payment_method, status, total, 
                 order_comment, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        orderId,
        order.customerName,
        order.customerPhone,
        order.customerEmail || null,
        order.address || null,
        order.apartment || null,
        order.deliveryType,
        order.paymentMethod,
        'pending',
        order.total,
        order.comment || null,
        new Date().toISOString()
    ];

    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Добавляем позиции заказа
        if (order.items && order.items.length > 0) {
            const itemSql = `INSERT INTO order_items (order_id, product_id, product_name, 
                            product_price, quantity, extras, total) 
                            VALUES (?, ?, ?, ?, ?, ?, ?)`;

            order.items.forEach(item => {
                db.run(itemSql, [
                    orderId,
                    item.id,
                    item.name,
                    item.price,
                    item.quantity || 1,
                    JSON.stringify(item.extras || []),
                    item.total || (item.price * (item.quantity || 1))
                ]);
            });
        }

        res.json({ 
            success: true, 
            data: { id: orderId } 
        });
    });
});

// Обновить статус заказа
app.put('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    const sql = `UPDATE orders SET status = ?, updated_at = ? WHERE id = ?`;

    db.run(sql, [status, new Date().toISOString(), orderId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ success: true, message: 'Статус обновлён' });
    });
});

// ===== ПЕРЕНАПРАВЛЕНИЕ HTTP -> HTTPS =====

const httpApp = express();
httpApp.use((req, res) => {
    res.redirect(301, `https://${req.headers.host.replace(':3000', ':3443')}${req.url}`);
});

// ===== ЗАПУСК СЕРВЕРОВ =====

// HTTP сервер (только для перенаправления)
const httpServer = http.createServer(httpApp);

// HTTPS сервер
let httpsServer;

try {
    // Пути к SSL сертификатам
    const sslKeyPath = path.join(__dirname, '../ssl/server.key');
    const sslCertPath = path.join(__dirname, '../ssl/server.cert');

    // Проверяем наличие сертификатов
    if (!fs.existsSync(sslKeyPath) || !fs.existsSync(sslCertPath)) {
        console.log('\n⚠️  SSL сертификаты не найдены!');
        console.log('📝 Запустите: node generate-ssl-cert.js');
        console.log('\n🔧 Запускаем только HTTP сервер...\n');
        
        // Запускаем только HTTP
        const simpleHttpServer = http.createServer(app);
        simpleHttpServer.listen(HTTP_PORT, () => {
            console.log(`🌐 HTTP сервер запущен: http://localhost:${HTTP_PORT}`);
            console.log(`📝 Для HTTPS создайте SSL сертификат!`);
        });
    } else {
        // SSL опции
        const sslOptions = {
            key: fs.readFileSync(sslKeyPath),
            cert: fs.readFileSync(sslCertPath)
        };

        // Создаём HTTPS сервер
        httpsServer = https.createServer(sslOptions, app);

        // Запускаем оба сервера
        httpServer.listen(HTTP_PORT, () => {
            console.log(`🌐 HTTP сервер (redirect): http://localhost:${HTTP_PORT}`);
        });

        httpsServer.listen(HTTPS_PORT, () => {
            console.log(`🔐 HTTPS сервер запущен: https://localhost:${HTTPS_PORT}`);
            console.log(`✅ SSL/TLS шифрование включено`);
            console.log(`\n📱 Откройте в браузере:`);
            console.log(`   - Админка: https://localhost:${HTTPS_PORT}/admin.html`);
            console.log(`   - POS:     https://localhost:${HTTPS_PORT}/pos.html`);
            console.log(`   - Сайт:    https://localhost:${HTTPS_PORT}/index.html`);
            console.log(`\n⚠️  Браузер покажет предупреждение (самоподписанный сертификат)`);
            console.log(`   Это нормально для локальной разработки!`);
        });
    }
} catch (error) {
    console.error('❌ Ошибка запуска HTTPS сервера:', error);
    console.log('\n🔧 Запускаем только HTTP сервер...\n');
    
    const simpleHttpServer = http.createServer(app);
    simpleHttpServer.listen(HTTP_PORT, () => {
        console.log(`🌐 HTTP сервер запущен: http://localhost:${HTTP_PORT}`);
    });
}

// Обработка ошибок
process.on('uncaughtException', (err) => {
    console.error('❌ Необработанное исключение:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Необработанный reject:', err);
});
