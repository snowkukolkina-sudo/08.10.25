// Дополнительные модули для DANDY CRM
// Расширенная функциональность для всех разделов админки

class AdminModules {
    constructor(adminInstance) {
        this.admin = adminInstance;
        this.initModules();
    }
    
    initModules() {
        console.log('AdminModules: Initializing modules...');
        this.initPOS();
        this.initCouriers();
        this.initInventory();
        this.initPricing();
        this.initMarketing();
        this.initIntegrations();
        this.initReports();
        this.initAlerts();
        this.initProfile();
        console.log('AdminModules: All modules initialized');
    }
    
    // ===== POS (Касса/ККТ) =====
    initPOS() {
        this.posCart = [];
        this.posCurrentCategory = 'Все';
        this.posCategories = ['Все'];
        this.posEditingItem = null;
        this.posTechModal = null;
    }
    
    createPOSContent() {
        const catalogItems = [...this.admin.dishes, ...this.admin.products];
        this.posCategories = ['Все', ...Array.from(new Set(catalogItems.map(i => i.cat)))];
        
        return `
            <div class="grid" style="grid-template-columns: 200px 1fr 360px; gap: 1rem;">
                <div class="card">
                    <h3 class="card-title">Категории</h3>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${this.posCategories.map(cat => `
                            <button class="btn ${cat === this.posCurrentCategory ? 'btn-primary' : 'btn-secondary'} btn-small" 
                                    onclick="adminModules.setPOSCategory('${cat}')">${cat}</button>
                        `).join('')}
                    </div>
                    
                    <div style="margin-top: 1rem;">
                        <div class="form-label">Быстрая позиция</div>
                        <input type="text" id="quickName" placeholder="Название" class="form-input" style="margin-bottom: 0.5rem;">
                        <input type="number" id="quickPrice" placeholder="Цена, ₽" class="form-input" style="margin-bottom: 0.5rem;">
                        <button class="btn btn-primary btn-small" onclick="adminModules.addQuickItem()">Добавить в чек</button>
                    </div>
                </div>
                
                <div class="card">
                    <h3 class="card-title">Меню</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem;">
                        ${this.getPOSMenuItems(catalogItems).map(item => `
                            <div style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 0.5rem; background: white;">
                                <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;">${item.name}</div>
                                <div style="font-size: 0.8rem; color: #666; margin-bottom: 0.5rem;">${item.cat}</div>
                                ${item.photo ? `<img src="${item.photo}" alt="фото" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem;">` : 
                                  '<div style="width: 100%; height: 80px; background: #f5f5f5; border-radius: 4px; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: #999;">нет фото</div>'}
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="font-weight: 700;">₽ ${item.price}</div>
                                    <div style="display: flex; gap: 0.25rem;">
                                        <button class="btn btn-primary btn-small" onclick="adminModules.addToPOSCart(${item.id})">В чек</button>
                                        <button class="btn btn-secondary btn-small" onclick="adminModules.openTechModal(${item.id})">Техкарта</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="card">
                    <h3 class="card-title">Чек</h3>
                    <div id="posCart">
                        ${this.renderPOSCart()}
                    </div>
                </div>
            </div>
            
            ${this.renderTechModal()}
        `;
    }
    
    getPOSMenuItems(catalogItems) {
        return catalogItems.filter(item => 
            this.posCurrentCategory === 'Все' || item.cat === this.posCurrentCategory
        );
    }
    
    setPOSCategory(category) {
        this.posCurrentCategory = category;
        this.updatePOSContent();
    }
    
    addToPOSCart(itemId) {
        const catalogItems = [...this.admin.dishes, ...this.admin.products];
        const item = catalogItems.find(i => i.id === itemId);
        
        if (!item) return;
        
        const existingItem = this.posCart.find(cartItem => cartItem.itemId === itemId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.posCart.push({
                key: Date.now() + Math.random(),
                itemId: itemId,
                name: item.name,
                price: item.price,
                quantity: 1
            });
        }
        
        this.updatePOSCart();
    }
    
    addQuickItem() {
        const name = document.getElementById('quickName').value;
        const price = parseFloat(document.getElementById('quickPrice').value) || 0;
        
        if (!name || !price) {
            alert('Заполните название и цену');
            return;
        }
        
        this.posCart.push({
            key: Date.now() + Math.random(),
            itemId: null,
            name: name,
            price: price,
            quantity: 1
        });
        
        document.getElementById('quickName').value = '';
        document.getElementById('quickPrice').value = '';
        this.updatePOSCart();
    }
    
    updatePOSCart() {
        const cartElement = document.getElementById('posCart');
        if (!cartElement) return;
        
        cartElement.innerHTML = this.renderPOSCart();
    }
    
    renderPOSCart() {
        if (this.posCart.length === 0) {
            return '<div style="text-align: center; color: #666; padding: 2rem;">Корзина пуста</div>';
        }
        
        const total = this.posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        return `
            <div style="space-y: 0.5rem;">
                ${this.posCart.map(item => `
                    <div style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem; background: white;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-weight: 600;">${item.name}</div>
                            <button class="btn btn-secondary btn-small" onclick="adminModules.removeFromPOSCart('${item.key}')" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">×</button>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <button class="btn btn-secondary btn-small" onclick="adminModules.updatePOSQuantity('${item.key}', -1)" style="padding: 0.25rem 0.5rem;">-</button>
                                <span>${item.quantity}</span>
                                <button class="btn btn-secondary btn-small" onclick="adminModules.updatePOSQuantity('${item.key}', 1)" style="padding: 0.25rem 0.5rem;">+</button>
                            </div>
                            <div style="font-weight: 700;">₽ ${item.price * item.quantity}</div>
                        </div>
                    </div>
                `).join('')}
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-top: 1px solid #e5e5e5; font-weight: 700;">
                    <div>Итого</div>
                    <div>₽ ${total}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin: 1rem 0;">
                    <button class="btn btn-secondary btn-small">Нал</button>
                    <button class="btn btn-secondary btn-small">Карта</button>
                    <button class="btn btn-secondary btn-small">СБП</button>
                </div>
                
                <button class="btn btn-primary" onclick="adminModules.processPayment()" style="width: 100%; padding: 1rem;">Пробить чек</button>
            </div>
        `;
    }
    
    renderTechModal() {
        if (!this.posTechModal) {
            return '';
        }
        
        return `
            <div id="techModal" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
                <div style="background: white; border-radius: 15px; padding: 2rem; max-width: 500px; width: 90%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size: 1.25rem; font-weight: 700;">Техническая карта</h3>
                        <button onclick="adminModules.closeTechModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Название блюда</label>
                        <input type="text" id="techName" value="${this.posTechModal.name || ''}" class="form-input" style="width: 100%;">
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Ингредиенты</label>
                        <textarea id="techIngredients" rows="4" class="form-input" style="width: 100%;">${this.posTechModal.ingredients || ''}</textarea>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Технология приготовления</label>
                        <textarea id="techProcess" rows="4" class="form-input" style="width: 100%;">${this.posTechModal.process || ''}</textarea>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button class="btn btn-secondary" onclick="adminModules.closeTechModal()">Отмена</button>
                        <button class="btn btn-primary" onclick="adminModules.saveTechModal()">Сохранить</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    closeTechModal() {
        this.posTechModal = null;
        this.updatePOSContent();
    }
    
    saveTechModal() {
        const name = document.getElementById('techName').value;
        const ingredients = document.getElementById('techIngredients').value;
        const process = document.getElementById('techProcess').value;
        
        if (!name) {
            alert('Введите название блюда');
            return;
        }
        
        // Сохраняем техническую карту
        this.posTechModal = {
            name: name,
            ingredients: ingredients,
            process: process
        };
        
        alert('Техническая карта сохранена');
        this.closeTechModal();
    }
    
    updatePOSQuantity(key, change) {
        const item = this.posCart.find(cartItem => cartItem.key === key);
        if (!item) return;
        
        item.quantity += change;
        if (item.quantity <= 0) {
            this.posCart = this.posCart.filter(cartItem => cartItem.key !== key);
        }
        
        this.updatePOSCart();
    }
    
    removeFromPOSCart(key) {
        this.posCart = this.posCart.filter(cartItem => cartItem.key !== key);
        this.updatePOSCart();
    }
    
    processPayment() {
        const total = this.posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (total === 0) {
            alert('Корзина пуста');
            return;
        }
        
        // Simulate payment processing
        alert(`Чек на сумму ₽${total} успешно пробит!`);
        
        // Clear cart
        this.posCart = [];
        this.updatePOSCart();
        
        // Add to orders
        const newOrder = {
            id: Date.now(),
            client: "Касса",
            amount: total,
            status: "доставлен",
            channel: "Касса",
            courier: "—",
            eta: "0"
        };
        
        this.admin.orders.unshift(newOrder);
        this.admin.updateOrdersTable();
    }
    
    openTechModal(itemId) {
        const catalogItems = [...this.admin.dishes, ...this.admin.products];
        const item = catalogItems.find(i => i.id === itemId);
        
        if (!item) return;
        
        this.posEditingItem = item;
        this.showTechModal();
    }
    
    showTechModal() {
        const modal = document.createElement('div');
        modal.id = 'techModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 15px; padding: 2rem; width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="font-size: 1.5rem; font-weight: 700;">Техкарта - ${this.posEditingItem.name}</h3>
                    <button onclick="adminModules.closeTechModal()" style="background: #f5f5f5; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">×</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <div class="form-label">Описание</div>
                        <textarea id="techDescription" class="form-input" rows="4" placeholder="Описание блюда">${this.posEditingItem.desc || ''}</textarea>
                        
                        <div class="form-label" style="margin-top: 1rem;">Состав (ингредиенты)</div>
                        <textarea id="techComposition" class="form-input" rows="6" placeholder="ингредиент — граммы&#10;...">${this.posEditingItem.composition || ''}</textarea>
                    </div>
                    
                    <div>
                        <div class="form-label">Изображение</div>
                        <input type="file" id="techPhoto" accept="image/*" class="form-input">
                        ${this.posEditingItem.photo ? `<img src="${this.posEditingItem.photo}" alt="фото" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-top: 0.5rem;">` : ''}
                        
                        <div class="form-label" style="margin-top: 1rem;">Файлы (PDF/JPG и др.)</div>
                        <input type="file" id="techFiles" multiple class="form-input">
                        <div id="techFilesList" style="margin-top: 0.5rem;"></div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
                    <button class="btn btn-secondary" onclick="adminModules.closeTechModal()">Отмена</button>
                    <button class="btn btn-primary" onclick="adminModules.saveTechCard()">Сохранить</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle file uploads
        document.getElementById('techPhoto').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = modal.querySelector('img');
                    if (img) {
                        img.src = e.target.result;
                    } else {
                        const container = document.getElementById('techPhoto').parentNode;
                        const newImg = document.createElement('img');
                        newImg.src = e.target.result;
                        newImg.style.cssText = 'width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-top: 0.5rem;';
                        container.appendChild(newImg);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        
        document.getElementById('techFiles').addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            const filesList = document.getElementById('techFilesList');
            
            filesList.innerHTML = files.map((file, index) => `
                <div style="padding: 0.5rem; background: #f5f5f5; border-radius: 4px; margin-bottom: 0.25rem;">
                    ${file.name} (${(file.size / 1024).toFixed(1)} KB)
                </div>
            `).join('');
        });
    }
    
