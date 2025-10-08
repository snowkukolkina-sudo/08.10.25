// ===== Integrations Configuration Module =====
// Универсальный модуль настройки всех интеграций

class IntegrationsConfigModule {
    constructor() {
        this.integrations = {
            egais: {
                name: 'ЕГАИС',
                description: 'Учёт алкогольной продукции',
                icon: '🍷',
                enabled: false,
                configured: false,
                status: 'not_configured',
                config: {
                    fsrar_id: '',
                    api_url: 'https://fsrar.gov.ru/api',
                    certificate: '',
                    inn: '',
                    kpp: ''
                }
            },
            mercury: {
                name: 'Меркурий (ВетИС)',
                description: 'Ветеринарный контроль мяса и рыбы',
                icon: '🥩',
                enabled: false,
                configured: false,
                status: 'not_configured',
                config: {
                    api_key: '',
                    login: '',
                    issuer_id: '',
                    api_url: 'https://api.vetrf.ru'
                }
            },
            honest_sign: {
                name: 'Честный знак',
                description: 'Маркировка товаров',
                icon: '🏷️',
                enabled: false,
                configured: false,
                status: 'not_configured',
                config: {
                    token: '',
                    participant_inn: '',
                    api_url: 'https://markirovka.crpt.ru/api'
                }
            },
            edo: {
                name: 'ЭДО',
                description: 'Электронный документооборот',
                icon: '📄',
                enabled: false,
                configured: false,
                status: 'not_configured',
                provider: 'diadoc',
                config: {
                    diadoc: {
                        api_key: '',
                        box_id: '',
                        inn: ''
                    },
                    sbis: {
                        login: '',
                        password: '',
                        organization_id: ''
                    },
                    kontur: {
                        api_key: '',
                        organization_id: ''
                    }
                }
            },
            erp_1c: {
                name: 'ERP (1С)',
                description: 'Обмен данными с 1С',
                icon: '💼',
                enabled: false,
                configured: false,
                status: 'not_configured',
                config: {
                    base_url: '',
                    database: '',
                    username: '',
                    password: '',
                    sync_products: true,
                    sync_orders: true,
                    sync_inventory: true
                }
            },
            yandex_eda: {
                name: 'Яндекс.Еда',
                description: 'Агрегатор доставки',
                icon: '🍽️',
                enabled: false,
                configured: false,
                status: 'not_configured',
                config: {
                    restaurant_id: '',
                    api_key: '',
                    webhook_url: ''
                }
            },
            delivery_club: {
                name: 'Delivery Club',
                description: 'Агрегатор доставки',
                icon: '🎯',
                enabled: false,
                configured: false,
                status: 'not_configured',
                config: {
                    restaurant_id: '',
                    api_key: '',
                    webhook_url: ''
                }
            }
        };
        
        this.loadConfig();
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            // Настроить интеграцию
            if (e.target.classList.contains('config-integration-btn')) {
                this.showConfigModal(e.target.dataset.integration);
            }
            
            // Переключить интеграцию
            if (e.target.classList.contains('toggle-integration-btn')) {
                this.toggleIntegration(e.target.dataset.integration);
            }
            
            // Тест интеграции
            if (e.target.classList.contains('test-integration-btn')) {
                this.testIntegration(e.target.dataset.integration);
            }
            
            // Инструкция
            if (e.target.classList.contains('help-integration-btn')) {
                this.showHelp(e.target.dataset.integration);
            }
        });
    }

    loadConfig() {
        const saved = localStorage.getItem('dandy_integrations_config');
        if (saved) {
            const savedConfig = JSON.parse(saved);
            Object.keys(savedConfig).forEach(key => {
                if (this.integrations[key]) {
                    this.integrations[key] = { ...this.integrations[key], ...savedConfig[key] };
                }
            });
        }
    }

    saveConfig() {
        localStorage.setItem('dandy_integrations_config', JSON.stringify(this.integrations));
    }

    showConfigModal(integrationType) {
        const integration = this.integrations[integrationType];
        if (!integration) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 2rem; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <h2 style="margin: 0 0 1.5rem 0; color: var(--dandy-green);">
                    ${integration.icon} Настройка: ${integration.name}
                </h2>
                
                <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <div style="color: #1e40af; font-size: 0.9rem;">${integration.description}</div>
                </div>
                
                ${this.renderConfigFields(integrationType, integration)}
                
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button onclick="integrationsConfig.saveIntegrationConfig('${integrationType}')" 
                            style="flex: 1; padding: 1rem; background: var(--dandy-green); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
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
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    renderConfigFields(integrationType, integration) {
        const config = integration.config;
        let html = '';
        
        switch (integrationType) {
            case 'egais':
                html = `
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">FSRAR ID:</label>
                        <input type="text" id="config_fsrar_id" value="${config.fsrar_id}" 
                               placeholder="00000000000000" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">ИНН:</label>
                        <input type="text" id="config_inn" value="${config.inn}" 
                               placeholder="1234567890" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">КПП:</label>
                        <input type="text" id="config_kpp" value="${config.kpp}" 
                               placeholder="123456789" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                `;
                break;
                
            case 'mercury':
                html = `
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">API Key:</label>
                        <input type="text" id="config_api_key" value="${config.api_key}" 
                               placeholder="your-api-key-here" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Логин:</label>
                        <input type="text" id="config_login" value="${config.login}" 
                               placeholder="login" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Issuer ID:</label>
                        <input type="text" id="config_issuer_id" value="${config.issuer_id}" 
                               placeholder="issuer-id" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                `;
                break;
                
            case 'honest_sign':
                html = `
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Токен доступа:</label>
                        <input type="text" id="config_token" value="${config.token}" 
                               placeholder="your-access-token" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">ИНН участника:</label>
                        <input type="text" id="config_participant_inn" value="${config.participant_inn}" 
                               placeholder="1234567890" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                `;
                break;
                
            case 'erp_1c':
                html = `
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">URL сервера 1С:</label>
                        <input type="text" id="config_base_url" value="${config.base_url}" 
                               placeholder="http://localhost/trade/hs/integration" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">База данных:</label>
                        <input type="text" id="config_database" value="${config.database}" 
                               placeholder="trade" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Логин:</label>
                        <input type="text" id="config_username" value="${config.username}" 
                               placeholder="admin" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Пароль:</label>
                        <input type="password" id="config_password" value="${config.password}" 
                               placeholder="••••••••" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                `;
                break;
                
            case 'yandex_eda':
            case 'delivery_club':
                html = `
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">ID ресторана:</label>
                        <input type="text" id="config_restaurant_id" value="${config.restaurant_id}" 
                               placeholder="your-restaurant-id" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">API Key:</label>
                        <input type="text" id="config_api_key" value="${config.api_key}" 
                               placeholder="your-api-key" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Webhook URL:</label>
                        <input type="text" id="config_webhook_url" value="${config.webhook_url}" 
                               placeholder="https://your-domain.com/webhook" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                `;
                break;
        }
        
        return html;
    }

    saveIntegrationConfig(integrationType) {
        const integration = this.integrations[integrationType];
        if (!integration) return;
        
        // Собираем данные из полей
        const inputs = document.querySelectorAll('[id^="config_"]');
        inputs.forEach(input => {
            const fieldName = input.id.replace('config_', '');
            integration.config[fieldName] = input.value;
        });
        
        // Проверяем заполненность обязательных полей
        const isConfigured = this.checkConfigured(integrationType, integration);
        integration.configured = isConfigured;
        integration.status = isConfigured ? 'configured' : 'not_configured';
        
        this.saveConfig();
        document.querySelector('.modal-overlay')?.remove();
        this.render();
        
        alert(`✅ Настройки ${integration.name} сохранены!`);
    }

    checkConfigured(integrationType, integration) {
        const config = integration.config;
        
        switch (integrationType) {
            case 'egais':
                return config.fsrar_id && config.inn && config.kpp;
            case 'mercury':
                return config.api_key && config.login && config.issuer_id;
            case 'honest_sign':
                return config.token && config.participant_inn;
            case 'erp_1c':
                return config.base_url && config.username && config.password;
            case 'yandex_eda':
            case 'delivery_club':
                return config.restaurant_id && config.api_key;
            default:
                return false;
        }
    }

    toggleIntegration(integrationType) {
        const integration = this.integrations[integrationType];
        if (!integration) return;
        
        if (!integration.configured) {
            alert('⚠️ Сначала настройте интеграцию!');
            return;
        }
        
        integration.enabled = !integration.enabled;
        integration.status = integration.enabled ? 'active' : 'configured';
        
        this.saveConfig();
        this.render();
    }

    testIntegration(integrationType) {
        const integration = this.integrations[integrationType];
        if (!integration) return;
        
        if (!integration.configured) {
            alert('⚠️ Сначала настройте интеграцию!');
            return;
        }
        
        alert(`🧪 Тестирование ${integration.name}...\n\n(Функция будет реализована в следующей версии)`);
    }

    showHelp(integrationType) {
        const integration = this.integrations[integrationType];
        if (!integration) return;
        
        const helpTexts = {
            egais: `
                <h3>🍷 ЕГАИС - Единая государственная автоматизированная информационная система</h3>
                
                <h4>Что нужно:</h4>
                <ul>
                    <li>Зарегистрироваться на fsrar.gov.ru</li>
                    <li>Получить сертификат ЭП</li>
                    <li>Получить FSRAR ID</li>
                    <li>Установить УТМ (Универсальный Транспортный Модуль)</li>
                </ul>
                
                <h4>Документация:</h4>
                <a href="https://fsrar.gov.ru" target="_blank">https://fsrar.gov.ru</a>
            `,
            mercury: `
                <h3>🥩 Меркурий (ВетИС) - Ветеринарная информационная система</h3>
                
                <h4>Что нужно:</h4>
                <ul>
                    <li>Зарегистрироваться в системе ВетИС</li>
                    <li>Получить API ключ</li>
                    <li>Настроить хозяйствующий субъект</li>
                </ul>
                
                <h4>Документация:</h4>
                <a href="https://vetrf.ru" target="_blank">https://vetrf.ru</a>
            `,
            honest_sign: `
                <h3>🏷️ Честный знак - Маркировка товаров</h3>
                
                <h4>Что нужно:</h4>
                <ul>
                    <li>Зарегистрироваться на честныйзнак.рф</li>
                    <li>Получить токен доступа</li>
                    <li>Настроить участника оборота</li>
                    <li>Приобрести оборудование для сканирования DataMatrix</li>
                </ul>
                
                <h4>Документация:</h4>
                <a href="https://честныйзнак.рф" target="_blank">https://честныйзнак.рф</a>
            `,
            erp_1c: `
                <h3>💼 ERP (1С) - Обмен данными</h3>
                
                <h4>Что нужно:</h4>
                <ul>
                    <li>Установить 1С:Предприятие</li>
                    <li>Настроить HTTP-сервис в 1С</li>
                    <li>Создать пользователя для интеграции</li>
                    <li>Настроить права доступа</li>
                </ul>
                
                <h4>Примерная структура URL:</h4>
                <code>http://localhost/база/hs/integration</code>
            `,
            yandex_eda: `
                <h3>🍽️ Яндекс.Еда - Агрегатор доставки</h3>
                
                <h4>Что нужно:</h4>
                <ul>
                    <li>Подключить ресторан к Яндекс.Еда</li>
                    <li>Получить API ключ в личном кабинете</li>
                    <li>Настроить webhook для получения заказов</li>
                    <li>Загрузить меню</li>
                </ul>
                
                <h4>Документация:</h4>
                <a href="https://eda.yandex.ru/business" target="_blank">https://eda.yandex.ru/business</a>
            `,
            delivery_club: `
                <h3>🎯 Delivery Club - Агрегатор доставки</h3>
                
                <h4>Что нужно:</h4>
                <ul>
                    <li>Подключить ресторан к Delivery Club</li>
                    <li>Получить API ключ</li>
                    <li>Настроить webhook</li>
                    <li>Загрузить меню</li>
                </ul>
                
                <h4>Документация:</h4>
                <a href="https://www.delivery-club.ru/business" target="_blank">https://www.delivery-club.ru/business</a>
            `
        };
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 2rem; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto;">
                ${helpTexts[integrationType] || '<p>Справка недоступна</p>'}
                
                <button onclick="this.closest('.modal-overlay').remove()" 
                        style="width: 100%; margin-top: 1.5rem; padding: 1rem; background: #6b7280; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    Закрыть
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    render() {
        const container = document.getElementById('integrationsContent');
        if (!container) return;
        
        const totalIntegrations = Object.keys(this.integrations).length;
        const configured = Object.values(this.integrations).filter(i => i.configured).length;
        const active = Object.values(this.integrations).filter(i => i.enabled).length;
        
        container.innerHTML = `
            <div style="background: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h2 style="margin: 0 0 0.5rem 0; color: var(--dandy-green);">🔌 Интеграции</h2>
                <p style="margin: 0 0 1.5rem 0; color: #666;">Настройка внешних систем и сервисов</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div style="background: #dbeafe; padding: 1rem; border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: 700; color: #1e40af;">${totalIntegrations}</div>
                        <div style="color: #1e40af; font-weight: 600;">Всего</div>
                    </div>
                    <div style="background: #fef3c7; padding: 1rem; border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: 700; color: #92400e;">${configured}</div>
                        <div style="color: #92400e; font-weight: 600;">Настроено</div>
                    </div>
                    <div style="background: #d1fae5; padding: 1rem; border-radius: 8px;">
                        <div style="font-size: 2rem; font-weight: 700; color: #065f46;">${active}</div>
                        <div style="color: #065f46; font-weight: 600;">Активно</div>
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;">
                ${Object.entries(this.integrations).map(([key, integration]) => 
                    this.renderIntegrationCard(key, integration)
                ).join('')}
            </div>
        `;
    }

    renderIntegrationCard(key, integration) {
        const statusColors = {
            not_configured: { bg: '#f3f4f6', color: '#6b7280', text: 'Не настроено' },
            configured: { bg: '#fef3c7', color: '#92400e', text: 'Настроено' },
            active: { bg: '#d1fae5', color: '#065f46', text: 'Активно' }
        };
        
        const status = statusColors[integration.status];
        
        return `
            <div style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid ${status.color};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${integration.icon}</div>
                        <h3 style="margin: 0 0 0.25rem 0;">${integration.name}</h3>
                        <div style="font-size: 0.85rem; color: #666;">${integration.description}</div>
                    </div>
                    <span style="padding: 0.25rem 0.75rem; background: ${status.bg}; color: ${status.color}; border-radius: 20px; font-size: 0.85rem; font-weight: 600; white-space: nowrap;">
                        ${status.text}
                    </span>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <button class="config-integration-btn" data-integration="${key}"
                            style="padding: 0.75rem; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        ⚙️ Настроить
                    </button>
                    
                    ${integration.configured ? `
                        <button class="toggle-integration-btn" data-integration="${key}"
                                style="padding: 0.75rem; background: ${integration.enabled ? '#dc2626' : '#16a34a'}; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                            ${integration.enabled ? '⏸️ Выключить' : '▶️ Включить'}
                        </button>
                        
                        <button class="test-integration-btn" data-integration="${key}"
                                style="padding: 0.75rem; background: #7c3aed; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                            🧪 Тест
                        </button>
                    ` : ''}
                    
                    <button class="help-integration-btn" data-integration="${key}"
                            style="padding: 0.75rem; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        ❓ Инструкция
                    </button>
                </div>
            </div>
        `;
    }
}

// Глобальный экземпляр
window.integrationsConfig = null;

// Инициализация
window.initIntegrations = function() {
    if (window.integrationsConfig) {
        window.integrationsConfig = null;
    }
    window.integrationsConfig = new IntegrationsConfigModule();
    window.integrationsConfig.render();
};

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntegrationsConfigModule;
}
