const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Тестовые данные
const courier = {
    id: 1,
    username: 'courier1',
    password: '123',
    role: 'courier',
    name: 'Анна Курьерова',
    email: 'courier@dandy.ru',
    phone: '+7 (999) 123-45-67',
    status: 'active'
};

const orders = [
    {
        id: 1,
        order_number: 'ORD-001',
        customer_name: 'Иван Петров',
        customer_phone: '+7 (999) 123-45-67',
        customer_email: 'ivan@example.com',
        total_amount: 850,
        subtotal: 800,
        tax_amount: 50,
        delivery_fee: 0,
        status: 'pending',
        payment_method: 'card',
        payment_status: 'paid',
        created_at: new Date().toISOString(),
        estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        delivery_address: {
            address: 'ул. Ленина, д. 10, кв. 5',
            coordinates: { latitude: 55.7558, longitude: 37.6176 },
            notes: 'Домофон не работает, звонить на мобильный'
        },
        items: [
            { product_name: 'Пепперони', product_sku: 'PIZZA-001', quantity: 1, unit_price: 399, total_price: 399 },
            { product_name: 'Кока-Кола', product_sku: 'DRINK-001', quantity: 2, unit_price: 89, total_price: 178 }
        ],
        notes: 'Острый соус отдельно'
    },
    {
        id: 2,
        order_number: 'ORD-002',
        customer_name: 'Мария Сидорова',
        customer_phone: '+7 (999) 234-56-78',
        customer_email: 'maria@example.com',
        total_amount: 1200,
        subtotal: 1100,
        tax_amount: 100,
        delivery_fee: 0,
        status: 'confirmed',
        payment_method: 'cash',
        payment_status: 'pending',
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        estimated_delivery: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        delivery_address: {
            address: 'пр. Мира, д. 25, кв. 12',
            coordinates: { latitude: 55.7658, longitude: 37.6276 },
            notes: 'Код домофона: 1234'
        },
        items: [
            { product_name: 'Маргарита', product_sku: 'PIZZA-002', quantity: 1, unit_price: 349, total_price: 349 },
            { product_name: 'Филадельфия', product_sku: 'ROLL-001', quantity: 1, unit_price: 459, total_price: 459 },
            { product_name: 'Калифорния', product_sku: 'ROLL-002', quantity: 1, unit_price: 389, total_price: 389 }
        ],
        notes: 'Без лука'
    },
    {
        id: 3,
        order_number: 'ORD-003',
        customer_name: 'Алексей Иванов',
        customer_phone: '+7 (999) 345-67-89',
        customer_email: 'alex@example.com',
        total_amount: 650,
        subtotal: 600,
        tax_amount: 50,
        delivery_fee: 0,
        status: 'ready',
        payment_method: 'card',
        payment_status: 'paid',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        estimated_delivery: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        delivery_address: {
            address: 'ул. Пушкина, д. 5, кв. 8',
            coordinates: { latitude: 55.7458, longitude: 37.6076 },
            notes: 'Подъезд 2, этаж 3'
        },
        items: [
            { product_name: 'Калифорния', product_sku: 'ROLL-002', quantity: 1, unit_price: 389, total_price: 389 },
            { product_name: 'Кока-Кола', product_sku: 'DRINK-001', quantity: 1, unit_price: 89, total_price: 89 }
        ],
        notes: 'Срочная доставка'
    }
];

// Routes
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'DANDY Courier API',
        version: '1.0.0'
    });
});

// Аутентификация
app.post('/api/v1/users/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === courier.username && password === courier.password) {
        const token = 'mock_jwt_token_' + Date.now();
        res.json({
            success: true,
            data: {
                user: {
                    id: courier.id,
                    username: courier.username,
                    role: courier.role,
                    name: courier.name,
                    email: courier.email,
                    phone: courier.phone,
                    status: courier.status
                },
                token: token
            }
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Неверные учетные данные'
        });
    }
});

// Получение заказов
app.get('/api/v1/orders', (req, res) => {
    const { status } = req.query;
    let filteredOrders = orders;
    
    if (status) {
        filteredOrders = orders.filter(order => order.status === status);
    }
    
    res.json({
        success: true,
        data: filteredOrders,
        count: filteredOrders.length
    });
});

// Получение заказа по ID
app.get('/api/v1/orders/:id', (req, res) => {
    const orderId = parseInt(req.params.id);
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        res.json({
            success: true,
            data: order
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Заказ не найден'
        });
    }
});

// Обновление статуса заказа
app.patch('/api/v1/orders/:id/status', (req, res) => {
    const orderId = parseInt(req.params.id);
    const { status, notes } = req.body;
    
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        if (notes) {
            order.notes = notes;
        }
        order.updated_at = new Date().toISOString();
        
        res.json({
            success: true,
            data: order
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Заказ не найден'
        });
    }
});

// Статистика курьера
app.get('/api/v1/orders/stats', (req, res) => {
    const stats = {
        total_orders: orders.length,
        completed_orders: orders.filter(o => o.status === 'delivered').length,
        pending_orders: orders.filter(o => o.status === 'pending').length,
        total_earnings: orders
            .filter(o => o.status === 'delivered')
            .reduce((sum, o) => sum + o.total_amount, 0),
        average_order_value: orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length
    };
    
    res.json({
        success: true,
        data: stats
    });
});

// Профиль пользователя
app.get('/api/v1/users/me', (req, res) => {
    res.json({
        success: true,
        data: courier
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Эндпоинт не найден'
    });
});

app.listen(PORT, () => {
    console.log('🚚 DANDY Courier API Server запущен!');
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Login: POST http://localhost:${PORT}/api/v1/users/login`);
    console.log(`📦 Orders: GET http://localhost:${PORT}/api/v1/orders`);
    console.log(`📈 Stats: GET http://localhost:${PORT}/api/v1/orders/stats`);
    console.log('\n👤 Тестовый пользователь:');
    console.log('   Username: courier1');
    console.log('   Password: 123');
    console.log('   Role: courier');
    console.log('\n📱 Готово для тестирования мобильного приложения!');
});
