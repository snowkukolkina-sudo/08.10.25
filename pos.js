/**
 * DANDY POS — Full Prototype (all‑in‑one)
 * Касса + эквайринг (интегр./переносной/внешний) + СБП + доставка + агрегаторы + мульти‑принтеры кухни
 * + ЕГАИС (бутылочное/разливное) + Честный ЗНАК + интеграции (Контур.Касса/Маркет, Гайнап, 1С, все ОФД)
 * Адаптировано из React в vanilla JavaScript
 */

// ===== Категории =====
const CATEGORIES = [
    { id: "pizza25", name: "Пицца 25 см", color: "bg-rose-100", station: "hot" },
    { id: "pizza33", name: "Пицца 33 см", color: "bg-amber-100", station: "hot" },
    { id: "pizza42", name: "Пицца 42 см", color: "bg-teal-100", station: "hot" },
    { id: "rollsStd", name: "Роллы стандарт", color: "bg-cyan-100", station: "cold" },
    { id: "rollsG", name: "Роллы гигант", color: "bg-indigo-100", station: "cold" },
    { id: "salads", name: "Салаты", color: "bg-lime-100", station: "cold" },
    { id: "drinks", name: "Напитки", color: "bg-blue-100", station: "bar" },
    { id: "snacks", name: "Закуски", color: "bg-orange-100", station: "hot" },
    { id: "beer", name: "Пиво бутылочное", color: "bg-yellow-100", station: "bar" },
    { id: "beerDraft", name: "Пиво разливное", color: "bg-orange-100", station: "bar" },
    { id: "combo", name: "Комбо", color: "bg-fuchsia-100", station: "hot" },
];

// ===== Товары =====
const PRODUCTS = [
    // роллы
    { id: "phila-orange", categoryId: "rollsStd", name: "Филадельфия Orange (стандарт)", price: 420, vat: 20 },
    { id: "phila-classic", categoryId: "rollsStd", name: "Филадельфия Классик", price: 390, vat: 20 },
    { id: "california", categoryId: "rollsStd", name: "Калифорния", price: 360, vat: 20 },
    { id: "california-shrimp", categoryId: "rollsStd", name: "Калифорния с креветкой", price: 450, vat: 20 },
    { id: "dragon-roll", categoryId: "rollsStd", name: "Дракон ролл", price: 480, vat: 20 },
    { id: "spicy-tuna", categoryId: "rollsStd", name: "Спайси туна", price: 400, vat: 20 },
    
    // пицца
    { id: "pizza-margarita-25", categoryId: "pizza25", name: "Маргарита 25", price: 330, vat: 20 },
    { id: "pizza-pepperoni-25", categoryId: "pizza25", name: "Пепперони 25", price: 380, vat: 20 },
    { id: "pizza-4cheese-25", categoryId: "pizza25", name: "4 Сыра 25", price: 350, vat: 20 },
    { id: "pizza-margarita-33", categoryId: "pizza33", name: "Маргарита 33", price: 430, vat: 20 },
    { id: "pizza-pepperoni-33", categoryId: "pizza33", name: "Пепперони 33", price: 490, vat: 20 },
    { id: "pizza-4cheese-33", categoryId: "pizza33", name: "4 Сыра 33", price: 450, vat: 20 },
    { id: "pizza-margarita-42", categoryId: "pizza42", name: "Маргарита 42", price: 620, vat: 20 },
    { id: "pizza-pepperoni-42", categoryId: "pizza42", name: "Пепперони 42", price: 680, vat: 20 },
    
    // салаты
    { id: "salad-caesar", categoryId: "salads", name: "Салат Цезарь", price: 320, vat: 10 },
    { id: "salad-greek", categoryId: "salads", name: "Греческий салат", price: 280, vat: 10 },
    { id: "salad-cobb", categoryId: "salads", name: "Салат Кобб", price: 350, vat: 10 },
    
    // комбо
    { id: "combo-1", categoryId: "combo", name: "Комбо Пицца+Ролл", price: 750, vat: 20 },
    { id: "combo-family", categoryId: "combo", name: "Семейный Ужин", price: 1599, vat: 20 },
    { id: "combo-cheese", categoryId: "combo", name: "Сырная атака", price: 899, vat: 20 },
    { id: "combo-sea", categoryId: "combo", name: "Морской Бриз", price: 1199, vat: 20 },
    
    // напитки
    { id: "drink-cola", categoryId: "drinks", name: "Кока-Кола 0.5л", price: 120, vat: 20 },
    { id: "drink-pepsi", categoryId: "drinks", name: "Пепси 0.5л", price: 120, vat: 20 },
    { id: "drink-juice", categoryId: "drinks", name: "Сок 0.33л", price: 80, vat: 20 },
    { id: "drink-water", categoryId: "drinks", name: "Вода 0.5л", price: 60, vat: 20 },
    
    // закуски
    { id: "fries", categoryId: "snacks", name: "Картофель фри", price: 150, vat: 20 },
    { id: "cheese-sticks", categoryId: "snacks", name: "Сырные палочки", price: 200, vat: 20 },
    { id: "nuggets", categoryId: "snacks", name: "Куриные наггетсы", price: 180, vat: 20 },
    
    // алкоголь
    { id: "beer-ipa-05", categoryId: "beer", name: "IPA 0.5 л", price: 220, vat: 20, isAlcohol: true, alcVolumeL: 0.5, alcStrength: 5.5, isMarked: true },
    { id: "beer-lager-033", categoryId: "beer", name: "Лагер 0.33 л", price: 180, vat: 20, isAlcohol: true, alcVolumeL: 0.33, alcStrength: 4.7 },
    { id: "beer-draft-05", categoryId: "beerDraft", name: "Разливное Пилс 0.5 л", price: 200, vat: 20, isAlcohol: true, isDraft: true, draftLiters: 0.5, alcStrength: 4.5 },
    { id: "beer-draft-1", categoryId: "beerDraft", name: "Разливное Эль 1.0 л", price: 360, vat: 20, isAlcohol: true, isDraft: true, draftLiters: 1.0, alcStrength: 5.2 },
];

