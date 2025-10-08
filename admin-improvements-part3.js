/**
 * УЛУЧШЕНИЯ ДЛЯ АДМИНКИ DANDY CRM - ЧАСТЬ 3
 * Маркетинг, Интеграции, Отчёты, Уведомления, Профиль
 */

// ===== 1. МАРКЕТИНГ =====
function setupMarketing() {
    const marketingElement = document.getElementById('marketingContent');
    if (!marketingElement) return;
    
    marketingElement.innerHTML = `
        <div class="card">
            <h3 class="card-title">📣 Маркетинг и акции</h3>
            
            <div class="grid grid-4" style="gap: 1rem; margin-bottom: 1.5rem;">
                <div class="stat-card" style="background: #dbeafe;">
                    <div class="stat-value">8</div>
                    <div class="stat-label">Активных акций</div>
                </div>
                <div class="stat-card" style="background: #d1fae5;">
                    <div class="stat-value">1 245</div>
                    <div class="stat-label">Клиентов в базе</div>
                </div>
                <div class="stat-card" style="background: #fef3c7;">
                    <div class="stat-value">32%</div>
                    <div class="stat-label">Конверсия акций</div>
                </div>
                <div class="stat-card" style="background: #ede9fe;">
                    <div class="stat-value">15 340 ₽</div>
                    <div class="stat-label">Средний чек по акциям</div>
                </div>
            </div>
            
            <h4>Текущие акции:</h4>
            <div class="grid grid-2" style="gap: 1rem; margin-bottom: 1.5rem;">
                <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <h4 style="color: white;">🍕 2 пиццы по цене 1</h4>
                    <p style="margin: 0.5rem 0;">При заказе 2-х пицц — вторая в подарок</p>
                    <div style="margin-top: 1rem;">
                        <span class="badge" style="background: rgba(255,255,255,0.3);">До 30.09.2025</span>
                        <span class="badge" style="background: rgba(255,255,255,0.3);">156 заказов</span>
                    </div>
                    <div style="margin-top: 1rem;">
                        <button class="btn" style="background: white; color: #667eea;" onclick="editPromo('promo1')">Редактировать</button>
                    </div>
                </div>
                
                <div class="card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
                    <h4 style="color: white;">🎁 Бесплатная доставка</h4>
                    <p style="margin: 0.5rem 0;">При заказе от 1000₽ — доставка бесплатно</p>
                    <div style="margin-top: 1rem;">
                        <span class="badge" style="background: rgba(255,255,255,0.3);">Постоянная</span>
                        <span class="badge" style="background: rgba(255,255,255,0.3);">342 заказа</span>
                    </div>
                    <div style="margin-top: 1rem;">
                        <button class="btn" style="background: white; color: #f5576c;" onclick="editPromo('promo2')">Редактировать</button>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-2" style="gap: 1rem;">
                <button class="btn btn-primary" onclick="createPromo()">➕ Создать акцию</button>
                <button class="btn" onclick="sendNotification()">📧 Отправить рассылку</button>
            </div>
        </div>
    `;
}

window.createPromo = function() {
    alert('➕ Создание новой акции...');
};

window.editPromo = function(promoId) {
    alert(`✏️ Редактирование акции: ${promoId}`);
};

window.sendNotification = function() {
    alert('📧 Форма создания рассылки...');
};

