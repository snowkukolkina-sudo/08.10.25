/**
 * DANDY Inventory System — Товароучётная система
 * Version: 1.0.0
 * Date: 30.09.2025
 */

class DandyInventorySystem {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentUser = null;
        
        // Данные (демо)
        this.products = this.loadProducts();
        this.recipes = this.loadRecipes();
        this.warehouses = this.loadWarehouses();
        this.stockBalances = this.loadStockBalances();
        this.documents = [];
        this.egaisOperations = [];
        this.crptCodes = [];
        this.mercuryVSD = [];
        
        this.init();
    }
    
    init() {
        console.log('🎯 DANDY Inventory System initializing...');
        this.setupEventListeners();
        this.loadDashboardData();
        
        // НЕ загружаем автоматически - слишком долго!
        // Пользователь сам нажмёт кнопку в интерфейсе
        
        console.log('✅ System ready');
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.switchPage(page);
            });
        });
    }
    
    switchPage(page) {
        console.log(`🔀 Switching to page: ${page}`);
        this.currentPage = page;
        
        // Update tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-page="${page}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            console.log(`✅ Tab activated: ${page}`);
        } else {
            console.error(`❌ Tab not found for: ${page}`);
        }
        
        // Update content
        document.querySelectorAll('.page-content').forEach(content => {
            content.classList.remove('active');
        });
        const activePage = document.getElementById(page);
        if (activePage) {
            activePage.classList.add('active');
            console.log(`✅ Page content shown: ${page}`);
        } else {
            console.error(`❌ Page content not found: ${page}`);
        }
        
        // Load page data
        this.loadPageData(page);
    }
    
    loadPageData(page) {
        console.log(`📄 Loading page: ${page}`);
        
        switch(page) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'nomenclature':
                this.loadNomenclatureData();
                if (window.nomenclatureModule) {
                    nomenclatureModule.init();
                }
                break;
            case 'recipes':
                this.loadRecipesData();
                if (window.recipesModule) {
                    recipesModule.init();
                }
                break;
            case 'warehouse':
                this.loadWarehouseData();
                if (window.warehouseModule) {
                    warehouseModule.init();
                }
                break;
            case 'production':
                this.loadProductionData();
                break;
            case 'bar':
                this.loadBarData();
                if (window.barModule) {
                    barModule.init();
                }
                break;
            case 'inventory':
                this.loadInventoryData();
                break;
            case 'egais-module':
                this.loadEGAISData();
                break;
            case 'crpt':
                this.loadCRPTData();
                break;
            case 'mercury':
                this.loadMercuryData();
                break;
            case 'integrations':
                this.loadIntegrationsData();
                break;
            case 'reports':
                this.loadReportsData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }
    
    // ===== Data Loaders =====
    
    loadProducts() {
        // Проверяем LocalStorage - может уже загружены
        const saved = this.loadFromLocalStorage('products');
        if (saved && saved.length > 50) {
            console.log('📦 Loaded products from LocalStorage:', saved.length);
            return saved;
        }
        
        // Демо-данные номенклатуры + товары из меню
        return [
            // ========== РЫБА И МОРЕПРОДУКТЫ ==========
            { id: 1, code: 'ING-001', name: 'Лосось филе', type: 'ingredient', category: 'Рыба/Морепродукты', baseUnit: 'кг', isAlcohol: false, minStock: 5.0, currentStock: 0.8, price: 1200 },
            { id: 2, code: 'ING-002', name: 'Тунец стейк', type: 'ingredient', category: 'Рыба/Морепродукты', baseUnit: 'кг', isAlcohol: false, minStock: 3.0, currentStock: 2.5, price: 1500 },
            { id: 3, code: 'ING-003', name: 'Креветки королевские', type: 'ingredient', category: 'Рыба/Морепродукты', baseUnit: 'кг', isAlcohol: false, minStock: 2.0, currentStock: 1.2, price: 1800 },
            { id: 4, code: 'ING-004', name: 'Мидии в створках', type: 'ingredient', category: 'Рыба/Морепродукты', baseUnit: 'кг', isAlcohol: false, minStock: 5.0, currentStock: 3.8, price: 650 },
            { id: 5, code: 'ING-005', name: 'Кальмар тушка', type: 'ingredient', category: 'Рыба/Морепродукты', baseUnit: 'кг', isAlcohol: false, minStock: 3.0, currentStock: 2.1, price: 550 },
            
            // ========== МЯСО И ПТИЦА ==========
            { id: 10, code: 'ING-010', name: 'Говядина вырезка', type: 'ingredient', category: 'Мясо и птица', baseUnit: 'кг', isAlcohol: false, minStock: 10.0, currentStock: 8.5, price: 800 },
            { id: 11, code: 'ING-011', name: 'Свинина корейка', type: 'ingredient', category: 'Мясо и птица', baseUnit: 'кг', isAlcohol: false, minStock: 8.0, currentStock: 6.3, price: 450 },
            { id: 12, code: 'ING-012', name: 'Курица филе', type: 'ingredient', category: 'Мясо и птица', baseUnit: 'кг', isAlcohol: false, minStock: 15.0, currentStock: 12.4, price: 320 },
            { id: 13, code: 'ING-013', name: 'Утка целая', type: 'ingredient', category: 'Мясо и птица', baseUnit: 'шт', isAlcohol: false, minStock: 5.0, currentStock: 3.0, price: 850 },
            { id: 14, code: 'ING-014', name: 'Бекон нарезка', type: 'ingredient', category: 'Мясо и птица', baseUnit: 'кг', isAlcohol: false, minStock: 3.0, currentStock: 2.8, price: 650 },
            { id: 15, code: 'ING-015', name: 'Фарш говяжий', type: 'semi_product', category: 'Мясо и птица', baseUnit: 'кг', isAlcohol: false, minStock: 10.0, currentStock: 7.5, price: 520 },
            
            // ========== МОЛОЧНЫЕ ПРОДУКТЫ ==========
            { id: 20, code: 'ING-020', name: 'Сыр Моцарелла', type: 'ingredient', category: 'Молочные продукты', baseUnit: 'кг', isAlcohol: false, minStock: 20.0, currentStock: 45.5, price: 450 },
            { id: 21, code: 'ING-021', name: 'Сыр Пармезан', type: 'ingredient', category: 'Молочные продукты', baseUnit: 'кг', isAlcohol: false, minStock: 5.0, currentStock: 3.2, price: 1200 },
            { id: 22, code: 'ING-022', name: 'Сыр Филадельфия', type: 'ingredient', category: 'Молочные продукты', baseUnit: 'кг', isAlcohol: false, minStock: 8.0, currentStock: 6.5, price: 750 },
            { id: 23, code: 'ING-023', name: 'Сливки 33%', type: 'ingredient', category: 'Молочные продукты', baseUnit: 'л', isAlcohol: false, minStock: 10.0, currentStock: 8.2, price: 280 },
            { id: 24, code: 'ING-024', name: 'Молоко 3.2%', type: 'ingredient', category: 'Молочные продукты', baseUnit: 'л', isAlcohol: false, minStock: 20.0, currentStock: 15.3, price: 65 },
            { id: 25, code: 'ING-025', name: 'Масло сливочное 82%', type: 'ingredient', category: 'Молочные продукты', baseUnit: 'кг', isAlcohol: false, minStock: 5.0, currentStock: 3.8, price: 580 },
            
            // ========== ОВОЩИ И ЗЕЛЕНЬ ==========
            { id: 30, code: 'ING-030', name: 'Томаты свежие', type: 'ingredient', category: 'Овощи и зелень', baseUnit: 'кг', isAlcohol: false, minStock: 15.0, currentStock: 12.5, price: 180 },
            { id: 31, code: 'ING-031', name: 'Огурцы свежие', type: 'ingredient', category: 'Овощи и зелень', baseUnit: 'кг', isAlcohol: false, minStock: 10.0, currentStock: 8.3, price: 150 },
            { id: 32, code: 'ING-032', name: 'Лук репчатый', type: 'ingredient', category: 'Овощи и зелень', baseUnit: 'кг', isAlcohol: false, minStock: 20.0, currentStock: 16.4, price: 45 },
            { id: 33, code: 'ING-033', name: 'Перец болгарский', type: 'ingredient', category: 'Овощи и зелень', baseUnit: 'кг', isAlcohol: false, minStock: 8.0, currentStock: 6.2, price: 220 },
            { id: 34, code: 'ING-034', name: 'Салат Айсберг', type: 'ingredient', category: 'Овощи и зелень', baseUnit: 'кг', isAlcohol: false, minStock: 5.0, currentStock: 3.5, price: 180 },
            { id: 35, code: 'ING-035', name: 'Авокадо', type: 'ingredient', category: 'Овощи и зелень', baseUnit: 'шт', isAlcohol: false, minStock: 20.0, currentStock: 15.0, price: 120 },
            { id: 36, code: 'ING-036', name: 'Петрушка', type: 'ingredient', category: 'Овощи и зелень', baseUnit: 'кг', isAlcohol: false, minStock: 1.0, currentStock: 0.8, price: 280 },
            
            // ========== БАКАЛЕЯ ==========
            { id: 40, code: 'ING-040', name: 'Мука пшеничная в/с', type: 'ingredient', category: 'Бакалея', baseUnit: 'кг', isAlcohol: false, minStock: 50.0, currentStock: 120.0, price: 50 },
            { id: 41, code: 'ING-041', name: 'Рис для роллов', type: 'ingredient', category: 'Бакалея', baseUnit: 'кг', isAlcohol: false, minStock: 20.0, currentStock: 18.5, price: 180 },
            { id: 42, code: 'ING-042', name: 'Паста спагетти', type: 'ingredient', category: 'Бакалея', baseUnit: 'кг', isAlcohol: false, minStock: 15.0, currentStock: 12.3, price: 120 },
            { id: 43, code: 'ING-043', name: 'Соль морская', type: 'ingredient', category: 'Бакалея', baseUnit: 'кг', isAlcohol: false, minStock: 10.0, currentStock: 8.5, price: 85 },
            { id: 44, code: 'ING-044', name: 'Сахар белый', type: 'ingredient', category: 'Бакалея', baseUnit: 'кг', isAlcohol: false, minStock: 15.0, currentStock: 12.8, price: 65 },
            { id: 45, code: 'ING-045', name: 'Масло оливковое Extra Virgin', type: 'ingredient', category: 'Бакалея', baseUnit: 'л', isAlcohol: false, minStock: 5.0, currentStock: 3.2, price: 850 },
            
            // ========== СОУСЫ И СПЕЦИИ ==========
            { id: 50, code: 'ING-050', name: 'Соус томатный классический', type: 'semi_product', category: 'Соусы и специи', baseUnit: 'л', isAlcohol: false, minStock: 10.0, currentStock: 8.5, price: 180 },
            { id: 51, code: 'ING-051', name: 'Майонез Провансаль', type: 'ingredient', category: 'Соусы и специи', baseUnit: 'кг', isAlcohol: false, minStock: 8.0, currentStock: 6.2, price: 145 },
            { id: 52, code: 'ING-052', name: 'Соевый соус', type: 'ingredient', category: 'Соусы и специи', baseUnit: 'л', isAlcohol: false, minStock: 3.0, currentStock: 2.1, price: 280 },
            { id: 53, code: 'ING-053', name: 'Васаби паста', type: 'ingredient', category: 'Соусы и специи', baseUnit: 'кг', isAlcohol: false, minStock: 0.5, currentStock: 0.3, price: 1200 },
            { id: 54, code: 'ING-054', name: 'Имбирь маринованный', type: 'ingredient', category: 'Соусы и специи', baseUnit: 'кг', isAlcohol: false, minStock: 2.0, currentStock: 1.5, price: 380 },
            
            // ========== КРЕПКИЙ АЛКОГОЛЬ ==========
            { id: 100, code: 'ALK-001', name: 'Водка "Русский Стандарт" 0.5л', type: 'alcohol', category: 'Крепкий алкоголь', baseUnit: 'шт', isAlcohol: true, alcoholStrength: 40.0, minStock: 20, currentStock: 12, price: 450 },
            { id: 101, code: 'ALK-002', name: 'Водка "Абсолют" 0.7л', type: 'alcohol', category: 'Крепкий алкоголь', baseUnit: 'шт', isAlcohol: true, alcoholStrength: 40.0, minStock: 15, currentStock: 8, price: 1200 },
            { id: 102, code: 'ALK-003', name: 'Виски "Jack Daniels" 0.7л', type: 'alcohol', category: 'Крепкий алкоголь', baseUnit: 'шт', isAlcohol: true, alcoholStrength: 40.0, minStock: 10, currentStock: 6, price: 2200 },
            { id: 103, code: 'ALK-004', name: 'Ром "Bacardi White" 0.7л', type: 'alcohol', category: 'Крепкий алкоголь', baseUnit: 'шт', isAlcohol: true, alcoholStrength: 40.0, minStock: 8, currentStock: 5, price: 1500 },
            { id: 104, code: 'ALK-005', name: 'Текила "Olmeca" 0.7л', type: 'alcohol', category: 'Крепкий алкоголь', baseUnit: 'шт', isAlcohol: true, alcoholStrength: 38.0, minStock: 8, currentStock: 4, price: 1800 },
            { id: 105, code: 'ALK-006', name: 'Коньяк "Арарат 5*" 0.5л', type: 'alcohol', category: 'Крепкий алкоголь', baseUnit: 'шт', isAlcohol: true, alcoholStrength: 40.0, minStock: 12, currentStock: 7, price: 1400 },
            
            // ========== ВИНО ==========
            { id: 110, code: 'ALK-010', name: 'Вино красное сухое "Кубань" 0.75л', type: 'alcohol', category: 'Вино', baseUnit: 'шт', isAlcohol: true, alcoholStrength: 12.0, minStock: 20, currentStock: 15, price: 450 },
            { id: 111, code: 'ALK-011', name: 'Вино белое полусухое "Абрау-Дюрсо" 0.75л', type: 'alcohol', category: 'Вино', baseUnit: 'шт', isAlcohol: true, alcoholStrength: 11.5, minStock: 20, currentStock: 12, price: 550 },
            { id: 112, code: 'ALK-012', name: 'Шампанское "Абрау-Дюрсо" 0.75л', type: 'alcohol', category: 'Вино', baseUnit: 'шт', isAlcohol: true, alcoholStrength: 10.5, minStock: 30, currentStock: 22, price: 650 },
            
            // ========== ПИВО БУТЫЛОЧНОЕ ==========
            { id: 120, code: 'ALK-020', name: 'Пиво "Балтика 3" 0.5л', type: 'alcohol', category: 'Пиво бутылочное', baseUnit: 'шт', isAlcohol: true, alcoholStrength: 4.8, minStock: 50, currentStock: 38, price: 85 },
            { id: 121, code: 'ALK-021', name: 'Пиво "Stella Artois" 0.5л', type: 'alcohol', category: 'Пиво бутылочное', baseUnit: 'шт', isAlcohol: true, alcoholStrength: 5.0, minStock: 40, currentStock: 28, price: 150 },
            { id: 122, code: 'ALK-022', name: 'Пиво "Guinness" 0.5л', type: 'alcohol', category: 'Пиво бутылочное', baseUnit: 'шт', isAlcohol: true, alcoholStrength: 4.2, minStock: 30, currentStock: 18, price: 220 },
            
            // ========== ПИВО РАЗЛИВНОЕ ==========
            { id: 130, code: 'ALK-030', name: 'Пиво светлое (кега 30л)', type: 'alcohol', category: 'Пиво разливное', baseUnit: 'л', isAlcohol: true, alcoholStrength: 4.5, minStock: 50, currentStock: 28.5, price: 120 },
            { id: 131, code: 'ALK-031', name: 'Пиво тёмное (кега 30л)', type: 'alcohol', category: 'Пиво разливное', baseUnit: 'л', isAlcohol: true, alcoholStrength: 4.8, minStock: 30, currentStock: 15.2, price: 135 },
            { id: 132, code: 'ALK-032', name: 'Пиво пшеничное (кега 50л)', type: 'alcohol', category: 'Пиво разливное', baseUnit: 'л', isAlcohol: true, alcoholStrength: 5.2, minStock: 50, currentStock: 42.8, price: 140 },
            
            // ========== НАПИТКИ ==========
            { id: 140, code: 'DRK-001', name: 'Coca-Cola 0.33л', type: 'ingredient', category: 'Напитки', baseUnit: 'шт', isAlcohol: false, minStock: 100, currentStock: 85, price: 45 },
            { id: 141, code: 'DRK-002', name: 'Sprite 0.33л', type: 'ingredient', category: 'Напитки', baseUnit: 'шт', isAlcohol: false, minStock: 80, currentStock: 65, price: 45 },
            { id: 142, code: 'DRK-003', name: 'Сок апельсиновый Rich 1л', type: 'ingredient', category: 'Напитки', baseUnit: 'шт', isAlcohol: false, minStock: 30, currentStock: 22, price: 120 },
            { id: 143, code: 'DRK-004', name: 'Вода минеральная газ. 0.5л', type: 'ingredient', category: 'Напитки', baseUnit: 'шт', isAlcohol: false, minStock: 100, currentStock: 78, price: 35 },
            
            // ========== ПОЛУФАБРИКАТЫ ==========
            { id: 150, code: 'SEMI-001', name: 'Тесто для пиццы (заготовка)', type: 'semi_product', category: 'Полуфабрикаты', baseUnit: 'шт', isAlcohol: false, minStock: 20, currentStock: 15, price: 85 },
            { id: 151, code: 'SEMI-002', name: 'Бульон куриный', type: 'semi_product', category: 'Полуфабрикаты', baseUnit: 'л', isAlcohol: false, minStock: 10, currentStock: 8.5, price: 120 },
            { id: 152, code: 'SEMI-003', name: 'Соус для пасты Карбонара', type: 'semi_product', category: 'Полуфабрикаты', baseUnit: 'л', isAlcohol: false, minStock: 5, currentStock: 3.2, price: 350 }
        ];
    }
    
    loadRecipes() {
        // Демо-данные техкарт
        return [
            {
                id: 1,
                code: 'TK-001',
                dishId: 101,
                dishName: 'Пицца Пепперони 30 см',
                version: 'v1.2',
                yieldOut: 450,
                yieldUnit: 'г',
                costPrice: 180,
                ingredients: [
                    { id: 1, name: 'Тесто', qty: 250, unit: 'г', k_evap: 5 },
                    { id: 2, name: 'Моцарелла', qty: 150, unit: 'г' },
                    { id: 3, name: 'Пепперони', qty: 100, unit: 'г' },
                    { id: 4, name: 'Соус томатный', qty: 80, unit: 'г' }
                ]
            },
            {
                id: 2,
                code: 'TK-002',
                dishId: 102,
                dishName: 'Ролл Филадельфия',
                version: 'v1.0',
                yieldOut: 220,
                yieldUnit: 'г',
                costPrice: 220,
                ingredients: [
                    { id: 5, name: 'Рис для роллов', qty: 120, unit: 'г' },
                    { id: 1, name: 'Лосось филе', qty: 80, unit: 'г' },
                    { id: 6, name: 'Сыр Филадельфия', qty: 50, unit: 'г' }
                ]
            }
        ];
    }
    
    loadWarehouses() {
        return [
            { id: 1, code: 'WH-MAIN', name: 'Основной склад', type: 'main' },
            { id: 2, code: 'WH-KITCHEN', name: 'Кухня/Цех', type: 'kitchen' },
            { id: 3, code: 'WH-BAR', name: 'Бар', type: 'bar' },
            { id: 4, code: 'WH-DRAFT', name: 'Разливной узел', type: 'draft_beer' }
        ];
    }
    
    loadStockBalances() {
        return [
            { warehouseId: 1, productId: 1, quantity: 0.8, costPerUnit: 1200, batchNumber: 'L-20240115', expiryDate: '2024-01-22' },
            { warehouseId: 1, productId: 2, quantity: 45.5, costPerUnit: 450, batchNumber: 'M-20240110', expiryDate: '2024-02-10' },
            { warehouseId: 3, productId: 3, quantity: 12, costPerUnit: 450, batchNumber: 'V-20240105', expiryDate: '2025-12-31' }
        ];
    }
    
    loadDashboardData() {
        console.log('📊 Loading dashboard data...');
        // Dashboard уже статичен в HTML, здесь можно обновить метрики
    }
    
    loadNomenclatureData() {
        console.log('📦 Loading nomenclature...');
        console.log('📦 Products count:', this.products.length);
        // Инициализация модуля номенклатуры
        if (window.nomenclatureModule) {
            console.log('🔄 Calling nomenclatureModule.init()...');
            nomenclatureModule.init();
        } else {
            console.error('❌ nomenclatureModule not found!');
        }
    }
    
    loadRecipesData() {
        console.log('📖 Loading recipes...');
        if (window.recipesModule) {
            recipesModule.init();
        }
    }
    
    loadWarehouseData() {
        console.log('🏭 Loading warehouse data...');
        if (window.warehouseModule) {
            warehouseModule.init();
        }
    }
    
    loadProductionData() {
        console.log('⚙️ Loading production data...');
        if (window.productionModule) {
            productionModule.init();
        }
    }
    
    loadBarData() {
        console.log('🍺 Loading bar data...');
        if (window.barModule) {
            barModule.init();
        }
    }
    
    loadInventoryData() {
        console.log('📋 Loading inventory data...');
        if (window.inventoryCountModule) {
            inventoryCountModule.init();
        }
    }
    
    loadEGAISData() {
        console.log('🍷 Loading EGAIS data...');
        if (window.egaisModule) {
            egaisModule.init();
        }
    }
    
    loadCRPTData() {
        console.log('🏷️ Loading CRPT data...');
        if (window.crptModule) {
            crptModule.init();
        }
    }
    
    loadMercuryData() {
        console.log('🐄 Loading Mercury data...');
        if (window.mercuryModule) {
            mercuryModule.init();
        }
    }
    
    loadIntegrationsData() {
        console.log('🔄 Loading integrations...');
        if (window.integrationsModule) {
            integrationsModule.init();
        }
    }
    
    loadReportsData() {
        console.log('📈 Loading reports...');
        if (window.reportsModule) {
            reportsModule.init();
        }
    }
    
    loadSettingsData() {
        console.log('⚙️ Loading settings...');
        
        // Инициализируем модуль настроек
        if (window.settingsModule) {
            settingsModule.init();
        }
        
        // Рендерим UI backup
        if (window.backupModule) {
            backupModule.renderBackupUI();
        }
        
        // Показываем Audit Log
        this.renderAuditLog();
    }

    /**
     * Рендер Audit Log
     */
    renderAuditLog() {
        const container = document.getElementById('auditLogContainer');
        if (!container) return;

        const logs = this.getAuditLog(50);

        if (logs.length === 0) {
            container.innerHTML = `
                <p style="text-align: center; color: var(--text-light); opacity: 0.7; padding: 2rem;">
                    Журнал изменений пуст
                </p>
            `;
            return;
        }

        const getActionText = (action) => {
            const actions = {
                'product_created': '➕ Создан товар',
                'product_updated': '✏️ Изменён товар',
                'product_deleted': '🗑️ Удалён товар',
                'recipe_created': '➕ Создана техкарта',
                'recipe_updated': '✏️ Изменена техкарта',
                'document_posted': '✓ Проведён документ',
                'backup_created': '💾 Создан backup',
                'backup_restored': '↩️ Восстановлен backup',
                'old_data_cleared': '🗑️ Очищены старые данные',
                'settings_updated': '⚙️ Изменены настройки'
            };
            return actions[action] || action;
        };

        container.innerHTML = `
            <div style="max-height: 500px; overflow-y: auto;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Дата/Время</th>
                            <th>Действие</th>
                            <th>Пользователь</th>
                            <th>Детали</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logs.map(log => `
                            <tr>
                                <td style="white-space: nowrap;">${new Date(log.timestamp).toLocaleString('ru-RU')}</td>
                                <td>${getActionText(log.action)}</td>
                                <td><code>${log.user}</code></td>
                                <td style="font-size: 0.85em; color: var(--text-light); opacity: 0.8;">
                                    ${JSON.stringify(log.details).substring(0, 100)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Добавление записи в Audit Log
     */
    addAuditLog(action, details = {}) {
        const logEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            action: action,
            user: this.currentUser || 'system',
            details: details
        };

        // Загружаем существующий лог
        let auditLog = [];
        const saved = localStorage.getItem('dandy_audit_log');
        if (saved) {
            try {
                auditLog = JSON.parse(saved);
            } catch (e) {
                console.error('Error parsing audit log:', e);
            }
        }

        // Добавляем новую запись
        auditLog.push(logEntry);

        // Храним только последние 1000 записей
        if (auditLog.length > 1000) {
            auditLog = auditLog.slice(-1000);
        }

        // Сохраняем
        localStorage.setItem('dandy_audit_log', JSON.stringify(auditLog));

        console.log('📝 Audit log:', action, details);
    }

    /**
     * Получение Audit Log
     */
    getAuditLog(limit = 100) {
        const saved = localStorage.getItem('dandy_audit_log');
        if (!saved) return [];

        try {
            const log = JSON.parse(saved);
            return log.slice(-limit).reverse(); // Последние N записей, новые сверху
        } catch (e) {
            console.error('Error parsing audit log:', e);
            return [];
        }
    }
    
    // ===== Business Logic =====
    
    /**
     * Создание нового товара
     */
    createProduct(productData) {
        const newProduct = {
            id: Date.now(),
            code: productData.code || `PRD-${Date.now()}`,
            name: productData.name,
            type: productData.type,
            category: productData.category,
            baseUnit: productData.baseUnit,
            isAlcohol: productData.isAlcohol || false,
            minStock: productData.minStock || 0,
            currentStock: 0,
            price: productData.price || 0,
            createdAt: new Date().toISOString()
        };
        
        this.products.push(newProduct);
        this.saveToLocalStorage('products', this.products);
        
        return newProduct;
    }
    
    /**
     * Создание техкарты
     */
    createRecipe(recipeData) {
        const newRecipe = {
            id: Date.now(),
            code: recipeData.code || `TK-${Date.now()}`,
            dishId: recipeData.dishId,
            dishName: recipeData.dishName,
            version: recipeData.version || 'v1.0',
            yieldOut: recipeData.yieldOut,
            yieldUnit: recipeData.yieldUnit,
            ingredients: recipeData.ingredients || [],
            createdAt: new Date().toISOString()
        };
        
        // Расчет себестоимости
        newRecipe.costPrice = this.calculateRecipeCost(newRecipe);
        
        this.recipes.push(newRecipe);
        this.saveToLocalStorage('recipes', this.recipes);
        
        return newRecipe;
    }
    
    /**
     * Расчет себестоимости по ТК
     */
    calculateRecipeCost(recipe) {
        let totalCost = 0;
        
        recipe.ingredients.forEach(ing => {
            const product = this.products.find(p => p.id === ing.id);
            if (product) {
                // Учитываем потери (уварка/ужарка)
                const lossCoeff = 1 + (ing.k_evap || 0) / 100;
                const actualQty = ing.qty * lossCoeff;
                
                // Пересчет в базовую единицу
                const qtyInBaseUnit = this.convertToBaseUnit(actualQty, ing.unit, product.baseUnit);
                
                totalCost += qtyInBaseUnit * product.price;
            }
        });
        
        return Math.round(totalCost * 100) / 100;
    }
    
    /**
     * Конвертация единиц измерения
     */
    convertToBaseUnit(quantity, fromUnit, toUnit) {
        // Упрощенная конверсия (в реальной системе — таблица пересчетов)
        const conversions = {
            'кг-г': 1000,
            'г-кг': 0.001,
            'л-мл': 1000,
            'мл-л': 0.001
        };
        
        const key = `${toUnit}-${fromUnit}`;
        const coeff = conversions[key] || 1;
        
        return quantity * coeff;
    }
    
    /**
     * Создание документа прихода
     */
    createArrivalDocument(docData) {
        const newDoc = {
            id: Date.now(),
            docType: 'arrival',
            docNumber: docData.docNumber || `ARR-${Date.now()}`,
            docDate: docData.docDate || new Date().toISOString().split('T')[0],
            warehouseId: docData.warehouseId,
            supplierId: docData.supplierId,
            lines: docData.lines || [],
            status: 'draft',
            createdAt: new Date().toISOString()
        };
        
        // Расчет общей суммы
        newDoc.totalAmount = newDoc.lines.reduce((sum, line) => {
            return sum + (line.quantity * line.costPerUnit);
        }, 0);
        
        this.documents.push(newDoc);
        this.saveToLocalStorage('documents', this.documents);
        
        return newDoc;
    }
    
    /**
     * Проведение документа (обновление остатков)
     */
    postDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc || doc.status === 'posted') {
            throw new Error('Document not found or already posted');
        }
        
        // Обновляем остатки
        doc.lines.forEach(line => {
            const balance = this.stockBalances.find(b => 
                b.warehouseId === doc.warehouseId && 
                b.productId === line.productId &&
                b.batchNumber === line.batchNumber
            );
            
            if (balance) {
                balance.quantity += line.quantity;
            } else {
                this.stockBalances.push({
                    warehouseId: doc.warehouseId,
                    productId: line.productId,
                    quantity: line.quantity,
                    costPerUnit: line.costPerUnit,
                    batchNumber: line.batchNumber,
                    expiryDate: line.expiryDate
                });
            }
            
            // Обновляем текущий остаток в номенклатуре
            const product = this.products.find(p => p.id === line.productId);
            if (product) {
                product.currentStock += line.quantity;
            }
        });
        
        doc.status = 'posted';
        doc.postedAt = new Date().toISOString();
        
        this.saveToLocalStorage('documents', this.documents);
        this.saveToLocalStorage('stockBalances', this.stockBalances);
        this.saveToLocalStorage('products', this.products);
        
        return doc;
    }
    
    /**
     * Списание по чеку (реализация)
     */
    writeoffBySale(saleData) {
        const writeoffDoc = {
            id: Date.now(),
            docType: 'writeoff',
            docNumber: `WO-${Date.now()}`,
            docDate: new Date().toISOString().split('T')[0],
            reason: 'sale',
            receiptId: saleData.receiptId,
            lines: [],
            status: 'draft',
            createdAt: new Date().toISOString()
        };
        
        // Разбираем блюда по ТК
        saleData.items.forEach(item => {
            const recipe = this.recipes.find(r => r.dishId === item.dishId);
            if (recipe) {
                recipe.ingredients.forEach(ing => {
                    // FEFO: списываем с ближайшим сроком годности
                    const batch = this.findBatchForWriteoff(ing.id, saleData.warehouseId);
                    
                    if (batch) {
                        writeoffDoc.lines.push({
                            productId: ing.id,
                            batchId: batch.id,
                            batchNumber: batch.batchNumber,
                            quantity: ing.qty * item.quantity,
                            unit: ing.unit,
                            costPerUnit: batch.costPerUnit
                        });
                    } else {
                        console.warn(`⚠️ Недостаточно остатка для ${ing.name}`);
                    }
                });
            }
        });
        
        this.documents.push(writeoffDoc);
        this.postDocument(writeoffDoc.id);
        
        return writeoffDoc;
    }
    
    /**
     * Поиск партии для списания (FEFO)
     */
    findBatchForWriteoff(productId, warehouseId) {
        const batches = this.stockBalances
            .filter(b => b.productId === productId && b.warehouseId === warehouseId && b.quantity > 0)
            .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
        
        return batches[0];
    }
    
    /**
     * Инвентаризация
     */
    createInventory(inventoryData) {
        const invDoc = {
            id: Date.now(),
            docType: 'inventory',
            docNumber: `INV-${Date.now()}`,
            docDate: new Date().toISOString().split('T')[0],
            warehouseId: inventoryData.warehouseId,
            lines: inventoryData.lines || [],
            status: 'draft',
            createdAt: new Date().toISOString()
        };
        
        // Расчет расхождений
        invDoc.lines.forEach(line => {
            const balance = this.stockBalances.find(b => 
                b.warehouseId === invDoc.warehouseId && 
                b.productId === line.productId &&
                b.batchNumber === line.batchNumber
            );
            
            line.quantityByAccount = balance ? balance.quantity : 0;
            line.quantityActual = line.quantityActual || 0;
            line.difference = line.quantityActual - line.quantityByAccount;
            line.amountDifference = line.difference * (balance ? balance.costPerUnit : 0);
        });
        
        this.documents.push(invDoc);
        this.saveToLocalStorage('documents', this.documents);
        
        return invDoc;
    }
    
    /**
     * ЕГАИС: создание акта списания
     */
    createEGAISAct(actData) {
        const egaisAct = {
            id: Date.now(),
            operationType: actData.operationType, // 'sale', 'writeoff'
            documentId: actData.documentId,
            egaisGuid: `act-${Date.now()}`,
            ttnNumber: actData.ttnNumber,
            utmStatus: 'pending',
            createdAt: new Date().toISOString()
        };
        
        this.egaisOperations.push(egaisAct);
        this.saveToLocalStorage('egaisOperations', this.egaisOperations);
        
        // Имитация отправки в УТМ
        setTimeout(() => {
            egaisAct.utmStatus = 'sent';
            console.log('📤 ЕГАИС акт отправлен в УТМ:', egaisAct.egaisGuid);
        }, 1000);
        
        return egaisAct;
    }
    
    // ===== Utilities =====
    
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(`dandy_inventory_${key}`, JSON.stringify(data));
            console.log(`💾 Saved to localStorage: ${key}`);
        } catch (error) {
            console.error('❌ Error saving to localStorage:', error);
        }
    }
    
    loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(`dandy_inventory_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('❌ Error loading from localStorage:', error);
            return null;
        }
    }
    
    /**
     * Загрузка меню из menu_data.json (вызывается из модуля номенклатуры)
     */
    async autoLoadMenuData() {
        try {
            // Быстрая попытка загрузить через backend
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 секунды таймаут
            
            const response = await fetch('http://localhost:3000/menu_data.json', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error('Backend not available');
            }
            
            const data = await response.json();
            let addedCount = 0;
            
            // Маппинг категорий к типам товаров
            const categoryTypeMap = {
                'Пицца': 'dish',
                'Роллы': 'dish',
                'Маки': 'dish',
                'Запеченные': 'dish',
                'Темпура': 'dish',
                'Гунканы': 'dish',
                'Суши': 'dish',
                'Сеты': 'dish',
                'Салаты': 'dish',
                'Закуски': 'dish',
                'Супы': 'dish',
                'Сэндвичи': 'dish',
                'Wok': 'dish',
                'Завтраки': 'dish',
                'Блины': 'dish',
                'Пироги': 'dish',
                'Напитки': 'ingredient',
                'Соусы': 'semi_product',
                'Комбо': 'dish'
            };
            
            // Получаем текущий максимальный ID
            let maxId = Math.max(...this.products.map(p => p.id), 0);
            
            data.offers.forEach(item => {
                // Проверяем, не существует ли уже такой товар
                const exists = this.products.some(p => 
                    p.code === `MENU-${item.id}` || p.name.toLowerCase() === item.name.trim().toLowerCase()
                );
                
                if (exists) return;
                
                // Определяем тип товара на основе категории
                const categoryName = item.category_name || 'Другое';
                const productType = categoryTypeMap[categoryName] || 'ingredient';
                
                // Вычисляем примерную себестоимость (40% от цены продажи)
                const price = parseInt(item.price) || 0;
                const cost = Math.round(price * 0.4);
                
                // Пропускаем акционные товары за 1 рубль
                if (price <= 1) return;
                
                // Добавляем новый товар
                maxId++;
                this.products.push({
                    id: maxId,
                    code: `MENU-${item.id}`,
                    name: item.name.trim(),
                    type: productType,
                    category: categoryName,
                    baseUnit: 'шт',
                    isAlcohol: false,
                    minStock: 5.0,
                    currentStock: 0,
                    price: cost,
                    salePrice: price,
                    description: item.description ? item.description.replace(/<[^>]*>/g, '').substring(0, 200) : '',
                    picture: item.picture || '',
                    url: item.url || ''
                });
                
                addedCount++;
            });
            
            // Сохраняем обновлённый список
            this.saveToLocalStorage('products', this.products);
            
            console.log(`✅ Auto-loaded ${addedCount} products from menu! Total: ${this.products.length}`);
            
            // Обновляем таблицу, если мы на странице номенклатуры
            if (this.currentPage === 'nomenclature' && window.nomenclatureModule) {
                setTimeout(() => {
                    nomenclatureModule.renderProductsList();
                }, 100);
            }
            
        } catch (error) {
            console.warn('⚠️ Could not auto-load menu:', error.message);
        }
    }
    
    /**
     * Генерация отчетов
     */
    generateReport(reportType, params = {}) {
        console.log(`📊 Generating report: ${reportType}`, params);
        
        switch(reportType) {
            case 'cogs':
                return this.generateCOGSReport(params);
            case 'menu_engineering':
                return this.generateMenuEngineeringReport(params);
            case 'abc_xyz':
                return this.generateABCXYZReport(params);
            default:
                console.warn('Unknown report type:', reportType);
                return null;
        }
    }
    
    generateCOGSReport(params) {
        // COGS (Cost of Goods Sold) отчет
        const report = {
            type: 'cogs',
            period: params.period,
            totalSales: 0,
            totalCOGS: 0,
            grossProfit: 0,
            grossMargin: 0,
            items: []
        };
        
        // Здесь бы шел реальный расчет по проданным блюдам
        
        return report;
    }
    
    generateMenuEngineeringReport(params) {
        // Menu Engineering: Stars, Plowhorses, Puzzles, Dogs
        return {
            type: 'menu_engineering',
            stars: [], // Высокая маржа + высокий спрос
            plowhorses: [], // Низкая маржа + высокий спрос
            puzzles: [], // Высокая маржа + низкий спрос
            dogs: [] // Низкая маржа + низкий спрос
        };
    }
    
    generateABCXYZReport(params) {
        // ABC-XYZ анализ
        return {
            type: 'abc_xyz',
            A: [], // Высокая значимость (80% оборота)
            B: [], // Средняя (15%)
            C: [], // Низкая (5%)
            X: [], // Стабильный спрос
            Y: [], // Сезонный
            Z: [] // Непредсказуемый
        };
    }
}

// ===== Global Functions =====

function createProduct() {
    if (window.inventorySystem) {
        alert('🎯 Форма создания товара\n\nВведите данные о товаре');
        // В реальной системе — модальное окно с формой
    }
}

function createRecipe() {
    if (window.inventorySystem) {
        alert('📖 Редактор техкарты\n\nСоздание новой ТК/ТТК');
        // В реальной системе — визуальный редактор ТК
    }
}

function editRecipe(code) {
    if (window.inventorySystem) {
        alert(`✏️ Редактирование техкарты ${code}`);
    }
}

function startInventory() {
    if (window.inventorySystem) {
        alert('🎯 Начало инвентаризации\n\nВыберите склад и зону для пересчета');
    }
}

function openBottle() {
    if (window.inventorySystem) {
        alert('🔓 Вскрытие бутылки\n\nБудет создан акт списания в ЕГАИС');
    }
}

function syncFlowMeter() {
    if (window.inventorySystem) {
        alert('🔄 Сверка с расходомером\n\nПолучение данных с устройства...');
    }
}

// ===== Initialization =====

let inventorySystem;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing DANDY Inventory System...');
    
    inventorySystem = new DandyInventorySystem();
    window.inventorySystem = inventorySystem; // Make globally available
    
    console.log('✅ System initialized successfully');
    console.log('📦 Products:', inventorySystem.products.length);
    console.log('📖 Recipes:', inventorySystem.recipes.length);
    console.log('🏭 Warehouses:', inventorySystem.warehouses.length);
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DandyInventorySystem;
}