    closeTechModal() {
        const modal = document.getElementById('techModal');
        if (modal) {
            modal.remove();
        }
    }
    
    saveTechCard() {
        if (!this.posEditingItem) return;
        
        const description = document.getElementById('techDescription').value;
        const composition = document.getElementById('techComposition').value;
        
        // Update item
        const catalogItems = [...this.admin.dishes, ...this.admin.products];
        const itemIndex = catalogItems.findIndex(i => i.id === this.posEditingItem.id);
        
        if (itemIndex !== -1) {
            catalogItems[itemIndex].desc = description;
            catalogItems[itemIndex].composition = composition;
            
            // Update in admin data
            if (this.admin.dishes.find(d => d.id === this.posEditingItem.id)) {
                const dishIndex = this.admin.dishes.findIndex(d => d.id === this.posEditingItem.id);
                this.admin.dishes[dishIndex].desc = description;
                this.admin.dishes[dishIndex].composition = composition;
            } else {
                const productIndex = this.admin.products.findIndex(p => p.id === this.posEditingItem.id);
                this.admin.products[productIndex].desc = description;
                this.admin.products[productIndex].composition = composition;
            }
        }
        
        this.closeTechModal();
        alert('Техкарта сохранена!');
    }
    
    updatePOSContent() {
        const posElement = document.getElementById('pos');
        if (posElement) {
            posElement.innerHTML = this.createPOSContent();
        }
    }
    
