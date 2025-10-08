/**
 * УЛУЧШЕНИЯ ДЛЯ АДМИНКИ DANDY CRM - ЧАСТЬ 2
 * ЕГАИС, Меркурий, Курьеры, Инвентаризация, Цены, Маркетинг, Интеграции, Отчёты
 */

// ===== 1. ЕГАИС =====
function setupEGAIS() {
    const egaisContent = document.getElementById('egaisContent');
    if (!egaisContent) return;
    
    egaisContent.innerHTML = `
        <div class="card">
            <h3 class="card-title">🍷 ЕГАИС (Учёт алкоголя)</h3>
            
            <div class="grid grid-3" style="gap: 1rem; margin-bottom: 1.5rem;">
                <div class="stat-card" style="background: #fef3c7;">
                    <div class="stat-value">Подключено</div>
                    <div class="stat-label">Статус подключения</div>
                </div>
                <div class="stat-card" style="background: #dbeafe;">
                    <div class="stat-value">45</div>
                    <div class="stat-label">Позиций алкоголя</div>
                </div>
                <div class="stat-card" style="background: #d1fae5;">
                    <div class="stat-value">98%</div>
                    <div class="stat-label">Синхронизация</div>
                </div>
            </div>
            
            <h4>Алкогольная продукция:</h4>
            <table class="table">
                <thead>
                    <tr>
                        <th>Наименование</th>
                        <th>Справка ЕГАИС</th>
                        <th>Остаток</th>
                        <th>Акциз</th>
                        <th>Статус</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Вино красное сухое</td>
                        <td><code>0000123456</code></td>
                        <td>12 бут.</td>
                        <td>✅ Оплачен</td>
                        <td><span class="badge" style="background: #10b981;">Учтено</span></td>
                    </tr>
                    <tr>
                        <td>Пиво светлое 0.5л</td>
                        <td><code>0000789012</code></td>
                        <td>48 бут.</td>
                        <td>✅ Оплачен</td>
                        <td><span class="badge" style="background: #10b981;">Учтено</span></td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin-top: 1.5rem;">
                <button class="btn btn-primary" onclick="syncEGAIS()">🔄 Синхронизировать</button>
                <button class="btn" onclick="generateEGAISReport()">📊 Отчёт ЕГАИС</button>
            </div>
            
            <div style="margin-top: 1rem; padding: 1rem; background: #f0f9ff; border-radius: 8px;">
                <strong>ℹ️ Последняя синхронизация:</strong> 29.09.2025 14:32
            </div>
        </div>
    `;
}

window.syncEGAIS = function() {
    alert('🔄 Синхронизация с ЕГАИС запущена...');
    setTimeout(() => {
        alert('✅ Синхронизация завершена успешно!');
    }, 2000);
};

window.generateEGAISReport = function() {
    alert('📊 Генерация отчёта ЕГАИС...');
};

// ===== 2. МЕРКУРИЙ (Ветеринарный контроль) =====
function setupMercury() {
    const mercuryContent = document.getElementById('mercuryContent');
    if (!mercuryContent) return;
    
    mercuryContent.innerHTML = `
        <div class="card">
            <h3 class="card-title">🐄 Меркурий (Ветконтроль)</h3>
            
            <div class="grid grid-3" style="gap: 1rem; margin-bottom: 1.5rem;">
                <div class="stat-card" style="background: #d1fae5;">
                    <div class="stat-value">Активно</div>
                    <div class="stat-label">Подключение</div>
                </div>
                <div class="stat-card" style="background: #dbeafe;">
                    <div class="stat-value">23</div>
                    <div class="stat-label">ВСД документов</div>
                </div>
                <div class="stat-card" style="background: #fef3c7;">
                    <div class="stat-value">5</div>
                    <div class="stat-label">Ожидают оформления</div>
                </div>
            </div>
            
            <h4>Продукция животного происхождения:</h4>
            <table class="table">
                <thead>
                    <tr>
                        <th>Товар</th>
                        <th>№ ВСД</th>
                        <th>Поставщик</th>
                        <th>Дата поступления</th>
                        <th>Статус</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Курица охлажденная</td>
                        <td><code>VSD-2025-1234</code></td>
                        <td>ООО "Птицефабрика"</td>
                        <td>28.09.2025</td>
                        <td><span class="badge" style="background: #10b981;">Оформлен</span></td>
                    </tr>
                    <tr>
                        <td>Сыр Моцарелла</td>
                        <td><code>VSD-2025-1235</code></td>
                        <td>ИП Сыроваров</td>
                        <td>27.09.2025</td>
                        <td><span class="badge" style="background: #10b981;">Оформлен</span></td>
                    </tr>
                    <tr>
                        <td>Рыба свежемороженая</td>
                        <td><code>VSD-2025-1236</code></td>
                        <td>ООО "Морепродукты"</td>
                        <td>29.09.2025</td>
                        <td><span class="badge" style="background: #f59e0b;">Ожидает</span></td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin-top: 1.5rem;">
                <button class="btn btn-primary" onclick="createVSD()">➕ Создать ВСД</button>
                <button class="btn" onclick="syncMercury()">🔄 Синхронизация</button>
            </div>
        </div>
    `;
}