const DELIVERY_SERVICE_ITEM = { id: "delivery-fee", name: "Доставка (услуга)", price: 0, vat: 20, isService: true };

// Функция загрузки всех продуктов из menu_data.json
async function loadAllProductsFromMenu() {
    try {
        const response = await fetch('menu_data.json');
        const data = await response.json();
        
        // Конвертируем данные из menu_data.json в формат POS
        const allProducts = data.offers.map(item => {
            // Определяем категорию на основе category_name
            let categoryId = 'other';
            const categoryName = item.category_name.toLowerCase();
            
            if (categoryName.includes('пицца')) {
                if (item.name.includes('25')) categoryId = 'pizza25';
                else if (item.name.includes('33')) categoryId = 'pizza33';
                else if (item.name.includes('42')) categoryId = 'pizza42';
                else categoryId = 'pizza25'; // по умолчанию
            } else if (categoryName.includes('ролл') || categoryName.includes('суши')) {
                categoryId = 'rollsStd';
            } else if (categoryName.includes('салат')) {
                categoryId = 'salads';
            } else if (categoryName.includes('комбо')) {
                categoryId = 'combo';
            } else if (categoryName.includes('напиток') || categoryName.includes('сок') || categoryName.includes('кола')) {
                categoryId = 'drinks';
            } else if (categoryName.includes('закуск') || categoryName.includes('фри')) {
                categoryId = 'snacks';
            } else if (categoryName.includes('пиво') || categoryName.includes('алкоголь')) {
                categoryId = 'beer';
            }
            
            return {
                id: item.id,
                categoryId: categoryId,
                name: item.name,
                price: parseInt(item.price),
                vat: 20, // по умолчанию
                description: item.description ? item.description.replace(/<[^>]*>/g, '') : '',
                photo: item.picture || ''
            };
        });
        
        // Добавляем новые продукты к существующим
        PRODUCTS.push(...allProducts);
        console.log('Загружено продуктов из menu_data.json:', allProducts.length);
        console.log('Всего продуктов в POS:', PRODUCTS.length);
        
        // НЕ рендерим товары сразу - ждём выбора категории
        // renderProductGrid() будет вызван при клике на категорию
    } catch (error) {
        console.error('Ошибка загрузки продуктов:', error);
    }
}

// ===== Утилиты =====
const money = (n) => `${Number(n).toFixed(2)} ₽`;
const getStationByCategory = (categoryId) => CATEGORIES.find((c) => c.id === categoryId)?.station || "hot";

function calcTotals(items) {
    let subtotal = 0;
    items.forEach((i) => (subtotal += i.qty * i.price));
    const discount = 0;
    return { subtotal, discount, total: Math.max(0, subtotal - discount) };
}