    // ===== Курьеры =====
    initCouriers() {
        console.log('AdminModules: Initializing couriers...');
        this.courierStatuses = {
            'free': { label: 'Свободен', color: '#22c55e' },
            'to-order': { label: 'Едет на заказ', color: '#ef4444' },
            'back': { label: 'Передал, едет обратно', color: '#3b82f6' }
        };
        console.log('AdminModules: Couriers initialized, couriers data:', this.admin.couriers);
    }
    
    createCouriersContent() {
        console.log('createCouriersContent called, couriers:', this.admin.couriers);
        return `
            <div class="card">
                <h3 class="card-title">Управление курьерами</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Курьер</th>
                            <th>Телефон</th>
                            <th>Статус</th>
                            <th>Заказов сегодня</th>
                            <th>Рейтинг</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.admin.couriers.map(courier => `
                            <tr>
                                <td><strong>${courier.name}</strong></td>
                                <td>${courier.phone}</td>
                                <td>
                                    <span class="status-badge" style="background: ${this.courierStatuses[courier.status].color}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px;">
                                        ${this.courierStatuses[courier.status].label}
                                    </span>
                                </td>
                                <td>${courier.ordersToday || 0}</td>
                                <td>${courier.rating || '4.5'} ⭐</td>
                                <td>
                                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                        <button class="btn btn-primary btn-small" onclick="adminModules.updateCourierStatus(${courier.id}, 'to-order')">Едет на заказ</button>
                                        <button class="btn btn-primary btn-small" onclick="adminModules.updateCourierStatus(${courier.id}, 'back')">Передал, едет обратно</button>
                                        <button class="btn btn-secondary btn-small" onclick="adminModules.updateCourierStatus(${courier.id}, 'free')">Свободен</button>
                                        <button class="btn btn-secondary btn-small" onclick="adminModules.viewCourierDetails(${courier.id})">Подробнее</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="card">
                <h3 class="card-title">Добавить нового курьера</h3>
                <div class="grid grid-2">
                    <div>
                        <label class="form-label">Имя курьера</label>
                        <input type="text" id="newCourierName" class="form-input" placeholder="Введите имя">
                    </div>
                    <div>
                        <label class="form-label">Телефон</label>
                        <input type="tel" id="newCourierPhone" class="form-input" placeholder="+7 (999) 123-45-67">
                    </div>
                </div>
                <button class="btn btn-primary" onclick="adminModules.addNewCourier()">Добавить курьера</button>
            </div>
            
            <div class="card">
                <h3 class="card-title">Статистика курьеров</h3>
                <div class="grid grid-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">${this.admin.couriers.filter(c => c.status === 'free').length}</div>
                        <div class="text-sm text-gray-600">Свободны</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">${this.admin.couriers.reduce((sum, c) => sum + (c.ordersToday || 0), 0)}</div>
                        <div class="text-sm text-gray-600">Заказов сегодня</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-600">${this.admin.couriers.length}</div>
                        <div class="text-sm text-gray-600">Всего курьеров</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-orange-600">${(this.admin.couriers.reduce((sum, c) => sum + parseFloat(c.rating || 4.5), 0) / this.admin.couriers.length).toFixed(1)}</div>
                        <div class="text-sm text-gray-600">Средний рейтинг</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    updateCourierStatus(courierId, status) {
        const courier = this.admin.couriers.find(c => c.id === courierId);
        if (courier) {
            courier.status = status;
            this.updateCouriersContent();
        }
    }
    
    addNewCourier() {
        const name = document.getElementById('newCourierName').value;
        const phone = document.getElementById('newCourierPhone').value;
        
        if (!name || !phone) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        const newCourier = {
            id: this.admin.couriers.length + 1,
            name: name,
            phone: phone,
            status: 'free',
            ordersToday: 0,
            rating: '4.5'
        };
        
        this.admin.couriers.push(newCourier);
        this.updateCouriersContent();
        
        // Очистить поля
        document.getElementById('newCourierName').value = '';
        document.getElementById('newCourierPhone').value = '';
        
        alert('Курьер добавлен успешно!');
    }
    
    viewCourierDetails(courierId) {
        const courier = this.admin.couriers.find(c => c.id === courierId);
        if (courier) {
            alert(`Детали курьера:\n\nИмя: ${courier.name}\nТелефон: ${courier.phone}\nСтатус: ${this.courierStatuses[courier.status].label}\nЗаказов сегодня: ${courier.ordersToday || 0}\nРейтинг: ${courier.rating || '4.5'} ⭐`);
        }
    }
    
    updateCouriersContent() {
        console.log('updateCouriersContent called');
        console.log('Admin couriers data:', this.admin.couriers);
        const couriersElement = document.getElementById('couriersContent');
        console.log('couriersElement:', couriersElement);
        if (couriersElement) {
            console.log('Updating couriers content');
            const content = this.createCouriersContent();
            console.log('Generated content length:', content.length);
            couriersElement.innerHTML = content;
        } else {
            console.log('couriersElement not found');
        }
    }
    
    // ===== Инвентаризация =====
    initInventory() {
        this.inventoryPeople = [
            { id: 1, name: "Ирина", role: "повар" },
            { id: 2, name: "Денис", role: "повар" },
            { id: 3, name: "Светлана", role: "кладовщик" }
        ];
        
        this.inventoryItems = [
            { id: 1, name: "Сыр моцарелла", system: 4.5, fact: 0 },
            { id: 2, name: "Мука", system: 12, fact: 0 },
            { id: 3, name: "Лосось", system: 3.2, fact: 0 }
        ];
    }
    
    createInventoryContent() {
        console.log('createInventoryContent called');
        return `
            <div class="card">
                <h3 class="card-title">Назначение сотрудников</h3>
                <div class="grid grid-3">
                    ${this.inventoryPeople.map(person => `
                        <div class="card">
                            <h4>${person.name}</h4>
                            <p><strong>Роль:</strong> ${person.role}</p>
                            <p><strong>Статус:</strong> <span class="status-online">Активен</span></p>
                            <div class="flex gap-1 mt-2">
                                <button class="btn btn-primary btn-small" onclick="adminModules.assignTask('${person.name}', 'cooking')">Готовка</button>
                                <button class="btn btn-secondary btn-small" onclick="adminModules.assignTask('${person.name}', 'cleaning')">Уборка</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="card">
                <h3 class="card-title">Инвентаризация — кухня</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Товар</th>
                            <th>Система</th>
                            <th>Факт</th>
                            <th>Разница</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.inventoryItems.map(item => {
                            const difference = item.fact - item.system;
                            const status = difference > 0 ? 'surplus' : difference < 0 ? 'shortage' : 'ok';
                            const statusText = difference > 0 ? 'Излишек' : difference < 0 ? 'Недостача' : 'ОК';
                            const statusColor = difference > 0 ? '#22c55e' : difference < 0 ? '#ef4444' : '#3b82f6';
                            
                            return `
                                <tr>
                                    <td><strong>${item.name}</strong></td>
                                    <td>${item.system} кг</td>
                                    <td>
                                        <input type="number" step="0.1" value="${item.fact}" 
                                               onchange="adminModules.updateInventoryFact(${item.id}, this.value)"
                                               style="width: 80px; padding: 0.25rem; border: 1px solid #e5e5e5; border-radius: 4px;">
                                        кг
                                    </td>
                                    <td style="color: ${statusColor}; font-weight: bold;">${difference > 0 ? '+' : ''}${difference.toFixed(1)} кг</td>
                                    <td>
                                        <span style="background: ${statusColor}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px;">
                                            ${statusText}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="card">
                <h3 class="card-title">Добавить товар в инвентаризацию</h3>
                <div class="grid grid-3">
                    <div>
                        <label class="form-label">Название товара</label>
                        <input type="text" id="newInventoryItem" class="form-input" placeholder="Введите название">
                    </div>
                    <div>
                        <label class="form-label">Системное количество (кг)</label>
                        <input type="number" step="0.1" id="newInventorySystem" class="form-input" placeholder="0.0">
                    </div>
                    <div>
                        <label class="form-label">Фактическое количество (кг)</label>
                        <input type="number" step="0.1" id="newInventoryFact" class="form-input" placeholder="0.0">
                    </div>
                </div>
                <button class="btn btn-primary" onclick="adminModules.addInventoryItem()">Добавить товар</button>
            </div>
            
            <div class="card">
                <h3 class="card-title">Сводка инвентаризации</h3>
                <div class="grid grid-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">${this.inventoryItems.length}</div>
                        <div class="text-sm text-gray-600">Всего товаров</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">${this.inventoryItems.filter(item => item.fact > item.system).length}</div>
                        <div class="text-sm text-gray-600">Излишки</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-red-600">${this.inventoryItems.filter(item => item.fact < item.system).length}</div>
                        <div class="text-sm text-gray-600">Недостачи</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-600">${this.inventoryItems.filter(item => item.fact === item.system).length}</div>
                        <div class="text-sm text-gray-600">Совпадения</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    updateInventoryFact(itemId, value) {
        const item = this.inventoryItems.find(i => i.id === itemId);
        if (item) {
            item.fact = parseFloat(value) || 0;
            this.updateInventoryContent();
        }
    }
    
    addInventoryItem() {
        const name = document.getElementById('newInventoryItem').value;
        const system = parseFloat(document.getElementById('newInventorySystem').value) || 0;
        const fact = parseFloat(document.getElementById('newInventoryFact').value) || 0;
        
        if (!name) {
            alert('Пожалуйста, введите название товара');
            return;
        }
        
        const newItem = {
            id: this.inventoryItems.length + 1,
            name: name,
            system: system,
            fact: fact
        };
        
        this.inventoryItems.push(newItem);
        this.updateInventoryContent();
        
        // Очистить поля
        document.getElementById('newInventoryItem').value = '';
        document.getElementById('newInventorySystem').value = '';
        document.getElementById('newInventoryFact').value = '';
        
        alert('Товар добавлен в инвентаризацию!');
    }
    
    assignTask(personName, task) {
        const taskText = task === 'cooking' ? 'готовка' : 'уборка';
        alert(`Задача "${taskText}" назначена сотруднику ${personName}`);
    }
    
    updateInventoryContent() {
        console.log('updateInventoryContent called');
        const inventoryElement = document.getElementById('inventoryContent');
        console.log('inventoryElement:', inventoryElement);
        if (inventoryElement) {
            console.log('Updating inventory content');
            inventoryElement.innerHTML = this.createInventoryContent();
        } else {
            console.log('inventoryElement not found');
        }
    }
    
    // ===== Пересчёт цен =====
    initPricing() {
        this.pricingCost = 220;
        this.pricingMargin = 0.24;
    }
    
    createPricingContent() {
        const recommendedPrice = Math.ceil(this.pricingCost / Math.max(1 - this.pricingMargin, 0.0001) / 10) * 10;
        
        return `
            <div class="card">
                <h3 class="card-title">Пересчёт цен по росту закупок</h3>
                <div class="grid grid-3">
                    <div>
                        <div class="form-label">Новая себестоимость</div>
                        <input type="number" value="${this.pricingCost}" 
                               onchange="adminModules.updatePricingCost(this.value)"
                               class="form-input">
                    </div>
                    <div>
                        <div class="form-label">Целевая маржа</div>
                        <input type="number" step="0.01" value="${this.pricingMargin}" 
                               onchange="adminModules.updatePricingMargin(this.value)"
                               class="form-input">
                    </div>
                    <div style="display: flex; align-items: end;">
                        <div style="width: 100%; background: white; border-radius: 10px; padding: 1rem; border: 1px solid #e5e5e5; text-align: center;">
                            Реком. цена: <strong>₽ ${recommendedPrice}</strong>
                        </div>
                    </div>
                </div>
                <div style="font-size: 0.8rem; color: #666; margin-top: 1rem;">
                    Правило: фиксируем маржу, округление до 10₽.
                </div>
            </div>
        `;
    }
    
    updatePricingCost(value) {
        this.pricingCost = parseFloat(value) || 0;
        this.updatePricingContent();
    }
    
    updatePricingMargin(value) {
        this.pricingMargin = parseFloat(value) || 0;
        this.updatePricingContent();
    }
    
    updatePricingContent() {
        const pricingElement = document.getElementById('pricingContent');
        if (pricingElement) {
            pricingElement.innerHTML = this.createPricingContent();
        }
    }
    
    // ===== Маркетинг =====
    initMarketing() {
        this.marketingPlatforms = {
            ybiz: { name: "Яндекс Бизнес", connected: false, token: "", budget: 10000, clicks: 0, conv: 0 },
            ydirect: { name: "Яндекс Директ", connected: false, token: "", budget: 15000, clicks: 0, conv: 0 },
            gads: { name: "Google Ads", connected: false, token: "", budget: 20000, clicks: 0, conv: 0 },
            insta: { name: "Instagram Ads", connected: false, token: "", budget: 12000, clicks: 0, conv: 0 },
            fb: { name: "Facebook Ads", connected: false, token: "", budget: 15000, clicks: 0, conv: 0 }
        };
    }
    
    createMarketingContent() {
        return `
            <div class="card">
                <h3 class="card-title">Маркетинговые кабинеты</h3>
                <p>Подключение и быстрые параметры рекламных систем</p>
            </div>
            
            <div class="grid grid-3">
                ${Object.entries(this.marketingPlatforms).map(([key, platform]) => `
                    <div class="card">
                        <h4 style="font-weight: 600; margin-bottom: 1rem;">${platform.name}</h4>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox" ${platform.connected ? 'checked' : ''} 
                                       onchange="adminModules.updateMarketingConnection('${key}', this.checked)">
                                <span>${platform.connected ? 'подключено' : 'выключено'}</span>
                            </label>
                            <button class="btn btn-secondary btn-small">Проверить</button>
                        </div>
                        
                        <div class="grid grid-2" style="gap: 0.75rem;">
                            <div>
                                <div style="font-size: 0.9rem; margin-bottom: 0.25rem;">API токен</div>
                                <input type="text" value="${platform.token}" 
                                       onchange="adminModules.updateMarketingToken('${key}', this.value)"
                                       class="form-input" style="padding: 0.5rem;">
                            </div>
                            <div>
                                <div style="font-size: 0.9rem; margin-bottom: 0.25rem;">Бюджет, ₽</div>
                                <input type="number" value="${platform.budget}" 
                                       onchange="adminModules.updateMarketingBudget('${key}', this.value)"
                                       class="form-input" style="padding: 0.5rem;">
                            </div>
                        </div>
                        
                        <div style="font-size: 0.9rem; color: #666; margin: 1rem 0;">
                            Клики: ${platform.clicks} • Конверсии: ${platform.conv} • ROI: —
                        </div>
                        
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-primary btn-small">Создать кампанию</button>
                            <button class="btn btn-secondary btn-small">Отчёт</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    updateMarketingConnection(key, connected) {
        this.marketingPlatforms[key].connected = connected;
    }
    
    updateMarketingToken(key, token) {
        this.marketingPlatforms[key].token = token;
    }
    
    updateMarketingBudget(key, budget) {
        this.marketingPlatforms[key].budget = parseFloat(budget) || 0;
    }
    
    updateMarketingContent() {
        const marketingElement = document.getElementById('marketingContent');
        if (marketingElement) {
            marketingElement.innerHTML = this.createMarketingContent();
        }
    }
    
    // ===== Интеграции =====
    initIntegrations() {
        this.integrations = {
            aggregators: { yandex: true, delivery: true, vkusvill: false },
            accounting: { kontur: false, gainup: false, onec: false }
        };
        this.integrationLogs = [];
    }
    
    createIntegrationsContent() {
        return `
            <div class="card">
                <h3 class="card-title">Агрегаторы доставки</h3>
                <div class="grid grid-3">
                    ${this.createIntegrationToggle('Яндекс Еда', 'aggregators', 'yandex')}
                    ${this.createIntegrationToggle('Delivery', 'aggregators', 'delivery')}
                    ${this.createIntegrationToggle('ВкусВилл', 'aggregators', 'vkusvill')}
                </div>
            </div>
            
            <div class="card">
                <h3 class="card-title">Товароучетные системы</h3>
                <div class="grid grid-3">
                    ${this.createIntegrationToggle('Контур Маркет', 'accounting', 'kontur')}
                    ${this.createIntegrationToggle('Iiko/Gainup', 'accounting', 'gainup')}
                    ${this.createIntegrationToggle('1С', 'accounting', 'onec')}
                </div>
            </div>
            
            <div class="card">
                <h3 class="card-title">Журнал интеграций</h3>
                <div style="max-height: 200px; overflow-y: auto; background: rgba(255,255,255,0.5); border-radius: 8px; border: 1px solid #e5e5e5;">
                    <div style="padding: 1rem;">
                        ${this.integrationLogs.length === 0 ? 
                            '<div style="text-align: center; color: #666;">Лог пуст</div>' :
                            this.integrationLogs.map(log => `
                                <div style="font-size: 0.8rem; padding: 0.25rem 0; border-bottom: 1px solid #e5e5e5;">
                                    ${log.time} • ${log.msg}
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            </div>
        `;
    }
    
    createIntegrationToggle(label, category, key) {
        const checked = this.integrations[category][key];
        return `
            <div style="border-radius: 10px; border: 1px solid #e5e5e5; padding: 1rem; display: flex; align-items: center; justify-content: space-between;">
                <span>${label}</span>
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" ${checked ? 'checked' : ''} 
                           onchange="adminModules.updateIntegration('${category}', '${key}', this.checked)">
                    <span>${checked ? "включено" : "выключено"}</span>
                </label>
            </div>
        `;
    }
    
    updateIntegration(category, key, enabled) {
        this.integrations[category][key] = enabled;
        this.addIntegrationLog('info', `${key}: ${enabled ? 'вкл' : 'выкл'}`);
        this.updateIntegrationsContent();
    }
    
    addIntegrationLog(level, msg) {
        const time = new Date().toLocaleTimeString();
        this.integrationLogs.unshift({ time, level, msg });
        this.integrationLogs = this.integrationLogs.slice(0, 50); // Keep only last 50 logs
    }
    
    updateIntegrationsContent() {
        const integrationsElement = document.getElementById('integrationsContent');
        if (integrationsElement) {
            integrationsElement.innerHTML = this.createIntegrationsContent();
        }
    }
    
    // ===== Отчёты =====
    createReportsContent() {
        console.log('createReportsContent called');
        return `
            <div class="card">
                <h3 class="card-title">Финансовые отчёты</h3>
                <div class="grid grid-3">
                    <div class="card">
                        <h4>Отчёт по выручке</h4>
                        <p class="text-sm text-gray-600">Выручка за период с детализацией</p>
                        <div class="space-y-2 mt-2">
                            <input type="date" class="form-input" placeholder="Дата начала">
                            <input type="date" class="form-input" placeholder="Дата окончания">
                        </div>
                        <button class="btn btn-primary btn-small" onclick="adminModules.generateRevenueReport()">Создать отчёт</button>
                    </div>
                    <div class="card">
                        <h4>Отчёт по расходам</h4>
                        <p class="text-sm text-gray-600">Расходы на закупки и операционные</p>
                        <div class="space-y-2 mt-2">
                            <input type="date" class="form-input" placeholder="Дата начала">
                            <input type="date" class="form-input" placeholder="Дата окончания">
                        </div>
                        <button class="btn btn-primary btn-small" onclick="adminModules.generateExpenseReport()">Создать отчёт</button>
                    </div>
                    <div class="card">
                        <h4>Налоговый отчёт</h4>
                        <p class="text-sm text-gray-600">НДС, налоги и сборы</p>
                        <div class="space-y-2 mt-2">
                            <select class="form-input">
                                <option>Январь 2024</option>
                                <option>Февраль 2024</option>
                                <option>Март 2024</option>
                            </select>
                        </div>
                        <button class="btn btn-primary btn-small" onclick="adminModules.generateTaxReport()">Создать отчёт</button>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3 class="card-title">Кассовые отчёты</h3>
                <div class="grid grid-3">
                    <div class="card">
                        <h4>X-отчёт</h4>
                        <p class="text-sm text-gray-600">Промежуточный отчёт без обнуления</p>
                        <button class="btn btn-primary btn-small" onclick="adminModules.generateXReport()">Создать X-отчёт</button>
                    </div>
                    <div class="card">
                        <h4>Z-отчёт</h4>
                        <p class="text-sm text-gray-600">Итоговый отчёт с обнулением</p>
                        <button class="btn btn-primary btn-small" onclick="adminModules.generateZReport()">Создать Z-отчёт</button>
                    </div>
                    <div class="card">
                        <h4>Отчёт кассира</h4>
                        <p class="text-sm text-gray-600">Детальный отчёт по смене</p>
                        <div class="space-y-2 mt-2">
                            <select class="form-input">
                                <option>Иван Петров</option>
                                <option>Мария Сидорова</option>
                                <option>Алексей Козлов</option>
                            </select>
                        </div>
                        <button class="btn btn-primary btn-small" onclick="adminModules.generateCashierReport()">Создать отчёт</button>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3 class="card-title">Складские отчёты</h3>
                <div class="grid grid-3">
                    <div class="card">
                        <h4>Инвентаризация</h4>
                        <p class="text-sm text-gray-600">Остатки товаров на складе</p>
                        <button class="btn btn-primary btn-small" onclick="adminModules.generateInventoryReport()">Создать отчёт</button>
                    </div>
                    <div class="card">
                        <h4>Списания</h4>
                        <p class="text-sm text-gray-600">Списанные товары за период</p>
                        <div class="space-y-2 mt-2">
                            <input type="date" class="form-input" placeholder="Дата начала">
                            <input type="date" class="form-input" placeholder="Дата окончания">
                        </div>
                        <button class="btn btn-primary btn-small" onclick="adminModules.generateWriteOffReport()">Создать отчёт</button>
                    </div>
                    <div class="card">
                        <h4>Поступления</h4>
                        <p class="text-sm text-gray-600">Поступившие товары за период</p>
                        <div class="space-y-2 mt-2">
                            <input type="date" class="form-input" placeholder="Дата начала">
                            <input type="date" class="form-input" placeholder="Дата окончания">
                        </div>
                        <button class="btn btn-primary btn-small" onclick="adminModules.generateReceiptReport()">Создать отчёт</button>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3 class="card-title">Экспорт отчётов</h3>
                <div class="flex gap-2">
                    <button class="btn btn-secondary" onclick="adminModules.exportToPDF()">📄 Экспорт в PDF</button>
                    <button class="btn btn-secondary" onclick="adminModules.exportToExcel()">📊 Экспорт в Excel</button>
                    <button class="btn btn-secondary" onclick="adminModules.exportToCSV()">📋 Экспорт в CSV</button>
                </div>
            </div>
        `;
    }
    
    updateReportsContent() {
        const reportsElement = document.getElementById('reportsContent');
        if (reportsElement) {
            reportsElement.innerHTML = this.createReportsContent();
        }
    }
    
    // Функции для работы с отчётами
    generateRevenueReport() {
        alert('Отчёт по выручке создан! Выручка за период: 125,450 ₽');
    }
    
    generateExpenseReport() {
        alert('Отчёт по расходам создан! Расходы за период: 89,200 ₽');
    }
    
    generateTaxReport() {
        alert('Налоговый отчёт создан! НДС к уплате: 15,230 ₽');
    }
    
    generateXReport() {
        alert('X-отчёт создан! Выручка за смену: 45,670 ₽');
    }
    
    generateZReport() {
        alert('Z-отчёт создан! Смена закрыта, касса обнулена');
    }
    
    generateCashierReport() {
        alert('Отчёт кассира создан! Заказов: 23, сумма: 12,450 ₽');
    }
    
    generateInventoryReport() {
        alert('Отчёт по инвентаризации создан! Остатки обновлены');
    }
    
    generateWriteOffReport() {
        alert('Отчёт по списаниям создан! Списано на сумму: 2,340 ₽');
    }
    
    generateReceiptReport() {
        alert('Отчёт по поступлениям создан! Поступило на сумму: 15,670 ₽');
    }
    
    exportToPDF() {
        alert('Отчёт экспортирован в PDF! Файл: report.pdf');
    }
    
    exportToExcel() {
        alert('Отчёт экспортирован в Excel! Файл: report.xlsx');
    }
    
    exportToCSV() {
        alert('Отчёт экспортирован в CSV! Файл: report.csv');
    }
    
    // ===== Уведомления =====
    createAlertsContent() {
        return `
            <div class="card">
                <h3 class="card-title">Центр уведомлений</h3>
                <p>Изменения меню/цен, сроки оплат по накладным, налоги, КЭП/ОФД, ЕГАИС, критические остатки. Настройка каналов и эскалация.</p>
                
                <div style="margin-top: 2rem;">
                    <h4 style="margin-bottom: 1rem;">Настройки уведомлений</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" checked>
                            <span>Критические остатки</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" checked>
                            <span>Новые заказы</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox">
                            <span>Изменения цен</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" checked>
                            <span>Проблемы с ККТ</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }
    
    updateAlertsContent() {
        const alertsElement = document.getElementById('alertsContent');
        if (alertsElement) {
            alertsElement.innerHTML = this.createAlertsContent();
        }
    }
    
    // ===== Профиль =====
    createProfileContent() {
        console.log('createProfileContent called');
        return `
            <div class="card">
                <h3 class="card-title">Профиль пользователя</h3>
                <div class="grid grid-2">
                    <div>
                        <h4>Личная информация</h4>
                        <div class="space-y-2">
                            <div>
                                <label class="form-label">Имя</label>
                                <input type="text" value="Администратор" class="form-input">
                            </div>
                            <div>
                                <label class="form-label">Email</label>
                                <input type="email" value="admin@dandy.ru" class="form-input">
                            </div>
                            <div>
                                <label class="form-label">Телефон</label>
                                <input type="tel" value="+7 (999) 123-45-67" class="form-input">
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4>Настройки аккаунта</h4>
                        <div class="space-y-2">
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox" id="twoFA" checked>
                                <span>Включить 2ФА</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox" id="notifications" checked>
                                <span>Уведомления по email</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox" id="smsNotifications">
                                <span>SMS уведомления</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3 class="card-title">Безопасность</h3>
                <div class="grid grid-3">
                    <div>
                        <h4>Смена пароля</h4>
                        <div class="space-y-2">
                            <input type="password" placeholder="Текущий пароль" class="form-input">
                            <input type="password" placeholder="Новый пароль" class="form-input">
                            <input type="password" placeholder="Подтвердите пароль" class="form-input">
                        </div>
                        <button class="btn btn-primary btn-small" onclick="adminModules.changePassword()">Сменить пароль</button>
                    </div>
                    <div>
                        <h4>Сессии</h4>
                        <p class="text-sm text-gray-600">Активных сессий: 2</p>
                        <p class="text-sm text-gray-600">Последний вход: сегодня 14:30</p>
                        <button class="btn btn-secondary btn-small" onclick="adminModules.logoutAllSessions()">Выйти из всех сессий</button>
                    </div>
                    <div>
                        <h4>Резервное копирование</h4>
                        <p class="text-sm text-gray-600">Последнее резервное копирование: вчера</p>
                        <button class="btn btn-secondary btn-small" onclick="adminModules.createBackup()">Создать резервную копию</button>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3 class="card-title">Действия</h3>
                <div class="grid grid-2">
                    <div>
                        <h4>Экспорт данных</h4>
                        <p class="text-sm text-gray-600">Скачать все данные аккаунта</p>
                        <button class="btn btn-primary btn-small" onclick="adminModules.exportData()">Экспорт данных</button>
                    </div>
                    <div>
                        <h4>Удаление аккаунта</h4>
                        <p class="text-sm text-gray-600">Окончательно удалить аккаунт</p>
                        <button class="btn btn-danger btn-small" onclick="adminModules.deleteAccount()">Удалить аккаунт</button>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3 class="card-title">Выход из системы</h3>
                <div class="flex gap-2">
                    <button class="btn btn-primary" onclick="adminModules.logout()">Выйти</button>
                    <button class="btn btn-secondary" onclick="adminModules.logoutAllSessions()">Выйти из всех устройств</button>
                </div>
            </div>
        `;
    }
    
    updateProfileContent() {
        const profileElement = document.getElementById('profileContent');
        if (profileElement) {
            profileElement.innerHTML = this.createProfileContent();
        }
    }
    
    // Функции для работы с профилем
    changePassword() {
        alert('Функция смены пароля будет реализована в следующей версии');
    }
    
    logout() {
        if (confirm('Вы уверены, что хотите выйти из системы?')) {
            alert('Выход из системы выполнен');
            // В реальном приложении здесь будет редирект на страницу входа
            // window.location.href = '/login.html';
        }
    }
    
    logoutAllSessions() {
        if (confirm('Вы уверены, что хотите выйти из всех устройств? Это завершит все активные сессии.')) {
            alert('Все сессии завершены');
        }
    }
    
    createBackup() {
        alert('Резервная копия создана успешно!');
    }
    
    exportData() {
        alert('Данные экспортированы в файл data_export.json');
    }
    
    deleteAccount() {
        if (confirm('ВНИМАНИЕ! Это действие необратимо. Вы уверены, что хотите удалить аккаунт?')) {
            if (confirm('Последнее предупреждение! Все данные будут удалены навсегда. Продолжить?')) {
                alert('Аккаунт удален');
            }
        }
    }

    // ===== Отчётность =====
    initReports() {
        console.log('AdminModules: Initializing reports...');
        this.reports = {
            sales: [],
            inventory: [],
            couriers: [],
            cashier: []
        };
        console.log('AdminModules: Reports initialized');
    }

    // ===== Уведомления =====
    initAlerts() {
        console.log('AdminModules: Initializing alerts...');
        this.alerts = {
            critical: [],
            warnings: [],
            info: []
        };
        console.log('AdminModules: Alerts initialized');
    }

    // ===== Профиль =====
    initProfile() {
        console.log('AdminModules: Initializing profile...');
        this.profile = {
            user: null,
            settings: {},
            permissions: []
        };
        console.log('AdminModules: Profile initialized');
    }
}

// Initialize modules when admin is ready
let adminModules;

// Function to initialize modules
function initializeAdminModules() {
    console.log('Checking for admin...');
    console.log('window.admin:', window.admin);
    if (window.admin) {
        console.log('Admin found, initializing modules');
        adminModules = new AdminModules(admin);
        window.adminModules = adminModules; // Make it globally available
        console.log('AdminModules initialized:', adminModules);
        console.log('AdminModules couriers:', adminModules.admin.couriers);
        return true;
    } else {
        console.log('Admin not found');
        return false;
    }
}

// Make function globally available
window.initializeAdminModules = initializeAdminModules;

// Try to initialize immediately
if (!initializeAdminModules()) {
    // If not ready, wait for DOM and try again
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            initializeAdminModules();
        }, 100);
    });
}