// ===== 2. ИНТЕГРАЦИИ =====
function setupIntegrations() {
    const integrationsElement = document.getElementById('integrationsContent');
    if (!integrationsElement) return;
    
    const integrations = [
        { id: 'yandex', name: 'Яндекс.Еда', icon: '🟡', status: 'connected', orders: 45 },
        { id: 'deliveryclub', name: 'Delivery Club', icon: '🔴', status: 'connected', orders: 38 },
        { id: 'sberbank', name: 'Сбербанк Эквайринг', icon: '🟢', status: 'connected', orders: 156 },
        { id: '1c', name: '1С Бухгалтерия', icon: '📊', status: 'connected', orders: 0 },
        { id: 'telegram', name: 'Telegram Бот', icon: '✈️', status: 'pending', orders: 0 }
    ];
    
    integrationsElement.innerHTML = `
        <div class="card">
            <h3 class="card-title">🔗 Интеграции</h3>
            
            <div class="grid grid-3" style="gap: 1rem; margin-bottom: 1.5rem;">
                <div class="stat-card" style="background: #d1fae5;">
                    <div class="stat-value">5</div>
                    <div class="stat-label">Всего интеграций</div>
                </div>
                <div class="stat-card" style="background: #dbeafe;">
                    <div class="stat-value">4</div>
                    <div class="stat-label">Активных</div>
                </div>
                <div class="stat-card" style="background: #fef3c7;">
                    <div class="stat-value">1</div>
                    <div class="stat-label">Ожидают настройки</div>
                </div>
            </div>
            
            <div class="grid grid-2" style="gap: 1rem;">
                ${integrations.map(int => `
                    <div class="card" style="background: ${int.status === 'connected' ? '#f0fdf4' : '#fffbeb'};">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <div style="font-size: 2rem;">${int.icon}</div>
                            <div>
                                <h4 style="margin: 0;">${int.name}</h4>
                                <span class="badge" style="background: ${int.status === 'connected' ? '#10b981' : '#f59e0b'};">
                                    ${int.status === 'connected' ? 'Подключено' : 'Настроить'}
                                </span>
                            </div>
                        </div>
                        ${int.orders > 0 ? `<div style="margin-bottom: 1rem; color: #666;">
                            📦 Заказов за месяц: <strong>${int.orders}</strong>
                        </div>` : ''}
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                            <button class="btn btn-sm" onclick="configureIntegration('${int.id}')">⚙️ Настроить</button>
                            ${int.status === 'connected' ? 
                                `<button class="btn btn-sm" onclick="testIntegration('${int.id}')">🧪 Тест</button>` :
                                `<button class="btn btn-primary btn-sm" onclick="connectIntegration('${int.id}')">🔌 Подключить</button>`
                            }
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 1.5rem;">
                <button class="btn btn-primary" onclick="addIntegration()">➕ Добавить интеграцию</button>
            </div>
        </div>
    `;
}

window.configureIntegration = function(id) {
    alert(`⚙️ Настройка интеграции: ${id}`);
};

window.testIntegration = function(id) {
    alert(`🧪 Тестирование интеграции: ${id}...`);
    setTimeout(() => alert('✅ Интеграция работает!'), 1000);
};

window.connectIntegration = function(id) {
    alert(`🔌 Подключение интеграции: ${id}...`);
};

window.addIntegration = function() {
    alert('➕ Добавление новой интеграции...');
};

// ===== 3. ОТЧЁТНОСТЬ =====
function setupReports() {
    const reportsElement = document.getElementById('reportsContent');
    if (!reportsElement) return;
    
    reportsElement.innerHTML = `
        <div class="card">
            <h3 class="card-title">📊 Отчётность</h3>
            
            <div class="grid grid-2" style="gap: 1rem; margin-bottom: 1.5rem;">
                <div class="card" style="background: #f0f9ff;">
                    <h4>📈 Финансовый отчёт</h4>
                    <p style="color: #666; margin: 0.5rem 0;">Выручка, затраты, прибыль за период</p>
                    <div style="margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="generateReport('financial')">Сформировать</button>
                    </div>
                </div>
                
                <div class="card" style="background: #f0fdf4;">
                    <h4>💰 Кассовый отчёт</h4>
                    <p style="color: #666; margin: 0.5rem 0;">Z-отчёты, X-отчёты, смены</p>
                    <div style="margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="generateReport('cashier')">Сформировать</button>
                    </div>
                </div>
                
                <div class="card" style="background: #fffbeb;">
                    <h4>📦 Складской отчёт</h4>
                    <p style="color: #666; margin: 0.5rem 0;">Остатки, движение товаров</p>
                    <div style="margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="generateReport('warehouse')">Сформировать</button>
                    </div>
                </div>
                
                <div class="card" style="background: #fef2f2;">
                    <h4>👥 Отчёт по персоналу</h4>
                    <p style="color: #666; margin: 0.5rem 0;">Смены, выработка, продажи</p>
                    <div style="margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="generateReport('staff')">Сформировать</button>
                    </div>
                </div>
            </div>
            
            <h4>Последние отчёты:</h4>
            <table class="table">
                <thead>
                    <tr>
                        <th>Отчёт</th>
                        <th>Период</th>
                        <th>Дата создания</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>📈 Финансовый</td>
                        <td>Сентябрь 2025</td>
                        <td>29.09.2025 16:30</td>
                        <td>
                            <button class="btn btn-sm" onclick="downloadReport('fin-sept')">📥 Скачать</button>
                        </td>
                    </tr>
                    <tr>
                        <td>💰 Кассовый</td>
                        <td>28.09.2025</td>
                        <td>28.09.2025 23:55</td>
                        <td>
                            <button class="btn btn-sm" onclick="downloadReport('cash-28')">📥 Скачать</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

window.generateReport = function(type) {
    alert(`📊 Генерация ${type} отчёта...`);
    setTimeout(() => {
        alert('✅ Отчёт готов!');
    }, 2000);
};

window.downloadReport = function(reportId) {
    alert(`📥 Скачивание отчёта: ${reportId}`);
};

// ===== 4. УВЕДОМЛЕНИЯ =====
function setupNotifications() {
    const alertsElement = document.getElementById('alertsContent');
    if (!alertsElement) return;
    
    const notifications = [
        { id: 1, type: 'order', title: 'Новый заказ #ORD-5', message: 'Заказ на сумму 1420₽', time: '2 мин назад', unread: true },
        { id: 2, type: 'stock', title: 'Заканчивается товар', message: 'Мука высший сорт: осталось 8 кг', time: '15 мин назад', unread: true },
        { id: 3, type: 'payment', title: 'Оплата получена', message: 'Заказ #ORD-4 оплачен картой', time: '1 час назад', unread: false }
    ];
    
    alertsElement.innerHTML = `
        <div class="card">
            <h3 class="card-title">🔔 Уведомления</h3>
            
            <div class="grid grid-3" style="gap: 1rem; margin-bottom: 1.5rem;">
                <div class="stat-card" style="background: #dbeafe;">
                    <div class="stat-value">25</div>
                    <div class="stat-label">Всего уведомлений</div>
                </div>
                <div class="stat-card" style="background: #fee2e2;">
                    <div class="stat-value">2</div>
                    <div class="stat-label">Непрочитанных</div>
                </div>
                <div class="stat-card" style="background: #d1fae5;">
                    <div class="stat-value">Вкл</div>
                    <div class="stat-label">Уведомления</div>
                </div>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                ${notifications.map(notif => `
                    <div class="card" style="background: ${notif.unread ? '#fffbeb' : '#f9fafb'}; margin-bottom: 0.5rem; border-left: 4px solid ${notif.unread ? '#f59e0b' : '#e5e7eb'};">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <span style="font-size: 1.2rem;">
                                        ${notif.type === 'order' ? '📦' : notif.type === 'stock' ? '⚠️' : '💳'}
                                    </span>
                                    <strong>${notif.title}</strong>
                                    ${notif.unread ? '<span class="badge" style="background: #f59e0b;">Новое</span>' : ''}
                                </div>
                                <div style="color: #666; font-size: 14px;">${notif.message}</div>
                                <div style="color: #999; font-size: 12px; margin-top: 0.5rem;">${notif.time}</div>
                            </div>
                            <button class="btn btn-sm" onclick="markAsRead(${notif.id})">
                                ${notif.unread ? '✓ Прочитать' : '🗑️ Удалить'}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="grid grid-2" style="gap: 1rem;">
                <button class="btn" onclick="markAllAsRead()">✓ Прочитать все</button>
                <button class="btn" onclick="configureNotifications()">⚙️ Настройки</button>
            </div>
        </div>
    `;
}

window.markAsRead = function(id) {
    alert(`✓ Уведомление ${id} прочитано`);
    setupNotifications();
};

window.markAllAsRead = function() {
    alert('✓ Все уведомления прочитаны');
    setupNotifications();
};

window.configureNotifications = function() {
    alert('⚙️ Настройки уведомлений...');
};

// ===== 5. ПРОФИЛЬ =====
function setupProfile() {
    const profileElement = document.getElementById('profileContent');
    if (!profileElement) return;
    
    profileElement.innerHTML = `
        <div class="card">
            <h3 class="card-title">👤 Профиль администратора</h3>
            
            <div class="grid grid-2" style="gap: 2rem;">
                <div>
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div style="width: 120px; height: 120px; background: linear-gradient(135deg, var(--dandy-green), var(--dandy-bg)); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 48px; color: white;">
                            👨‍💼
                        </div>
                        <h3 style="margin: 0.5rem 0;">Администратор</h3>
                        <p style="color: #666; margin: 0;">admin@dandy.ru</p>
                    </div>
                    
                    <div class="card" style="background: #f9fafb;">
                        <h4>Персональные данные</h4>
                        <div style="font-size: 14px;">
                            <div style="margin: 0.5rem 0;"><strong>ФИО:</strong> Иванов Иван Иванович</div>
                            <div style="margin: 0.5rem 0;"><strong>Телефон:</strong> +7 (999) 123-45-67</div>
                            <div style="margin: 0.5rem 0;"><strong>Должность:</strong> Администратор</div>
                            <div style="margin: 0.5rem 0;"><strong>Дата регистрации:</strong> 01.01.2024</div>
                        </div>
                        <button class="btn btn-primary" style="margin-top: 1rem;" onclick="editProfile()">✏️ Редактировать</button>
                    </div>
                </div>
                
                <div>
                    <div class="card" style="background: #f0f9ff; margin-bottom: 1rem;">
                        <h4>🔐 Безопасность</h4>
                        <div style="margin: 1rem 0;">
                            <button class="btn" onclick="changePassword()">🔑 Сменить пароль</button>
                        </div>
                        <div style="margin: 1rem 0;">
                            <button class="btn" onclick="enable2FA()">📱 Включить 2FA</button>
                        </div>
                        <div style="padding: 1rem; background: white; border-radius: 8px; font-size: 14px;">
                            <strong>Последний вход:</strong><br>
                            29.09.2025 в 14:32<br>
                            IP: 192.168.1.100
                        </div>
                    </div>
                    
                    <div class="card" style="background: #f0fdf4;">
                        <h4>⚙️ Настройки</h4>
                        <div style="margin: 1rem 0;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" checked>
                                <span>Уведомления о новых заказах</span>
                            </label>
                        </div>
                        <div style="margin: 1rem 0;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" checked>
                                <span>Email уведомления</span>
                            </label>
                        </div>
                        <div style="margin: 1rem 0;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox">
                                <span>Тёмная тема</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.editProfile = function() {
    alert('✏️ Редактирование профиля...');
};

window.changePassword = function() {
    alert('🔑 Смена пароля...');
};

window.enable2FA = function() {
    alert('📱 Настройка двухфакторной аутентификации...');
};

// ===== 6. ИНИЦИАЛИЗАЦИЯ ЧАСТИ 3 =====
function initializePart3() {
    console.log('🚀 Инициализация улучшений админки (часть 3)...');
    
    setupMarketing();
    setupIntegrations();
    setupReports();
    setupNotifications();
    setupProfile();
    
    console.log('✅ Часть 3 активирована!');
}

// Автозапуск
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePart3);
} else {
    initializePart3();
}

window.adminImprovementsPart3 = {
    setupMarketing,
    setupIntegrations,
    setupReports,
    setupNotifications,
    setupProfile,
    reinitialize: initializePart3
};