function cryptoRandom() {
    const arr = new Uint8Array(8);
    (window.crypto || window.msCrypto).getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ===== Состояние приложения =====
let state = {
    searchQuery: "",
    activeCategory: CATEGORIES[0].id,
    channel: "inhouse",
    cartLines: [],
    queues: { hot: [], cold: [], bar: [] },
    receipts: [],
    settings: {
        ofdEnabled: true,
        integratedTerminalIP: "192.168.0.50:7777",
        printers: { hot: true, cold: true, bar: true },
    },
    orderCounter: 1,
    modalOpen: false,
    modalTitle: "",
    modalContent: "",
    modalFooter: "",
    complianceOpen: false,
    pendingPayMethod: null,
    ageConfirmed: false,
    codesConfirmed: false
};

// ===== Инициализация =====
document.addEventListener('DOMContentLoaded', function() {
    initializePOS();
    setupEventListeners();
    loadAllProductsFromMenu(); // Загружаем все продукты из menu_data.json
    renderAll();
});

function initializePOS() {
    // Загружаем сохраненные данные из localStorage
    const savedState = localStorage.getItem('dandy-pos-state');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        state = { ...state, ...parsed };
    }
}

function setupEventListeners() {
    // Поиск
    document.getElementById('searchInput').addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderProductGrid();
    });

    // Настройки
    document.getElementById('settingsBtn').addEventListener('click', () => {
        openSettingsModal();
    });

    // Возврат в админку
    document.getElementById('backToAdmin').addEventListener('click', () => {
        window.location.href = 'admin.html';
    });

    // Сохранение состояния при изменениях
    setInterval(() => {
        localStorage.setItem('dandy-pos-state', JSON.stringify(state));
    }, 1000);
}

// ===== Рендеринг компонентов =====
function renderAll() {
    renderChannelSelector();
    renderCategoryTiles();
    renderProductGrid(); // Покажет сообщение "Выберите категорию"
    renderCart();
    renderPaymentPanel();
    renderKDSQueues();
    renderReceiptsLog();
}

function renderChannelSelector() {
    const options = [
        { id: "inhouse", label: "В зале" },
        { id: "takeout", label: "На вынос" },
        { id: "delivery", label: "Доставка" },
        { id: "aggregator-yandex", label: "Агрегатор: Яндекс" },
        { id: "aggregator-dc", label: "Агрегатор: DC" },
    ];

    const container = document.getElementById('channelSelector');
    container.innerHTML = options.map(o => `
        <button
            onclick="setChannel('${o.id}')"
            class="px-3 py-1 rounded-full border text-sm ${
                state.channel === o.id ? "bg-emerald-600 text-white border-emerald-700" : "bg-white hover:bg-gray-50"
            }"
        >
            ${o.label}
        </button>
    `).join('');
}

function renderCategoryTiles() {
    const container = document.getElementById('categoryTiles');
    container.innerHTML = CATEGORIES.map(c => `
        <button
            onclick="setActiveCategory('${c.id}')"
            class="${c.color} rounded-xl p-3 text-left shadow-sm border hover:shadow transition ${
                state.activeCategory === c.id ? "ring-2 ring-emerald-500" : ""
            }"
        >
            <div class="text-[11px] text-gray-500">Категория</div>
            <div class="font-semibold leading-tight">${c.name}</div>
        </button>
    `).join('');
}

