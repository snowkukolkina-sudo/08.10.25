/**
 * Демо-данные для тестирования POS системы
 * Заменяет реальные API вызовы на локальные данные
 */

// Демо товары
const DEMO_PRODUCTS = [
    {
        id: "pizza_margherita",
        name: "Пицца Маргарита",
        price: 450,
        category: "Пицца",
        vat: 20,
        stock: 10,
        description: "Томатный соус, моцарелла, базилик"
    },
    {
        id: "roll_california",
        name: "Ролл Калифорния",
        price: 380,
        category: "Роллы",
        vat: 20,
        stock: 15,
        description: "Краб, авокадо, огурец, икра"
    },
    {
        id: "salad_caesar",
        name: "Салат Цезарь",
        price: 320,
        category: "Салаты",
        vat: 20,
        stock: 8,
        description: "Курица, салат, сухарики, соус цезарь"
    },
    {
        id: "drink_cola",
        name: "Кока-Кола",
        price: 120,
        category: "Напитки",
        vat: 20,
        stock: 50,
        description: "Газированный напиток 0.5л"
    }
];

// Демо заказы
const DEMO_ORDERS = [
    {
        id: "ORD_001",
        type: "delivery",
        status: "pending",
        createdAt: new Date().toISOString(),
        customer: {
            name: "Иван Петров",
            phone: "+7 (999) 123-45-67",
            address: "ул. Ленина, д. 10, кв. 5"
        },
        items: [
            { id: "pizza_margherita", name: "Пицца Маргарита", quantity: 1, price: 450, sum: 450 },
            { id: "drink_cola", name: "Кока-Кола", quantity: 2, price: 120, sum: 240 }
        ],
        total: 690,
        delivery: {
            price: 200,
            zone: { name: "Центр", radius: 2 }
        }
    },
    {
        id: "ORD_002",
        type: "pickup",
        status: "ready",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        customer: {
            name: "Мария Сидорова",
            phone: "+7 (999) 987-65-43"
        },
        items: [
            { id: "roll_california", name: "Ролл Калифорния", quantity: 2, price: 380, sum: 760 }
        ],
        total: 760,
        pickup: {
            time: new Date(Date.now() + 1800000).toISOString()
        }
    }
];

// Демо пользователи (с правильными хешами паролей)
const DEMO_USERS = [
    {
        id: "admin_1",
        username: "admin",
        password: btoa("admin123" + "salt_dandy_2024"), // Хеш для admin123
        role: "admin",
        name: "Администратор",
        email: "admin@dandy.ru",
        phone: "+7 (999) 123-45-67",
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: null
    },
    {
        id: "cashier_1",
        username: "cashier1",
        password: btoa("cashier123" + "salt_dandy_2024"), // Хеш для cashier123
        role: "cashier",
        name: "Кассир 1",
        email: "cashier1@dandy.ru",
        phone: "+7 (999) 123-45-68",
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: null
    }
];

// Демо зоны доставки
const DEMO_DELIVERY_ZONES = [
    {
        id: "zone_1",
        name: "Немчиновка центр",
        radius: 2,
        deliveryPrice: 0,
        freeDeliveryThreshold: 1000,
        deliveryTime: 30,
        coordinates: { lat: 55.7558, lng: 37.6176 }
    },
    {
        id: "zone_2",
        name: "Немчиновка окраина",
        radius: 5,
        deliveryPrice: 200,
        freeDeliveryThreshold: 1500,
        deliveryTime: 45,
        coordinates: { lat: 55.7558, lng: 37.6176 }
    }
];

// Инициализация демо-данных
function initializeDemoData() {
    // Сохраняем демо товары
    localStorage.setItem('products', JSON.stringify(DEMO_PRODUCTS));
    
    // Сохраняем демо заказы
    localStorage.setItem('deliveryOrders', JSON.stringify(DEMO_ORDERS));
    
    // Сохраняем демо пользователей только если их нет
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (existingUsers.length === 0) {
        localStorage.setItem('users', JSON.stringify(DEMO_USERS));
    }
    
    // Сохраняем демо зоны доставки
    localStorage.setItem('deliveryZones', JSON.stringify(DEMO_DELIVERY_ZONES));
    
    console.log('Демо-данные инициализированы');
}

// Экспорт для использования в других модулях
window.DEMO_DATA = {
    products: DEMO_PRODUCTS,
    orders: DEMO_ORDERS,
    users: DEMO_USERS,
    deliveryZones: DEMO_DELIVERY_ZONES,
    initialize: initializeDemoData
};
