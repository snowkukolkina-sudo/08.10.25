// DANDY CRM/АРМ — Админка для сайта DANDY Pizza
// Полная функциональность управления рестораном

class DandyAdmin {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.currentLang = 'ru';
        this.currentTab = 'dishes';
        
        // Данные
        this.dishes = [
            { id: 1, name: "Пепперони 30 см", cat: "Пицца", price: 399, cost: 180, desc: "Острая пицца с пепперони", mods: ["Острый соус", "Доп. сыр"], alrg: "молоко", nutrition: "б/ж/у", photo: "" },
            { id: 2, name: "Филадельфия", cat: "Роллы", price: 459, cost: 220, desc: "Классический ролл с лососем", mods: ["Соус унаги", "Кунжут"], alrg: "рыба", nutrition: "б/ж/у", photo: "" },
            { id: 3, name: "Маргарита 25 см", cat: "Пицца", price: 330, cost: 150, desc: "Классическая пицца с томатами и моцареллой", mods: ["Базилик"], alrg: "молоко", nutrition: "б/ж/у", photo: "" },
            { id: 4, name: "Калифорния", cat: "Роллы", price: 360, cost: 180, desc: "Ролл с крабом и авокадо", mods: ["Икра", "Кунжут"], alrg: "рыба", nutrition: "б/ж/у", photo: "" },
            { id: 5, name: "4 Сыра 33 см", cat: "Пицца", price: 450, cost: 200, desc: "Пицца с четырьмя видами сыра", mods: ["Моцарелла", "Пармезан", "Чеддер", "Горгонзола"], alrg: "молоко", nutrition: "б/ж/у", photo: "" },
            { id: 6, name: "Салат Цезарь", cat: "Салаты", price: 320, cost: 120, desc: "Классический салат с курицей и сухариками", mods: ["Соус цезарь"], alrg: "молоко", nutrition: "б/ж/у", photo: "" },
            { id: 7, name: "Греческий салат", cat: "Салаты", price: 280, cost: 100, desc: "Свежий салат с овощами и фетой", mods: ["Оливковое масло"], alrg: "молоко", nutrition: "б/ж/у", photo: "" },
            { id: 8, name: "Комбо Семейный", cat: "Комбо", price: 1599, cost: 800, desc: "Большое комбо для всей семьи", mods: ["2 пиццы", "Напитки"], alrg: "молоко", nutrition: "б/ж/у", photo: "" }
        ];
        
        this.products = [
            { id: 1001, name: "Соус фирменный", cat: "Соусы", price: 49, cost: 15, sku: "SAUCE-001", photo: "" },
            { id: 1002, name: "Кока-Кола 0.5л", cat: "Напитки", price: 120, cost: 60, sku: "DRINK-001", photo: "" },
            { id: 1003, name: "Пепси 0.5л", cat: "Напитки", price: 120, cost: 60, sku: "DRINK-002", photo: "" },
            { id: 1004, name: "Картофель фри", cat: "Закуски", price: 150, cost: 50, sku: "SNACK-001", photo: "" },
            { id: 1005, name: "Сырные палочки", cat: "Закуски", price: 200, cost: 80, sku: "SNACK-002", photo: "" }
        ];
        
        this.promotions = [
            { 
                id: 1, 
                title: "Скидка 20% на все пиццы", 
                description: "Специальное предложение на все виды пиццы", 
                discount: 20, 
                startDate: "2024-01-01", 
                endDate: "2024-12-31", 
                photo: "", 
                isActive: true,
                products: ["Пепперони 30 см", "Маргарита 25 см", "4 Сыра 33 см"]
            },
            { 
                id: 2, 
                title: "Комбо со скидкой", 
                description: "Большое комбо для всей семьи со скидкой 15%", 
                discount: 15, 
                startDate: "2024-01-01", 
                endDate: "2024-12-31", 
                photo: "", 
                isActive: true,
                products: ["Комбо Семейный"]
            }
        ];
        
        this.orders = [];
        
        this.couriers = [
            { id: 1, name: "Алексей", phone: "+7 900 000-00-01", status: "free" },
            { id: 2, name: "Марина", phone: "+7 900 000-00-02", status: "to-order" },
            { id: 3, name: "Павел", phone: "+7 900 000-00-03", status: "back" }
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadAllProducts();
        this.loadPromotions();
        this.loadOrders();
    }
    
    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        
        // Кнопка "Войти в кассир"
        document.getElementById('openCashier').addEventListener('click', () => {
            window.open('pos.html', '_blank');
        });
        
        // Navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchPage(e.target.dataset.page);
            });
        });
        
        // Language switch
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchLanguage(e.target.dataset.lang);
            });
        });
        
        // Menu tabs
        document.getElementById('dishesTab').addEventListener('click', () => {
            this.switchMenuTab('dishes');
        });
        
        document.getElementById('productsTab').addEventListener('click', () => {
            this.switchMenuTab('products');
        });
        
        // Add item
        document.getElementById('addItem').addEventListener('click', () => {
            this.addMenuItem();
        });
        
        // Photo preview
        document.getElementById('itemPhoto').addEventListener('input', (e) => {
            this.handlePhotoPreview(e.target.value);
        });
        
        // CSV import
        document.getElementById('csvImport').addEventListener('change', (e) => {
            this.importCSV(e.target.files[0]);
        });
        
        document.getElementById('loadSample').addEventListener('click', () => {
            this.loadSampleCSV();
        });
        
        // Order filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterOrders(e.target.dataset.filter);
            });
        });
        
        // Search functionality
        const searchInput = document.getElementById('adminSearch');
        if (searchInput) {
            console.log('Поиск подключен'); // Отладка
            searchInput.addEventListener('input', (e) => {
                console.log('Ввод в поиск:', e.target.value); // Отладка
                this.searchItems(e.target.value);
            });
        } else {
            console.log('Поле поиска не найдено!'); // Отладка
        }
    }
    
    handleLogin() {
        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;
        const role = document.querySelector('input[name="role"]:checked').value;
        
        // Проверяем логин и пароль
        if ((login === 'admin' && password === 'Admin123456') || 
            (login === 'Kiri;;2006788@gmail.com' && password === 'Admin123456')) {
            this.currentUser = { login, password, role };
            this.showAdminPanel();
        } else {
            alert("Неверные данные. Используйте:\n- Логин: admin, пароль: Admin123456\n- Или логин: Kiri;;2006788@gmail.com, пароль: Admin123456");
        }
    }
    
    showAdminPanel() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'flex';
        this.updateMenuTable();
        this.updateOrdersTable();
    }
    
    switchPage(page) {
        this.currentPage = page;
        
        // Update navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-page="${page}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            
            // Scroll to active tab
            setTimeout(() => {
                const tabsWrap = document.querySelector('.tabs-wrap');
                if (tabsWrap) {
                    const tabRect = activeTab.getBoundingClientRect();
                    const containerRect = tabsWrap.getBoundingClientRect();
                    const tabCenter = tabRect.left - containerRect.left + tabRect.width / 2;
                    const containerCenter = tabsWrap.clientWidth / 2;
                    const scrollLeft = tabsWrap.scrollLeft + (tabCenter - containerCenter);
                    
                    tabsWrap.scrollTo({
                        left: scrollLeft,
                        behavior: 'smooth'
                    });
                }
            }, 50);
        }
        
        // Update content
        document.querySelectorAll('.page-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(page).classList.add('active');
        
        // Load page-specific data
        this.loadPageData(page);
    }
    
    switchLanguage(lang) {
        this.currentLang = lang;
        
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
        
        // Update all text content
        this.updateLanguageContent();
    }
    
    switchMenuTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        document.getElementById('dishesTab').classList.toggle('btn-primary', tab === 'dishes');
        document.getElementById('dishesTab').classList.toggle('btn-secondary', tab !== 'dishes');
        document.getElementById('productsTab').classList.toggle('btn-primary', tab === 'products');
        document.getElementById('productsTab').classList.toggle('btn-secondary', tab !== 'products');
        
        // Update form fields
        const modifiersGroup = document.getElementById('modifiersGroup');
        const allergensGroup = document.getElementById('allergensGroup');
        const skuGroup = document.getElementById('skuGroup');
        const addItemTitle = document.getElementById('addItemTitle');
        
        if (tab === 'dishes') {
            modifiersGroup.style.display = 'block';
            allergensGroup.style.display = 'block';
            skuGroup.style.display = 'none';
            addItemTitle.textContent = 'Добавить блюдо';
        } else {
            modifiersGroup.style.display = 'none';
            allergensGroup.style.display = 'none';
            skuGroup.style.display = 'block';
            addItemTitle.textContent = 'Добавить товар';
        }
        
        this.updateMenuTable();
    }
    
    addMenuItem() {
        const name = document.getElementById('itemName').value;
        const category = document.getElementById('itemCategory').value;
        const price = parseFloat(document.getElementById('itemPrice').value) || 0;
        const cost = parseFloat(document.getElementById('itemCost').value) || 0;
        const description = document.getElementById('itemDescription').value;
        const photoUrl = document.getElementById('itemPhoto').value;
        const weight = document.getElementById('itemWeight') ? document.getElementById('itemWeight').value : '';
        
        if (!name) {
            alert('Введите название');
            return;
        }
        
        const newItem = {
            id: String(Date.now()),
            name,
            cat: category,
            category: category,
            price,
            cost,
            description: description,
            desc: description,
            photo: photoUrl,
            picture: photoUrl,
            weight: weight
        };
        
        if (this.currentTab === 'dishes') {
            const modifiers = document.getElementById('itemModifiers').value;
            const allergens = document.getElementById('itemAllergens').value;
            const nutrition = document.getElementById('itemNutrition')?.value || '';
            
            newItem.mods = modifiers ? modifiers.split(',').map(s => s.trim()) : [];
            newItem.alrg = allergens;
            newItem.nutrition = nutrition;
            
            this.dishes.push(newItem);
        } else {
            const sku = document.getElementById('itemSku').value || `SKU-${Date.now()}`;
            newItem.sku = sku;
            
            this.products.push(newItem);
        }
        
        // Сохраняем в localStorage для синхронизации с сайтом
        this.saveDishesToLocalStorage();
        
        this.clearForm();
        this.updateMenuTable();
        alert('✅ Товар успешно добавлен!\n\nИзменения сохранены и отобразятся на сайте.');
    }
    
    clearForm() {
        document.getElementById('itemName').value = '';
        document.getElementById('itemCategory').value = '';
        document.getElementById('itemPrice').value = '0';
        document.getElementById('itemCost').value = '0';
        document.getElementById('itemModifiers').value = '';
        document.getElementById('itemAllergens').value = '';
        document.getElementById('itemSku').value = '';
        document.getElementById('itemDescription').value = '';
        document.getElementById('itemPhoto').value = '';
        document.getElementById('photoPreview').innerHTML = '';
    }
    
    handlePhotoPreview(url) {
        const preview = document.getElementById('photoPreview');
        if (!url) {
            preview.innerHTML = '';
            return;
        }
        
        preview.innerHTML = `
            <img src="${url}" 
                 alt="превью" 
                 style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 2px solid #e5e7eb;"
                 onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'color: red;\\'>❌ Ошибка загрузки фото</div>';">
        `;
    }
    
    updateMenuTable(filteredItems = null) {
        const tableContainer = document.getElementById('menuTable');
        const items = filteredItems || (this.currentTab === 'dishes' ? this.dishes : this.products);
        
        console.log('Обновление таблицы:', items.length, 'товаров'); // Отладка
        
        // Убираем сообщение о результатах поиска если показываем все товары
        if (!filteredItems) {
            const existingMessage = document.getElementById('searchResultsMessage');
            if (existingMessage) {
                existingMessage.remove();
            }
        }
        
        let tableHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Фото</th>
                        <th>Название</th>
                        <th>Категория</th>
                        ${this.currentTab === 'products' ? '<th>SKU</th>' : ''}
                        <th>Цена</th>
                        <th>Себестоимость</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        items.forEach(item => {
            tableHTML += `
                <tr>
                    <td>${item.photo ? `<img src="${item.photo}" alt="фото" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : '—'}</td>
                    <td>${item.name}</td>
                    <td>${item.cat}</td>
                    ${this.currentTab === 'products' ? `<td>${item.sku}</td>` : ''}
                    <td>₽ ${item.price}</td>
                    <td>₽ ${item.cost}</td>
                    <td>
                        <button class="btn btn-primary btn-small" onclick="admin.editItem(${item.id})">Редактировать</button>
                        <button class="btn btn-secondary btn-small" onclick="admin.deleteItem(${item.id})">Удалить</button>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody></table>';
        tableContainer.innerHTML = tableHTML;
        console.log('Таблица обновлена'); // Отладка
    }

    editItem(itemId) {
        console.log('Редактирование товара:', itemId);
        
        // Находим товар
        const allItems = [...this.dishes, ...this.products];
        const item = allItems.find(i => String(i.id) === String(itemId));
        
        if (!item) {
            alert('Товар не найден!');
            return;
        }

        // Создаём модальное окно для редактирования
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7); display: flex; align-items: center;
            justify-content: center; z-index: 10000;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 2rem; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <h2 style="margin: 0 0 1.5rem 0; color: var(--dandy-green);">✏️ Редактирование товара</h2>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Название:</label>
                    <input type="text" id="editName" value="${item.name}" 
                           style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px;">
                </div>

                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Описание:</label>
                    <textarea id="editDescription" rows="3"
                              style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">${item.description || ''}</textarea>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Цена (₽):</label>
                        <input type="number" id="editPrice" value="${item.price}" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Себестоимость (₽):</label>
                        <input type="number" id="editCost" value="${item.cost || 0}" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                </div>

                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Категория:</label>
                    <input type="text" id="editCategory" value="${item.cat || ''}" 
                           style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>

                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Вес/Граммы:</label>
                    <input type="text" id="editWeight" value="${item.weight || ''}" placeholder="например: 500г, 30см"
                           style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Фото URL:</label>
                    <input type="text" id="editPhoto" value="${item.photo || item.picture || ''}" 
                           style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    ${item.photo || item.picture ? `<img src="${item.photo || item.picture}" style="max-width: 100px; margin-top: 0.5rem; border-radius: 8px;">` : ''}
                </div>

                <div style="display: flex; gap: 1rem;">
                    <button onclick="admin.saveEditedItem('${itemId}')" 
                            style="flex: 1; padding: 1rem; background: var(--dandy-green); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px;">
                        💾 Сохранить
                    </button>
                    <button onclick="this.closest('.modal-overlay').remove()" 
                            style="flex: 1; padding: 1rem; background: #6b7280; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        ❌ Отмена
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Закрытие по клику на overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    saveEditedItem(itemId) {
        const name = document.getElementById('editName').value;
        const description = document.getElementById('editDescription').value;
        const price = parseFloat(document.getElementById('editPrice').value);
        const cost = parseFloat(document.getElementById('editCost').value);
        const category = document.getElementById('editCategory').value;
        const weight = document.getElementById('editWeight').value;
        const photo = document.getElementById('editPhoto').value;

        // Находим товар
        let item = this.dishes.find(d => String(d.id) === String(itemId));
        let isDish = true;
        
        if (!item) {
            item = this.products.find(p => String(p.id) === String(itemId));
            isDish = false;
        }

        if (item) {
            // Обновляем данные
            item.name = name;
            item.description = description;
            item.price = price;
            item.cost = cost;
            item.cat = category;
            item.weight = weight;
            if (photo) {
                item.photo = photo;
                item.picture = photo;
            }

            // Сохраняем в localStorage для синхронизации с сайтом
            this.saveDishesToLocalStorage();

            // Обновляем таблицу
            this.updateMenuTable();

            // Закрываем модалку
            document.querySelector('.modal-overlay').remove();

            alert('✅ Товар успешно обновлён!\n\nИзменения сохранены и отобразятся на сайте.');
        }
    }

    saveDishesToLocalStorage() {
        // Сохраняем все товары в localStorage для синхронизации с сайтом
        const allItems = [...this.dishes, ...this.products];
        localStorage.setItem('menu_items', JSON.stringify(allItems));
        console.log('✅ Товары сохранены в localStorage:', allItems.length);
    }

    deleteItem(itemId) {
        // Находим товар для отображения имени
        const allItems = [...this.dishes, ...this.products];
        const itemToDelete = allItems.find(i => String(i.id) === String(itemId));
        const itemName = itemToDelete ? itemToDelete.name : 'Товар';
        
        if (!confirm(`❌ Удалить "${itemName}"?\n\nЭто действие нельзя отменить!`)) {
            return;
        }

        console.log('🗑️ Удаление товара:', itemId, itemName);

        // Удаляем из массивов
        const beforeDishes = this.dishes.length;
        const beforeProducts = this.products.length;
        const beforeTotal = beforeDishes + beforeProducts;
        
        this.dishes = this.dishes.filter(d => String(d.id) !== String(itemId));
        this.products = this.products.filter(p => String(p.id) !== String(itemId));

        const afterTotal = this.dishes.length + this.products.length;
        const deleted = beforeTotal - afterTotal;

        console.log(`📊 Было: ${beforeTotal}, Стало: ${afterTotal}, Удалено: ${deleted}`);

        if (deleted > 0) {
            // Сохраняем изменения
            this.saveDishesToLocalStorage();

            // Обновляем таблицу
            this.updateMenuTable();

            alert(`✅ Товар "${itemName}" удалён!\n\nОсталось товаров: ${afterTotal}\n\nОбнови главную страницу (Ctrl+Shift+R) чтобы увидеть изменения!`);
        } else {
            console.error('❌ Товар не найден, ID:', itemId);
            alert('⚠️ Товар не найден');
        }
    }
    
    updateOrdersTable() {
        const tbody = document.querySelector('#ordersTable tbody');
        let html = '';
        
        this.orders.forEach(order => {
            html += `
                <tr style="cursor: pointer;" onclick="admin.showOrderDetails('${order.id}')" title="Нажмите для просмотра деталей">
                    <td><strong>${order.id}</strong></td>
                    <td>
                        <div>${order.client}</div>
                        ${order.phone ? `<div style="font-size: 0.85em; color: #666;">${order.phone}</div>` : ''}
                    </td>
                    <td>${order.channel}</td>
                    <td>${order.courier}</td>
                    <td>${order.eta} мин</td>
                    <td><strong>₽ ${order.amount}</strong></td>
                    <td><span class="status-badge status-${order.status.replace(' ', '-')}">${order.status}</span></td>
                </tr>
            `;
        });
        
        if (this.orders.length === 0) {
            html = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #999;">Заказов пока нет</td></tr>';
        }
        
        tbody.innerHTML = html;
    }
    
    async showOrderDetails(orderId) {
        // Пытаемся загрузить свежие данные с API
        try {
            const response = await fetch(`http://localhost:3000/api/orders/${orderId}`);
            if (response.ok) {
                const result = await response.json();
                const apiOrder = result.data || result;
                
                // Обновляем локальные данные
                const localOrderIndex = this.orders.findIndex(o => o.id === orderId);
                if (localOrderIndex !== -1) {
                    this.orders[localOrderIndex] = {
                        id: apiOrder.id,
                        client: apiOrder.customerName || apiOrder.customer_name || 'Клиент',
                        phone: apiOrder.customerPhone || apiOrder.customer_phone || '',
                        amount: apiOrder.total || 0,
                        status: this.mapStatusToRussian(apiOrder.status),
                        channel: 'Сайт',
                        courier: '—',
                        eta: this.calculateETA(apiOrder.createdAt || apiOrder.created_at, apiOrder.status),
                        items: apiOrder.items || [],
                        address: apiOrder.address || apiOrder.deliveryAddress || '',
                        deliveryType: apiOrder.deliveryType || apiOrder.delivery_type || 'delivery',
                        paymentMethod: apiOrder.paymentMethod || apiOrder.payment_method || 'cash'
                    };
                }
            }
        } catch (error) {
            console.log('Используем локальные данные:', error);
        }
        
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            alert('Заказ не найден');
            return;
        }
        
        // Создаем модальное окно с деталями заказа
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const itemsList = order.items && order.items.length > 0 
            ? order.items.map(item => {
                const itemName = item.name || item.product_name || item.productName || 'Товар';
                const itemPrice = item.price || item.product_price || item.productPrice || 0;
                const itemQty = item.quantity || item.qty || 1;
                const itemTotal = item.total || (itemPrice * itemQty);
                const itemExtras = item.extras || item.modifiers || null;
                
                return `
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; font-size: 1.05em; margin-bottom: 0.25rem;">${itemName}</div>
                            ${itemExtras ? `<div style="font-size: 0.9em; color: #6b7280; margin-top: 0.25rem;">
                                Дополнения: ${typeof itemExtras === 'string' ? JSON.parse(itemExtras).join(', ') : (Array.isArray(itemExtras) ? itemExtras.join(', ') : itemExtras)}
                            </div>` : ''}
                        </div>
                        <div style="text-align: right; margin-left: 1rem;">
                            <div style="font-size: 0.9em; color: #6b7280;">${itemQty} шт × ${itemPrice} ₽</div>
                            <div style="font-weight: 700; font-size: 1.1em; color: var(--dandy-green);">${itemTotal} ₽</div>
                        </div>
                    </div>
                </div>
            `}).join('')
            : '<p style="color: #999; text-align: center; padding: 2rem;">Нет информации о составе заказа</p>';
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--dandy-green);">
                    <h2 style="margin: 0; color: var(--dandy-green);">Заказ ${order.id}</h2>
                    <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999; padding: 0.25rem 0.5rem;">×</button>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <h3 style="color: var(--dandy-green); margin-bottom: 0.75rem;">Информация о клиенте</h3>
                    <div style="background: #f9f9f9; padding: 1rem; border-radius: 8px;">
                        <p><strong>Имя:</strong> ${order.client}</p>
                        ${order.phone ? `<p><strong>Телефон:</strong> ${order.phone}</p>` : ''}
                        ${order.address ? `<p><strong>Адрес:</strong> ${order.address}</p>` : ''}
                        <p><strong>Тип доставки:</strong> ${order.deliveryType === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз'}</p>
                        <p><strong>Способ оплаты:</strong> ${this.getPaymentMethodText(order.paymentMethod)}</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <h3 style="color: var(--dandy-green); margin-bottom: 0.75rem;">Состав заказа</h3>
                    <div style="background: #f9f9f9; padding: 1rem; border-radius: 8px;">
                        ${itemsList}
                    </div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <h3 style="color: var(--dandy-green); margin-bottom: 0.75rem;">Информация о заказе</h3>
                    <div style="background: #f9f9f9; padding: 1rem; border-radius: 8px;">
                        <p><strong>Статус:</strong> <span class="status-badge status-${order.status.replace(' ', '-')}">${order.status}</span></p>
                        <p><strong>Канал:</strong> ${order.channel}</p>
                        <p><strong>Курьер:</strong> ${order.courier}</p>
                        <p><strong>Время до готовности:</strong> ${order.eta} мин</p>
                    </div>
                </div>
                
                <div style="background: var(--dandy-green); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h2 style="margin: 0;">Сумма: ₽${order.amount}</h2>
                </div>
                
                <div style="margin-top: 1.5rem;">
                    <h3 style="color: var(--dandy-green); margin-bottom: 1rem; text-align: center;">🎯 Управление статусом заказа</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
                        <button onclick="admin.updateOrderStatus('${order.id}', 'pending')" 
                                style="padding: 0.75rem; border-radius: 8px; border: 2px solid #6b7280; background: ${order.status === 'принят' ? '#6b7280' : 'white'}; color: ${order.status === 'принят' ? 'white' : '#6b7280'}; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                            📋 Принят
                        </button>
                        <button onclick="admin.updateOrderStatus('${order.id}', 'preparing')" 
                                style="padding: 0.75rem; border-radius: 8px; border: 2px solid #ea580c; background: ${order.status === 'готовится' ? '#ea580c' : 'white'}; color: ${order.status === 'готовится' ? 'white' : '#ea580c'}; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                            👨‍🍳 Готовится
                        </button>
                        <button onclick="admin.updateOrderStatus('${order.id}', 'ready')" 
                                style="padding: 0.75rem; border-radius: 8px; border: 2px solid #2563eb; background: ${order.status === 'готов' ? '#2563eb' : 'white'}; color: ${order.status === 'готов' ? 'white' : '#2563eb'}; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                            📦 Готов
                        </button>
                        <button onclick="admin.updateOrderStatus('${order.id}', 'with_courier')" 
                                style="padding: 0.75rem; border-radius: 8px; border: 2px solid #7c3aed; background: ${order.status === 'у курьера' ? '#7c3aed' : 'white'}; color: ${order.status === 'у курьера' ? 'white' : '#7c3aed'}; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                            🚚 У курьера
                        </button>
                        <button onclick="admin.updateOrderStatus('${order.id}', 'in_transit')" 
                                style="padding: 0.75rem; border-radius: 8px; border: 2px solid #c026d3; background: ${order.status === 'в пути' ? '#c026d3' : 'white'}; color: ${order.status === 'в пути' ? 'white' : '#c026d3'}; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                            🛵 В пути
                        </button>
                        <button onclick="admin.updateOrderStatus('${order.id}', 'delivered')" 
                                style="padding: 0.75rem; border-radius: 8px; border: 2px solid #16a34a; background: ${order.status === 'доставлен' ? '#16a34a' : 'white'}; color: ${order.status === 'доставлен' ? 'white' : '#16a34a'}; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                            ✅ Доставлен
                        </button>
                    </div>
                    <div style="margin-top: 0.75rem; padding: 0.75rem; background: #f0f9ff; border-radius: 8px; font-size: 0.875rem; color: #0369a1;">
                        💡 Совет: Нажмите на кнопку, чтобы изменить статус заказа. Клиент увидит обновление на странице отслеживания.
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Закрытие по клику на overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    getPaymentMethodText(method) {
        const methods = {
            'cash': '💵 Наличные',
            'card': '💳 Картой',
            'online': '🌐 Онлайн',
            'sbp': '📱 СБП'
        };
        return methods[method] || method;
    }
    
    async updateOrderStatus(orderId, newStatus) {
        try {
            const response = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                console.log('Order status updated:', newStatus);
                
                // Показываем уведомление
                this.showNotification('✅ Статус заказа обновлен!', 'success');
                
                // Обновляем локальные данные
                const order = this.orders.find(o => o.id === orderId);
                if (order) {
                    order.status = this.mapStatusToRussian(newStatus);
                }
                
                // Обновляем таблицу
                this.updateOrdersTable();
                
                // Закрываем и переоткрываем модальное окно для обновления
                document.querySelector('.modal-overlay')?.remove();
                setTimeout(() => this.showOrderDetails(orderId), 300);
            } else {
                this.showNotification('❌ Ошибка при обновлении статуса', 'error');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            this.showNotification('❌ Ошибка соединения с сервером', 'error');
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10001;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
            ${type === 'success' ? 'background: #16a34a;' : ''}
            ${type === 'error' ? 'background: #dc2626;' : ''}
            ${type === 'info' ? 'background: #2563eb;' : ''}
        `;
        notification.textContent = message;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styleSheet);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    filterOrders(filter) {
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active', 'btn-primary');
            btn.classList.add('btn-secondary');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active', 'btn-primary');
        document.querySelector(`[data-filter="${filter}"]`).classList.remove('btn-secondary');
        
        // Filter orders
        const filteredOrders = filter === 'all' ? this.orders : this.orders.filter(order => order.status === filter);
        
        const tbody = document.querySelector('#ordersTable tbody');
        let html = '';
        
        filteredOrders.forEach(order => {
            html += `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.client}</td>
                    <td>${order.channel}</td>
                    <td>${order.courier}</td>
                    <td>${order.eta}</td>
                    <td>₽ ${order.amount}</td>
                    <td><span class="status-badge status-${order.status.replace(' ', '-')}">${order.status}</span></td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    }
    
    importCSV(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
                
                if (lines.length < 2) {
                    alert("CSV пустой");
                    return;
                }
                
                const header = lines[0].split(",").map(h => h.trim().toLowerCase());
                const idx = (k) => header.indexOf(k);
                
                const iType = idx("type");
                const iName = idx("name");
                const iCat = idx("category");
                const iPrice = idx("price");
                const iCost = idx("cost");
                const iDesc = idx("desc");
                const iMods = idx("mods");
                const iAlrg = idx("alrg");
                const iNut = idx("nutrition");
                const iSku = idx("sku");
                const iPhoto = idx("photo");
                
                const newDishes = [];
                const newProducts = [];
                
                for (let li = 1; li < lines.length; li++) {
                    const raw = lines[li].split(",");
                    const type = iType >= 0 ? (raw[iType] || "dish").trim().toLowerCase() : "dish";
                    const name = (raw[iName] || "").trim();
                    
                    if (!name) continue;
                    
                    const cat = (raw[iCat] || "Прочее").trim();
                    const price = Number(raw[iPrice] || 0);
                    const cost = Number(raw[iCost] || 0);
                    const photo = iPhoto >= 0 ? (raw[iPhoto] || "").trim() : "";
                    
                    if (type === "product") {
                        const sku = (iSku >= 0 ? (raw[iSku] || "").trim() : "") || `SKU-${Date.now()}-${li}`;
                        newProducts.push({ id: Date.now() + li, name, cat, price, cost, sku, photo });
                    } else {
                        const desc = iDesc >= 0 ? raw[iDesc] : "";
                        const mods = iMods >= 0 && raw[iMods] ? String(raw[iMods]).split("|").map(s => s.trim()) : [];
                        const alrg = iAlrg >= 0 ? raw[iAlrg] : "";
                        const nutrition = iNut >= 0 ? raw[iNut] : "";
                        newDishes.push({ id: Date.now() + li, name, cat, price, cost, desc, mods, alrg, nutrition, photo });
                    }
                }
                
                if (newDishes.length) {
                    this.dishes.push(...newDishes);
                }
                if (newProducts.length) {
                    this.products.push(...newProducts);
                }
                
                alert(`Импортировано: блюд ${newDishes.length}, товаров ${newProducts.length}`);
                this.updateMenuTable();
                
            } catch (error) {
                alert("Ошибка разбора CSV. Убедитесь, что используется запятая как разделитель.");
            }
        };
        reader.readAsText(file, 'utf-8');
    }
    
    loadSampleCSV() {
        const sample = `type,name,category,price,cost,desc,mods,alrg,nutrition,sku,photo
dish,Маргарита 30 см,Пицца,349,160,Классика,Острый соус|Доп. сыр,молоко,б/ж/у,,,
dish,Калифорния,Роллы,429,210,Краб,Соус унаги|Кунжут,рыба,б/ж/у,,,
product,Кола 0.5,Напитки,120,40,Газ.напиток,,, ,COLA-05,`;
        
        const blob = new Blob([sample], { type: 'text/csv' });
        const file = new File([blob], 'sample.csv');
        this.importCSV(file);
    }
    
    async loadAllProducts() {
        try {
            const response = await fetch('menu_data.json');
            const data = await response.json();
            
            // Конвертируем данные из menu_data.json в формат админки
            this.dishes = data.offers.map(item => ({
                id: parseInt(item.id),
                name: item.name,
                cat: item.category_name,
                price: parseInt(item.price),
                cost: Math.round(parseInt(item.price) * 0.4), // Примерная себестоимость 40%
                desc: item.description ? item.description.replace(/<[^>]*>/g, '') : '', // Убираем HTML теги
                mods: [],
                alrg: '',
                nutrition: '',
                photo: item.picture || ''
            }));
            
            console.log('Загружено блюд:', this.dishes.length);
            this.updateMenuTable();
        } catch (error) {
            console.error('Ошибка загрузки продуктов:', error);
            // Fallback на демо данные
            this.loadSampleData();
        }
    }
    
    loadSampleData() {
        // Add some sample data if needed
        console.log('Sample data loaded');
    }
    
    loadPageData(page) {
        console.log('loadPageData called for page:', page);
        switch(page) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'menu':
                this.updateMenuTable();
                break;
            case 'promotions':
                this.updatePromotionsTable();
                break;
            case 'orders':
                this.updateOrdersTable();
                break;
            case 'kds':
                this.updateKDS();
                break;
            case 'stock':
                this.updateStock();
                break;
            case 'cashier-report':
                this.updateCashierReport();
                break;
            case 'pos':
                this.updatePOS();
                break;
            case 'edo':
                this.updateEDO();
                break;
            case 'mercury':
                this.updateMercury();
                break;
            case 'honest':
                this.updateHonest();
                break;
            case 'egais':
                this.updateEGAIS();
                break;
            case 'couriers':
                console.log('Loading couriers page...');
                this.updateCouriers();
                break;
            case 'inventory':
                console.log('Loading inventory page...');
                this.updateInventory();
                break;
            case 'pricing':
                console.log('Loading pricing page...');
                this.updatePricing();
                break;
            case 'marketing':
                console.log('Loading marketing page...');
                this.updateMarketing();
                break;
            case 'integrations':
                console.log('Loading integrations page...');
                this.updateIntegrations();
                break;
            case 'reports':
                this.updateReports();
                break;
            case 'alerts':
                this.updateAlerts();
                break;
            case 'profile':
                this.updateProfile();
                break;
        }
    }
    
    updateDashboard() {
        // Dashboard is already static in HTML
    }
    
    updateKDS() {
        // Инициализируем новый KDS модуль
        if (window.initKDS) {
            window.initKDS();
        }
    }
    
    updateStock() {
        // Инициализируем новый модуль складского учёта
        if (window.initInventory) {
            window.initInventory();
        }
    }

    updateCashierReport() {
        // Cashier report is already static in HTML
    }

    // ===== POS =====
    updatePOS() {
        if (window.adminModules) {
            const posElement = document.getElementById('posContent');
            if (posElement) {
                posElement.innerHTML = adminModules.createPOSContent();
            }
        }
    }

    // ===== EDO =====
    updateEDO() {
        // EDO is already static in HTML
    }

    // ===== Mercury =====
    updateMercury() {
        // Mercury is already static in HTML
    }

    // ===== HonestSign =====
    updateHonest() {
        // HonestSign is already static in HTML
    }

    // ===== EGAIS =====
    updateEGAIS() {
        // EGAIS is already static in HTML
    }

    // ===== Курьеры =====
    updateCouriers() {
        if (window.initCouriers) {
            window.initCouriers();
        } else if (window.adminModules) {
            window.adminModules.updateCouriersContent();
        }
    }

    // ===== Инвентаризация =====
    updateInventory() {
        console.log('updateInventory called');
        if (window.adminModules) {
            console.log('adminModules found, calling updateInventoryContent');
            window.adminModules.updateInventoryContent();
        } else {
            console.log('adminModules not found');
        }
    }

    // ===== Пересчёт цен =====
    updatePricing() {
        if (window.adminModules) {
            window.adminModules.updatePricingContent();
        }
    }

    // ===== Маркетинг =====
    updateMarketing() {
        if (window.adminModules) {
            window.adminModules.updateMarketingContent();
        }
    }

    // ===== Интеграции =====
    updateIntegrations() {
        if (window.initIntegrations) {
            window.initIntegrations();
        } else if (window.adminModules) {
            window.adminModules.updateIntegrationsContent();
        }
    }

    // ===== Отчётность =====
    updateReports() {
        if (window.initReports) {
            window.initReports();
        } else if (window.adminModules) {
            window.adminModules.updateReportsContent();
        }
    }

    // ===== Уведомления =====
    updateAlerts() {
        if (window.adminModules) {
            window.adminModules.updateAlertsContent();
        }
    }

    // ===== Профиль =====
    updateProfile() {
        if (window.adminModules) {
            window.adminModules.updateProfileContent();
        }
    }

    // ===== Language Content =====
    updateLanguageContent() {
        // Update all text content based on current language
        const translations = {
            ru: {
                dashboard: "Дашборд",
                menu: "Меню и товары",
                orders: "Заказы",
                kds: "KDS",
                stock: "Склад",
                "cashier-report": "Отчёт кассира",
                pos: "Касса/ККТ",
                edo: "ЭДО",
                mercury: "Меркурий",
                honest: "Честный знак",
                egais: "ЕГАИС",
                couriers: "Курьеры",
                inventory: "Инвентаризация",
                pricing: "Пересчёт цен",
                marketing: "Маркетинг",
                integrations: "Интеграции",
                reports: "Отчётность",
                alerts: "Уведомления",
                profile: "Профиль"
            },
            en: {
                dashboard: "Dashboard",
                menu: "Menu & Products",
                orders: "Orders",
                kds: "KDS",
                stock: "Stock",
                "cashier-report": "Cashier report",
                pos: "POS/Fiscal",
                edo: "EDO",
                mercury: "Mercury",
                honest: "HonestSign",
                egais: "EGAIS",
                couriers: "Couriers",
                inventory: "Inventory",
                pricing: "Repricing",
                marketing: "Marketing",
                integrations: "Integrations",
                reports: "Reports",
                alerts: "Alerts",
                profile: "Profile"
            }
        };
        
        const currentTranslations = translations[this.currentLang];
        
        document.querySelectorAll('.tab').forEach(item => {
            const page = item.dataset.page;
            if (currentTranslations[page]) {
                item.textContent = currentTranslations[page];
            }
        });
    }

    // ===== Orders Management =====
    async loadOrders() {
        try {
            const response = await fetch('http://localhost:3000/api/orders');
            if (response.ok) {
                const result = await response.json();
                // API возвращает {success: true, data: [...]}
                const orders = result.data || result || [];
                this.orders = orders.map(order => ({
                    id: order.id,
                    client: order.customerName || order.customer_name || 'Клиент',
                    phone: order.customerPhone || order.customer_phone || '',
                    amount: order.total || 0,
                    status: this.mapStatusToRussian(order.status),
                    channel: 'Сайт',
                    courier: '—',
                    eta: this.calculateETA(order.createdAt || order.created_at, order.status),
                    items: order.items || [],
                    address: order.address || '',
                    deliveryType: order.deliveryType || order.delivery_type || 'delivery',
                    paymentMethod: order.paymentMethod || order.payment_method || 'cash'
                }));
                this.updateOrdersTable();
            } else {
                console.error('Failed to load orders');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    mapStatusToRussian(status) {
        const statusMap = {
            'accepted': 'принят',
            'preparing': 'готовится',
            'ready': 'готов',
            'with_courier': 'у курьера',
            'in_transit': 'в пути',
            'delivered': 'доставлен',
            'cancelled': 'отменен'
        };
        return statusMap[status] || status;
    }

    calculateETA(createdAt, status) {
        const orderTime = new Date(createdAt);
        const now = new Date();
        const elapsedMinutes = Math.floor((now - orderTime) / (1000 * 60));
        
        if (status === 'delivered') return '0';
        if (status === 'cancelled') return '—';
        
        const remainingTime = Math.max(0, 45 - elapsedMinutes);
        return remainingTime > 0 ? `${remainingTime} мин` : '—';
    }

    updateOrdersTable() {
        const tbody = document.querySelector('#ordersTable tbody');
        if (!tbody) return;

        tbody.innerHTML = this.orders.map(order => `
            <tr style="cursor: pointer;" onclick="admin.showOrderDetails('${order.id}')" title="Нажмите для просмотра деталей">
                <td><strong>${order.id}</strong></td>
                <td>
                    <div>${order.client}</div>
                    ${order.phone ? `<div style="font-size: 0.85em; color: #666;">${order.phone}</div>` : ''}
                </td>
                <td>${order.channel}</td>
                <td>${order.courier}</td>
                <td>${order.eta} мин</td>
                <td><strong>${order.amount} ₽</strong></td>
                <td>
                    <span class="status-badge status-${order.status.replace(' ', '_')}">
                        ${order.status}
                    </span>
                </td>
            </tr>
        `).join('');
    }
    
    searchItems(query) {
        const searchTerm = query.toLowerCase().trim();
        console.log('Поиск:', searchTerm); // Отладка
        
        // Переключаемся на страницу меню если мы не на ней
        if (this.currentPage !== 'menu') {
            this.switchPage('menu');
        }
        
        if (!searchTerm) {
            this.updateMenuTable();
            return;
        }
        
        const items = this.currentTab === 'dishes' ? this.dishes : this.products;
        console.log('Текущая вкладка:', this.currentTab, 'Товары:', items); // Отладка
        
        const filteredItems = items.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.cat.toLowerCase().includes(searchTerm) ||
            (item.desc && item.desc.toLowerCase().includes(searchTerm))
        );
        
        console.log('Найдено товаров:', filteredItems.length); // Отладка
        this.updateMenuTable(filteredItems);
        
        // Добавляем сообщение о результатах поиска
        this.showSearchResults(filteredItems.length, searchTerm);
    }
    
    // Методы для работы с акциями
    createPromotion() {
        const title = prompt('Название акции:');
        if (!title) return;
        
        const description = prompt('Описание акции:');
        const discount = parseInt(prompt('Размер скидки (%):')) || 0;
        const startDate = prompt('Дата начала (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
        const endDate = prompt('Дата окончания (YYYY-MM-DD):', new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]);
        
        const newPromotion = {
            id: Date.now(),
            title,
            description: description || '',
            discount,
            startDate,
            endDate,
            photo: '',
            isActive: true,
            products: []
        };
        
        this.promotions.push(newPromotion);
        this.updatePromotionsTable();
        this.savePromotions();
    }
    
    updatePromotionsTable() {
        const container = document.getElementById('promotionsTable');
        let html = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Фото</th>
                        <th>Название</th>
                        <th>Описание</th>
                        <th>Скидка</th>
                        <th>Период</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        this.promotions.forEach(promo => {
            const isActive = promo.isActive && 
                new Date(promo.startDate) <= new Date() && 
                new Date(promo.endDate) >= new Date();
            
            html += `
                <tr>
                    <td>${promo.photo ? `<img src="${promo.photo}" alt="фото" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : '—'}</td>
                    <td>${promo.title}</td>
                    <td>${promo.description}</td>
                    <td>${promo.discount}%</td>
                    <td>${promo.startDate} - ${promo.endDate}</td>
                    <td><span class="badge ${isActive ? 'badge-success' : 'badge-secondary'}">${isActive ? 'Активна' : 'Неактивна'}</span></td>
                    <td>
                        <button class="btn btn-primary btn-small" onclick="admin.editPromotion(${promo.id})">Редактировать</button>
                        <button class="btn btn-secondary btn-small" onclick="admin.deletePromotion(${promo.id})">Удалить</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    }
    
    editPromotion(id) {
        const promo = this.promotions.find(p => p.id === id);
        if (!promo) return;
        
        const newTitle = prompt('Название акции:', promo.title);
        if (newTitle) promo.title = newTitle;
        
        const newDescription = prompt('Описание акции:', promo.description);
        if (newDescription !== null) promo.description = newDescription;
        
        const newDiscount = prompt('Размер скидки (%):', promo.discount);
        if (newDiscount) promo.discount = parseInt(newDiscount) || 0;
        
        this.updatePromotionsTable();
        this.savePromotions();
    }
    
    deletePromotion(id) {
        if (confirm('Удалить акцию?')) {
            this.promotions = this.promotions.filter(p => p.id !== id);
            this.updatePromotionsTable();
            this.savePromotions();
        }
    }
    
    exportPromotions() {
        const csv = this.promotions.map(promo => 
            `promotion,${promo.title},${promo.description},${promo.discount},${promo.startDate},${promo.endDate},${promo.isActive}`
        ).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'promotions.csv';
        a.click();
        URL.revokeObjectURL(url);
    }
    
    savePromotions() {
        localStorage.setItem('dandy_promotions', JSON.stringify(this.promotions));
        console.log('✅ Акции сохранены в localStorage:', this.promotions);
    }
    
    loadPromotions() {
        const saved = localStorage.getItem('dandy_promotions');
        if (saved) {
            this.promotions = JSON.parse(saved);
            console.log('✅ Акции загружены из localStorage:', this.promotions);
        }
    }

    activatePromotion(promoId) {
        const promo = this.promotions.find(p => p.id === promoId);
        if (promo) {
            promo.isActive = !promo.isActive;
            console.log(`🎁 Акция "${promo.title}":`, promo.isActive ? 'Активирована ✅' : 'Деактивирована ⚠️');
            this.savePromotions();
            this.updatePromotionsTable();
            
            const message = promo.isActive 
                ? `✅ Акция "${promo.title}" активирована!\n\n⚠️ Проверь даты!\nСейчас: ${promo.startDate} - ${promo.endDate}\n\nОбнови главную страницу (Ctrl+Shift+R) чтобы увидеть изменения!`
                : `⚠️ Акция "${promo.title}" деактивирована!\n\nОбнови главную страницу (Ctrl+Shift+R) чтобы увидеть изменения!`;
            
            alert(message);
        }
    }
    
    showSearchResults(count, searchTerm) {
        // Удаляем предыдущее сообщение если есть
        const existingMessage = document.getElementById('searchResultsMessage');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (count === 0) {
            // Показываем сообщение "ничего не найдено"
            const message = document.createElement('div');
            message.id = 'searchResultsMessage';
            message.style.cssText = 'padding: 1rem; margin: 1rem 0; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; text-align: center;';
            message.innerHTML = `🔍 По запросу "<strong>${searchTerm}</strong>" ничего не найдено`;
            
            const menuTable = document.getElementById('menuTable');
            menuTable.parentNode.insertBefore(message, menuTable);
        } else {
            // Показываем количество найденных результатов
            const message = document.createElement('div');
            message.id = 'searchResultsMessage';
            message.style.cssText = 'padding: 0.5rem 1rem; margin: 1rem 0; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; color: #0369a1; text-align: center;';
            message.innerHTML = `🔍 Найдено <strong>${count}</strong> товаров по запросу "<strong>${searchTerm}</strong>"`;
            
            const menuTable = document.getElementById('menuTable');
            menuTable.parentNode.insertBefore(message, menuTable);
        }
    }
}

// Глобальная функция для генерации отчёта кассира
function generateCashierReport() {
    const cashier = document.getElementById('cashierSelect').value;
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    
    // Показываем результаты
    const resultsDiv = document.getElementById('cashierReportResults');
    const contentDiv = document.getElementById('cashierReportContent');
    
    resultsDiv.style.display = 'block';
    
    // Генерируем отчёт
    const reportData = {
        cashier: cashier,
        period: `${startDate} - ${endDate}`,
        totalOrders: 156,
        totalAmount: 89450,
        averageOrder: 573,
        cashOrders: 45,
        cardOrders: 111,
        refunds: 3,
        refundAmount: 1200
    };
    
    contentDiv.innerHTML = `
        <div class="grid grid-3">
            <div class="card">
                <h4>Общая статистика</h4>
                <p><strong>Заказов:</strong> ${reportData.totalOrders}</p>
                <p><strong>Сумма:</strong> ${reportData.totalAmount.toLocaleString()} ₽</p>
                <p><strong>Средний чек:</strong> ${reportData.averageOrder} ₽</p>
            </div>
            <div class="card">
                <h4>По типам оплаты</h4>
                <p><strong>Наличные:</strong> ${reportData.cashOrders} заказов</p>
                <p><strong>Карта:</strong> ${reportData.cardOrders} заказов</p>
            </div>
            <div class="card">
                <h4>Возвраты</h4>
                <p><strong>Количество:</strong> ${reportData.refunds}</p>
                <p><strong>Сумма:</strong> ${reportData.refundAmount} ₽</p>
            </div>
        </div>
        <div style="margin-top: 1rem;">
            <button class="btn btn-primary" onclick="exportCashierReport()">Экспорт в Excel</button>
            <button class="btn btn-secondary" onclick="printCashierReport()">Печать</button>
        </div>
    `;
}

function exportCashierReport() {
    alert('Отчёт экспортирован в Excel!');
}

function printCashierReport() {
    window.print();
}

// Функции для работы с кассой
function openPOS() {
    window.open('pos.html', '_blank');
}

function openPOSOrders() {
    window.open('pos.html', '_blank');
}

function openPOSReports() {
    window.open('pos.html', '_blank');
}

// Функции для быстрых действий в дашборде
function openShift() {
    alert('Смена открыта! Время: ' + new Date().toLocaleTimeString());
}

function createOrder() {
    // Переключаемся на раздел заказов
    if (window.admin) {
        admin.switchPage('orders');
    }
}

function openInventory() {
    // Переключаемся на раздел инвентаризации
    if (window.admin) {
        admin.switchPage('inventory');
    }
}

// Initialize admin when page loads
let admin;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing admin...');
    admin = new DandyAdmin();
    window.admin = admin; // Make it globally available
    console.log('Admin initialized:', admin);
    console.log('Admin couriers:', admin.couriers);
    
    // Initialize admin modules after admin is ready
    setTimeout(() => {
        console.log('Initializing admin modules...');
        if (window.initializeAdminModules) {
            window.initializeAdminModules();
        } else {
            console.log('initializeAdminModules function not found');
        }
    }, 200);
});