function renderProductGrid() {
    const container = document.getElementById('productGrid');
    
    // Если категория не выбрана, показываем сообщение
    if (!state.activeCategory) {
        container.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <svg class="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">Выберите категорию</h3>
                <p class="text-gray-500">Нажмите на одну из категорий выше, чтобы увидеть товары</p>
            </div>
        `;
        return;
    }
    
    let products = PRODUCTS;
    
    // Фильтр по категории
    products = products.filter(p => p.categoryId === state.activeCategory);
    
    // Фильтр по поиску
    if (state.searchQuery.trim()) {
        const query = state.searchQuery.trim().toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(query));
    }

    // Если нет товаров после фильтрации
    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <svg class="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">Товары не найдены</h3>
                <p class="text-gray-500">Попробуйте выбрать другую категорию или изменить поисковый запрос</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(p => `
        <div class="rounded-xl border p-3 shadow-sm hover:shadow transition bg-white">
            <div class="font-medium leading-snug mb-1 flex items-center gap-2">
                <span>${p.name}</span>
                ${p.isAlcohol ? '<span class="text-[10px] px-1 py-[1px] rounded bg-amber-200 text-amber-900">алк</span>' : ''}
                ${p.isMarked ? '<span class="text-[10px] px-1 py-[1px] rounded bg-indigo-200 text-indigo-900">ЧЗ</span>' : ''}
            </div>
            <div class="text-sm text-gray-500 mb-3">${money(p.price)}</div>
            <button
                onclick="addProduct(${JSON.stringify(p).replace(/"/g, '&quot;')})"
                class="w-full rounded-lg bg-emerald-600 text-white py-2 hover:bg-emerald-700 active:scale-[.99]"
            >
                В чек
            </button>
        </div>
    `).join('');
}

function renderCart() {
    const totals = calcTotals(state.cartLines);
    const disabledPay = state.channel.startsWith("aggregator");
    
    const container = document.getElementById('cart');
    container.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <div class="text-lg font-semibold">Чек</div>
            ${disabledPay ? '<div class="text-xs px-2 py-1 rounded bg-gray-800 text-white">Оплата у агрегатора</div>' : ''}
        </div>
        <div class="flex-1 overflow-auto space-y-2 pr-1">
            ${state.cartLines.length === 0 ? '<div class="text-sm text-gray-500">Пусто. Добавьте позиции из списка.</div>' : ''}
            ${state.cartLines.map(l => `
                <div class="border rounded-xl p-2 flex items-center gap-2">
                    <div class="flex-1">
                        <div class="font-medium text-sm">
                            ${l.name}
                            ${l.isService ? '<span class="ml-2 text-xs text-blue-600">услуга</span>' : ''}
                        </div>
                        <div class="text-xs text-gray-500">${money(l.price)} × ${l.qty}</div>
                    </div>
                    <div class="text-sm font-semibold w-20 text-right">${money(l.qty * l.price)}</div>
                    <div class="flex items-center gap-1">
                        ${!l.isService ? `
                            <button onclick="decQuantity('${l.id}')" class="px-2 py-1 rounded border">−</button>
                            <button onclick="incQuantity('${l.id}')" class="px-2 py-1 rounded border">+</button>
                        ` : ''}
                        <button onclick="removeLine('${l.id}')" class="px-2 py-1 rounded border">✕</button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="mt-3 space-y-2">
            <div class="flex justify-between text-sm"><span>Сумма</span><span>${money(totals.subtotal)}</span></div>
            <div class="flex justify-between text-sm"><span>Скидка</span><span>${money(totals.discount)}</span></div>
            <div class="flex justify-between text-base font-semibold"><span>К оплате</span><span>${money(totals.total)}</span></div>
            <div class="grid grid-cols-3 gap-2">
                <button onclick="addDelivery()" class="rounded-lg border py-2 hover:bg-gray-50">Добавить доставку</button>
                <button onclick="sendToKitchen()" ${state.cartLines.length === 0 ? 'disabled' : ''} class="rounded-lg border py-2 hover:bg-gray-50 disabled:opacity-50">В кухню</button>
                <a href="#pay" class="rounded-lg border py-2 text-center hover:bg-gray-50">К оплате ↓</a>
            </div>
        </div>
    `;
}

function renderPaymentPanel() {
    const totals = calcTotals(state.cartLines);
    const hasAlcohol = state.cartLines.some(l => l.isAlcohol);
    const disabled = state.cartLines.length === 0 || state.channel.startsWith("aggregator");
    
    const container = document.getElementById('paymentPanel');
    container.innerHTML = `
        <div id="pay" class="rounded-2xl border p-4 bg-white shadow-sm">
            <div class="flex items-center justify-between mb-4">
                <div class="font-semibold text-lg">💳 Оплата</div>
                <div class="text-lg font-bold text-emerald-600">${money(totals.total)}</div>
            </div>
            ${hasAlcohol ? '<div class="mb-4 text-xs px-3 py-2 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">⚠️ В чеке есть алкоголь: потребуется 18+ и (при необходимости) маркировка Честный ЗНАК</div>' : ''}
            <div class="grid grid-cols-1 gap-3">
                <button ${disabled ? 'disabled' : ''} onclick="handlePay('cash')" class="payment-btn cash-btn">
                    <div class="payment-icon">💵</div>
                    <div class="payment-content">
                        <div class="payment-title">Наличные</div>
                        <div class="payment-subtitle">Оплата наличными</div>
                    </div>
                </button>
                <button ${disabled ? 'disabled' : ''} onclick="handlePay('acq-integrated')" class="payment-btn acq-btn">
                    <div class="payment-icon">🏪</div>
                    <div class="payment-content">
                        <div class="payment-title">Эквайринг (интегр.)</div>
                        <div class="payment-subtitle">Встроенный терминал</div>
                    </div>
                </button>
                <button ${disabled ? 'disabled' : ''} onclick="handlePay('acq-portable')" class="payment-btn acq-btn">
                    <div class="payment-icon">📱</div>
                    <div class="payment-content">
                        <div class="payment-title">Эквайринг (переносной)</div>
                        <div class="payment-subtitle">Мобильный терминал</div>
                    </div>
                </button>
                <button ${disabled ? 'disabled' : ''} onclick="handlePay('acq-external')" class="payment-btn acq-btn">
                    <div class="payment-icon">🔌</div>
                    <div class="payment-content">
                        <div class="payment-title">Эквайринг (внешний)</div>
                        <div class="payment-subtitle">Внешний терминал</div>
                    </div>
                </button>
                <button ${disabled ? 'disabled' : ''} onclick="handlePay('sbp')" class="payment-btn sbp-btn">
                    <div class="payment-icon">📲</div>
                    <div class="payment-content">
                        <div class="payment-title">СБП (QR)</div>
                        <div class="payment-subtitle">Система быстрых платежей</div>
                    </div>
                </button>
            </div>
        </div>
    `;
}

function renderKDSQueues() {
    const container = document.getElementById('kdsQueues');
    container.innerHTML = ['hot', 'cold', 'bar'].map(st => `
        <div class="rounded-2xl border bg-white">
            <div class="px-3 py-2 border-b font-semibold flex items-center justify-between">
                <span>Принтер: ${st === "hot" ? "Горячий" : st === "cold" ? "Холодный" : "Бар"}</span>
                <span class="text-xs text-gray-500">${state.queues[st].length} тикетов</span>
            </div>
            <div class="p-2 space-y-2 max-h-72 overflow-auto">
                ${state.queues[st].length === 0 ? '<div class="text-xs text-gray-500">Очередь пуста</div>' : ''}
                ${state.queues[st].map(t => `
                    <div class="rounded-xl border p-2">
                        <div class="text-sm font-semibold mb-1">Заказ #${t.orderNo}</div>
                        <ul class="text-sm list-disc pl-5">
                            ${t.items.map(i => `<li>${i.name} × ${i.qty}</li>`).join('')}
                        </ul>
                        <div class="mt-1 text-[11px] text-gray-500">${new Date(t.createdAt).toLocaleTimeString()}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function renderReceiptsLog() {
    const container = document.getElementById('receiptsLog');
    container.innerHTML = `
        <div class="font-semibold mb-2">Последние фискальные чеки (эмуляция ОФД)</div>
        ${state.receipts.length === 0 ? '<div class="text-sm text-gray-500">Пока пусто.</div>' : ''}
        <div class="space-y-2 max-h-80 overflow-auto pr-1">
            ${state.receipts.map(r => `
                <div class="border rounded-xl p-2">
                    <div class="flex items-center justify-between">
                        <div class="font-medium">Чек #${r.fiscalNo}</div>
                        <div class="text-xs text-gray-500">${new Date(r.createdAt).toLocaleString()}</div>
                    </div>
                    <div class="text-xs text-gray-500">Тип оплаты: ${r.payMethodLabel}</div>
                    <ul class="text-sm list-disc pl-5 my-1">
                        ${r.items.map(i => `<li>${i.name} × ${i.qty} — ${money(i.qty * i.price)}</li>`).join('')}
                    </ul>
                    <div class="font-semibold">Итого: ${money(r.total)}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== Обработчики событий =====
function setChannel(channelId) {
    state.channel = channelId;
    renderChannelSelector();
    renderCart();
    renderPaymentPanel();
}

function setActiveCategory(categoryId) {
    state.activeCategory = categoryId;
    renderCategoryTiles();
    renderProductGrid();
}

function addProduct(product) {
    const existing = state.cartLines.find(l => l.id === product.id);
    if (existing) {
        existing.qty += 1;
    } else {
        state.cartLines.push({ ...product, qty: 1 });
    }
    renderCart();
    renderPaymentPanel();
}

function incQuantity(id) {
    const line = state.cartLines.find(l => l.id === id);
    if (line) {
        line.qty += 1;
        renderCart();
        renderPaymentPanel();
    }
}

function decQuantity(id) {
    const line = state.cartLines.find(l => l.id === id);
    if (line) {
        line.qty = Math.max(0, line.qty - 1);
        if (line.qty === 0) {
            state.cartLines = state.cartLines.filter(l => l.id !== id);
        }
        renderCart();
        renderPaymentPanel();
    }
}

function removeLine(id) {
    state.cartLines = state.cartLines.filter(l => l.id !== id);
    renderCart();
    renderPaymentPanel();
}

function addDelivery() {
    const current = state.cartLines.find(l => l.id === DELIVERY_SERVICE_ITEM.id);
    const value = prompt("Введите стоимость доставки, ₽", current ? String(current.price) : "150");
    if (value == null) return;
    
    const price = Number(value.replace(",", "."));
    if (!isFinite(price) || price < 0) {
        alert("Неверная сумма");
        return;
    }
    
    const existing = state.cartLines.find(l => l.id === DELIVERY_SERVICE_ITEM.id);
    if (existing) {
        existing.price = price;
    } else {
        state.cartLines.push({ ...DELIVERY_SERVICE_ITEM, qty: 1, price });
    }
    renderCart();
    renderPaymentPanel();
}

function sendToKitchen() {
    if (state.cartLines.length === 0) return;
    
    const orderNo = state.orderCounter++;
    const itemsForKitchen = state.cartLines.filter(l => !l.isService);
    const byStation = { hot: [], cold: [], bar: [] };
    
    itemsForKitchen.forEach(l => {
        const station = getStationByCategory(l.categoryId);
        byStation[station].push({ name: l.name, qty: l.qty });
    });
    
    Object.keys(byStation).forEach(station => {
        if (byStation[station].length > 0) {
            state.queues[station].push({
                id: cryptoRandom(),
                orderNo,
                createdAt: Date.now(),
                items: byStation[station]
            });
        }
    });
    
    renderKDSQueues();
}

function handlePay(method) {
    if (state.channel.startsWith("aggregator")) return;
    
    const hasAlcohol = state.cartLines.some(l => l.isAlcohol);
    const hasMarked = state.cartLines.some(l => l.isMarked);
    
    if (hasAlcohol || hasMarked) {
        state.pendingPayMethod = method;
        state.ageConfirmed = !hasAlcohol; // Если нет алкоголя, то подтверждение не нужно
        state.codesConfirmed = !hasMarked; // Если нет маркировки, то подтверждение не нужно
        openComplianceModal();
        return;
    }
    
    doFinishPayment(method);
}

function doFinishPayment(method) {
    const payMethodLabel = {
        cash: "Наличные",
        "acq-integrated": "Эквайринг (интегр.)",
        "acq-portable": "Эквайринг (переносной)",
        "acq-external": "Эквайринг (внешний)",
        sbp: "СБП (QR)",
    }[method] || method;

    const totals = calcTotals(state.cartLines);
    const receipt = {
        id: cryptoRandom(),
        fiscalNo: String(100000 + Math.floor(Math.random() * 900000)),
        createdAt: Date.now(),
        payMethodLabel,
        items: state.cartLines.map(l => ({ name: l.name, qty: l.qty, price: l.price })),
        total: totals.total,
    };
    
    state.receipts.unshift(receipt);
    state.receipts = state.receipts.slice(0, 20);
    
    state.cartLines = [];
    state.complianceOpen = false;
    state.pendingPayMethod = null;
    
    renderCart();
    renderPaymentPanel();
    renderReceiptsLog();
    closeModal();
}

// ===== Модальные окна =====
function openModal(title, content, footer = "") {
    state.modalOpen = true;
    state.modalTitle = title;
    state.modalContent = content;
    state.modalFooter = footer;
    
    const overlay = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <div class="px-4 py-3 border-b flex items-center justify-between">
            <div class="font-semibold">${title}</div>
            <button onclick="closeModal()" class="text-sm px-2 py-1 rounded border">Закрыть</button>
        </div>
        <div class="p-4">${content}</div>
        ${footer ? `<div class="px-4 py-3 border-t bg-gray-50 rounded-b-2xl">${footer}</div>` : ''}
    `;
    
    overlay.classList.remove('hidden');
}

function closeModal() {
    state.modalOpen = false;
    document.getElementById('modalOverlay').classList.add('hidden');
}

function openSettingsModal() {
    const content = `
        <div class="space-y-4">
            <div>
                <div class="font-medium mb-1">ОФД</div>
                <label class="flex items-center gap-2 text-sm">
                    <input type="checkbox" ${state.settings.ofdEnabled ? 'checked' : ''} onchange="updateSetting('ofdEnabled', this.checked)">
                    Отправлять чеки в ОФД (эмуляция)
                </label>
            </div>
            <div>
                <div class="font-medium mb-1">Интегрированный терминал</div>
                <input
                    value="${state.settings.integratedTerminalIP}"
                    onchange="updateSetting('integratedTerminalIP', this.value)"
                    placeholder="IP:порт (например, 192.168.0.50:5555)"
                    class="w-full rounded border px-3 py-2"
                />
            </div>
            <div>
                <div class="font-medium mb-1">Принтеры кухни</div>
                <div class="grid grid-cols-3 gap-2 text-sm">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" ${state.settings.printers.hot ? 'checked' : ''} onchange="updateSetting('printers.hot', this.checked)"/>
                        Горячий
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="checkbox" ${state.settings.printers.cold ? 'checked' : ''} onchange="updateSetting('printers.cold', this.checked)"/>
                        Холодный
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="checkbox" ${state.settings.printers.bar ? 'checked' : ''} onchange="updateSetting('printers.bar', this.checked)"/>
                        Бар
                    </label>
                </div>
            </div>
        </div>
    `;
    
    const footer = `
        <div class="flex justify-end gap-2">
            <button onclick="closeModal()" class="px-3 py-1 rounded border">Отмена</button>
            <button onclick="closeModal()" class="px-3 py-1 rounded bg-emerald-600 text-white">Сохранить</button>
        </div>
    `;
    
    openModal("Настройки оборудования/интеграций (эмуляция)", content, footer);
}

function canConfirmPayment() {
    const hasAlcohol = state.cartLines.some(l => l.isAlcohol);
    const hasMarked = state.cartLines.some(l => l.isMarked);
    
    if (hasAlcohol && !state.ageConfirmed) return false;
    if (hasMarked && !state.codesConfirmed) return false;
    
    return true;
}

function updateComplianceModal() {
    // Перерисовываем модальное окно с обновленным состоянием кнопки
    openComplianceModal();
}

function openComplianceModal() {
    const hasAlcohol = state.cartLines.some(l => l.isAlcohol);
    const hasMarked = state.cartLines.some(l => l.isMarked);
    
    const content = `
        <div class="space-y-3">
            ${hasAlcohol ? `
                <label class="flex items-center gap-2 text-sm">
                    <input type="checkbox" ${state.ageConfirmed ? 'checked' : ''} onchange="state.ageConfirmed = this.checked; updateComplianceModal();">
                    Подтверждаю 18+ покупателя (ЕГАИС)
                </label>
            ` : ''}
            ${hasMarked ? `
                <label class="flex items-center gap-2 text-sm">
                    <input type="checkbox" ${state.codesConfirmed ? 'checked' : ''} onchange="state.codesConfirmed = this.checked; updateComplianceModal();">
                    Маркировка «Честный ЗНАК»: коды GS1/КМ считаны корректно
                </label>
            ` : ''}
            <div class="text-xs text-gray-500">Эмуляция: фактический обмен с ЕГАИС/ОФД и SDK эквайринга здесь не выполняется.</div>
        </div>
    `;
    
    const footer = `
        <div class="flex justify-between items-center">
            <div class="text-xs text-gray-500">Оплата: ${state.pendingPayMethod || "—"}</div>
            <div class="flex gap-2">
                <button onclick="closeModal()" class="px-3 py-1 rounded border">Отмена</button>
                <button
                    ${!canConfirmPayment() ? 'disabled' : ''}
                    onclick="doFinishPayment(state.pendingPayMethod)"
                    class="px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-50"
                >
                    Подтвердить и оплатить
                </button>
            </div>
        </div>
    `;
    
    openModal("Подтверждение продажи алкоголя/маркировки", content, footer);
}

function updateSetting(key, value) {
    if (key.includes('.')) {
        const [parent, child] = key.split('.');
        state.settings[parent][child] = value;
    } else {
        state.settings[key] = value;
    }
}