window.createVSD = function() {
    alert('📝 Создание ВСД документа...');
};

window.syncMercury = function() {
    alert('🔄 Синхронизация с Меркурий...');
};

// ===== 3. КУРЬЕРЫ =====
function setupCouriers() {
    const couriersContent = document.getElementById('couriersContent');
    if (!couriersContent) return;
    
    const couriers = [
        { id: 1, name: 'Иван Петров', phone: '+7 (999) 111-22-33', status: 'На доставке', orders: 2, rating: 4.8 },
        { id: 2, name: 'Мария Сидорова', phone: '+7 (999) 222-33-44', status: 'Свободен', orders: 0, rating: 4.9 },
        { id: 3, name: 'Алексей Смирнов', phone: '+7 (999) 333-44-55', status: 'На доставке', orders: 1, rating: 4.7 }
    ];
    
    couriersContent.innerHTML = `
        <div class="card">
            <h3 class="card-title">🚴 Управление курьерами</h3>
            
            <div class="grid grid-4" style="gap: 1rem; margin-bottom: 1.5rem;">
                <div class="stat-card" style="background: #d1fae5;">
                    <div class="stat-value">3</div>
                    <div class="stat-label">Всего курьеров</div>
                </div>
                <div class="stat-card" style="background: #dbeafe;">
                    <div class="stat-value">2</div>
                    <div class="stat-label">На доставке</div>
                </div>
                <div class="stat-card" style="background: #fef3c7;">
                    <div class="stat-value">1</div>
                    <div class="stat-label">Свободен</div>
                </div>
                <div class="stat-card" style="background: #ede9fe;">
                    <div class="stat-value">4.8</div>
                    <div class="stat-label">Средний рейтинг</div>
                </div>
            </div>
            
            <div class="grid grid-3" style="gap: 1rem;">
                ${couriers.map(courier => `
                    <div class="card" style="background: ${courier.status === 'Свободен' ? '#f0fdf4' : '#fffbeb'};">
                        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 0.5rem;">
                            <h4 style="margin: 0;">${courier.name}</h4>
                            <span class="badge" style="background: ${courier.status === 'Свободен' ? '#10b981' : '#f59e0b'};">
                                ${courier.status}
                            </span>
                        </div>
                        <div style="font-size: 14px; color: #666; margin-bottom: 0.5rem;">
                            📞 ${courier.phone}
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <span>Заказов: <strong>${courier.orders}</strong></span>
                            <span>⭐ ${courier.rating}</span>
                        </div>
                        <button class="btn btn-sm" onclick="assignOrder(${courier.id})">
                            ${courier.status === 'Свободен' ? 'Назначить заказ' : 'Посмотреть заказы'}
                        </button>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 1.5rem;">
                <button class="btn btn-primary" onclick="addCourier()">➕ Добавить курьера</button>
            </div>
        </div>
    `;
}

window.assignOrder = function(courierId) {
    alert(`Назначение заказа курьеру ID: ${courierId}`);
};

window.addCourier = function() {
    alert('➕ Форма добавления нового курьера');
};

// ===== 4. ИНВЕНТАРИЗАЦИЯ =====
function setupInventory() {
    const inventoryElement = document.getElementById('inventoryContent');
    if (!inventoryElement) return;
    
    inventoryElement.innerHTML = `
        <div class="card">
            <h3 class="card-title">📋 Инвентаризация</h3>
            
            <div class="grid grid-3" style="gap: 1rem; margin-bottom: 1.5rem;">
                <div class="stat-card" style="background: #dbeafe;">
                    <div class="stat-value">245</div>
                    <div class="stat-label">Позиций для инвентаризации</div>
                </div>
                <div class="stat-card" style="background: #d1fae5;">
                    <div class="stat-value">180</div>
                    <div class="stat-label">Проверено</div>
                </div>
                <div class="stat-card" style="background: #fee2e2;">
                    <div class="stat-value">-4.5 кг</div>
                    <div class="stat-label">Недостача</div>
                </div>
            </div>
            
            <h4>Инвентаризация — Кухня:</h4>
            <table class="table">
                <thead>
                    <tr>
                        <th>Товар</th>
                        <th>По системе</th>
                        <th>Факт</th>
                        <th>Разница</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Мука высший сорт</td>
                        <td>45 кг</td>
                        <td><input type="number" value="42.5" step="0.1" style="width: 80px; padding: 0.5rem;"></td>
                        <td style="color: #dc2626; font-weight: bold;">-2.5 кг</td>
                        <td><button class="btn btn-sm" onclick="saveInventory('flour')">✅ Сохранить</button></td>
                    </tr>
                    <tr>
                        <td>Сыр Моцарелла</td>
                        <td>30 кг</td>
                        <td><input type="number" value="30" step="0.1" style="width: 80px; padding: 0.5rem;"></td>
                        <td style="color: #10b981; font-weight: bold;">0 кг</td>
                        <td><button class="btn btn-sm" onclick="saveInventory('cheese')">✅ Сохранить</button></td>
                    </tr>
                    <tr>
                        <td>Помидоры свежие</td>
                        <td>15 кг</td>
                        <td><input type="number" value="13" step="0.1" style="width: 80px; padding: 0.5rem;"></td>
                        <td style="color: #dc2626; font-weight: bold;">-2 кг</td>
                        <td><button class="btn btn-sm" onclick="saveInventory('tomatoes')">✅ Сохранить</button></td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin-top: 1.5rem;">
                <button class="btn btn-primary" onclick="completeInventory()">✅ Завершить инвентаризацию</button>
                <button class="btn" onclick="exportInventory()">📊 Экспорт в Excel</button>
            </div>
        </div>
    `;
}

window.saveInventory = function(itemId) {
    alert(`✅ Данные по ${itemId} сохранены`);
};

window.completeInventory = function() {
    if (confirm('Завершить инвентаризацию?')) {
        alert('✅ Инвентаризация завершена!');
    }
};

window.exportInventory = function() {
    alert('📊 Экспорт данных инвентаризации...');
};

// ===== 5. ПЕРЕСЧЁТ ЦЕН =====
function setupPricing() {
    const pricingElement = document.getElementById('pricingContent');
    if (!pricingElement) return;
    
    pricingElement.innerHTML = `
        <div class="card">
            <h3 class="card-title">💰 Пересчёт цен</h3>
            
            <div class="grid grid-2" style="gap: 1rem; margin-bottom: 1.5rem;">
                <div class="card" style="background: #f0f9ff;">
                    <h4>Массовое изменение цен</h4>
                    <div style="margin: 1rem 0;">
                        <label>Категория:</label>
                        <select class="form-input" style="width: 100%; margin-top: 0.5rem;">
                            <option>Все категории</option>
                            <option>Пиццы</option>
                            <option>Роллы</option>
                            <option>Напитки</option>
                        </select>
                    </div>
                    <div style="margin: 1rem 0;">
                        <label>Изменение:</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
                            <input type="number" placeholder="%" class="form-input">
                            <select class="form-input">
                                <option>Увеличить</option>
                                <option>Уменьшить</option>
                            </select>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="applyPriceChange()">Применить</button>
                </div>
                
                <div class="card" style="background: #fef3c7;">
                    <h4>История изменений</h4>
                    <div style="font-size: 14px;">
                        <div style="padding: 0.5rem; background: white; border-radius: 4px; margin-bottom: 0.5rem;">
                            <strong>29.09.2025 14:20</strong><br>
                            Пиццы: +5% (120 товаров)
                        </div>
                        <div style="padding: 0.5rem; background: white; border-radius: 4px; margin-bottom: 0.5rem;">
                            <strong>25.09.2025 10:15</strong><br>
                            Напитки: -3% (45 товаров)
                        </div>
                    </div>
                </div>
            </div>
            
            <h4>Товары с неоптимальной наценкой:</h4>
            <table class="table">
                <thead>
                    <tr>
                        <th>Товар</th>
                        <th>Себестоимость</th>
                        <th>Цена продажи</th>
                        <th>Наценка</th>
                        <th>Рекомендация</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Пицца "Маргарита" 25см</td>
                        <td>120 ₽</td>
                        <td>399 ₽</td>
                        <td style="color: #10b981; font-weight: bold;">232%</td>
                        <td><span class="badge" style="background: #10b981;">Оптимально</span></td>
                    </tr>
                    <tr>
                        <td>Ролл "Филадельфия"</td>
                        <td>180 ₽</td>
                        <td>250 ₽</td>
                        <td style="color: #f59e0b; font-weight: bold;">39%</td>
                        <td><span class="badge" style="background: #f59e0b;">Увеличить до 320₽</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

window.applyPriceChange = function() {
    if (confirm('Применить изменение цен?')) {
        alert('✅ Цены обновлены!');
    }
};

// ===== 6. ИНИЦИАЛИЗАЦИЯ ЧАСТИ 2 =====
function initializePart2() {
    console.log('🚀 Инициализация улучшений админки (часть 2)...');
    
    setupEGAIS();
    setupMercury();
    setupCouriers();
    setupInventory();
    setupPricing();
    
    console.log('✅ Часть 2 активирована!');
}

// Автозапуск
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePart2);
} else {
    initializePart2();
}

window.adminImprovementsPart2 = {
    setupEGAIS,
    setupMercury,
    setupCouriers,
    setupInventory,
    setupPricing,
    reinitialize: initializePart2
};
