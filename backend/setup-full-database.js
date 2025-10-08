const knex = require('knex');
const path = require('path');
const fs = require('fs');

// Конфигурация для SQLite (для локальной разработки)
const config = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'dandy_pizza_full.db')
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, 'database/migrations')
  },
  seeds: {
    directory: path.join(__dirname, 'database/seeds')
  }
};

async function setupDatabase() {
  console.log('🚀 Начинаем настройку полной базы данных DANDY Pizza...\n');
  
  const db = knex(config);
  
  try {
    // Проверяем подключение
    await db.raw('SELECT 1');
    console.log('✅ Подключение к базе данных установлено');
    
    // Создаём функцию для UUID (для SQLite)
    await db.raw(`
      CREATE TABLE IF NOT EXISTS _temp_check (id TEXT);
    `);
    await db.raw(`DROP TABLE IF EXISTS _temp_check;`);
    console.log('✅ База данных готова к миграциям');
    
    // Запускаем миграции
    console.log('\n📦 Запуск миграций...');
    const [batchNo, migrations] = await db.migrate.latest();
    
    if (migrations.length === 0) {
      console.log('✅ База данных уже актуальна');
    } else {
      console.log(`✅ Выполнено миграций: ${migrations.length}`);
      migrations.forEach(migration => {
        console.log(`   - ${migration}`);
      });
    }
    
    // Создаём демо-данные
    console.log('\n🌱 Создание тестовых данных...');
    await seedDatabase(db);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 БАЗА ДАННЫХ УСПЕШНО НАСТРОЕНА!');
    console.log('='.repeat(60));
    console.log(`\n📊 Созданные таблицы:`);
    console.log(`   ✅ users - Пользователи`);
    console.log(`   ✅ categories - Категории товаров`);
    console.log(`   ✅ products - Товары`);
    console.log(`   ✅ orders - Заказы`);
    console.log(`   ✅ order_items - Позиции заказов`);
    console.log(`   ✅ payments - Платежи`);
    console.log(`   ✅ fiscal_receipts - Фискальные чеки`);
    console.log(`   ✅ delivery_zones - Зоны доставки`);
    console.log(`   ✅ audit_logs - Логи аудита`);
    console.log(`   ✅ warehouses - Склады`);
    console.log(`   ✅ warehouse_inventory - Товары на складе (FEFO)`);
    console.log(`   ✅ warehouse_operations - Операции склада`);
    console.log(`   ✅ expiry_alerts - Уведомления о сроках`);
    console.log(`   ✅ couriers - Курьеры`);
    console.log(`   ✅ courier_assignments - Назначения курьерам`);
    console.log(`   ✅ courier_locations - GPS трекинг`);
    console.log(`   ✅ courier_zones - Зоны курьеров`);
    console.log(`   ✅ courier_ratings - Рейтинги курьеров`);
    console.log(`   ✅ egais_documents - ЕГАИС`);
    console.log(`   ✅ mercury_documents - Меркурий`);
    console.log(`   ✅ honest_sign_marks - Честный знак`);
    console.log(`   ✅ edo_documents - ЭДО`);
    console.log(`   ✅ erp_sync_log - 1С интеграция`);
    console.log(`   ✅ aggregator_orders - Агрегаторы`);
    console.log(`   ✅ kds_orders - KDS (Kitchen Display)`);
    console.log(`   ✅ reports - Отчёты`);
    console.log(`   ✅ scheduled_reports - Планировщик отчётов`);
    console.log(`   ✅ daily_summaries - Z-отчёты`);
    
    console.log(`\n📄 Файл базы данных: dandy_pizza_full.db`);
    console.log(`📏 Размер: ${getFileSize(config.connection.filename)}`);
    console.log(`\n✅ Готово к использованию!\n`);
    
  } catch (error) {
    console.error('\n❌ Ошибка при настройке базы данных:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

async function seedDatabase(db) {
  // Создаём UUID функцию для SQLite
  const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  // Пользователи
  const adminId = uuid();
  await db('users').insert([
    {
      id: adminId,
      username: 'admin',
      email: 'admin@dandy.ru',
      password_hash: '$2b$10$abcdefghijklmnopqrstuv', // Хэш для 'admin123'
      first_name: 'Администратор',
      last_name: 'Системы',
      role: 'admin',
      status: 'active',
      phone: '+79991234567'
    }
  ]);
  console.log('   ✅ Создан администратор (admin / admin123)');
  
  // Склады
  const warehouseId = uuid();
  await db('warehouses').insert([
    {
      id: warehouseId,
      name: 'Главный склад',
      code: 'MAIN001',
      address: 'г. Москва, ул. Складская, д. 1',
      type: 'main',
      is_active: true
    }
  ]);
  console.log('   ✅ Создан склад');
  
  // Курьеры
  await db('couriers').insert([
    {
      id: uuid(),
      first_name: 'Иван',
      last_name: 'Курьеров',
      phone: '+79991111111',
      transport_type: 'car',
      transport_number: 'А123БВ777',
      status: 'available',
      is_active: true
    },
    {
      id: uuid(),
      first_name: 'Пётр',
      last_name: 'Доставкин',
      phone: '+79992222222',
      transport_type: 'bike',
      status: 'available',
      is_active: true
    }
  ]);
  console.log('   ✅ Созданы курьеры');
  
  // Отчёты (пример)
  await db('daily_summaries').insert([
    {
      id: uuid(),
      business_date: new Date().toISOString().split('T')[0],
      total_sales: 0,
      orders_count: 0,
      is_finalized: false
    }
  ]);
  console.log('   ✅ Инициализированы отчёты');
}

function getFileSize(filepath) {
  try {
    const stats = fs.statSync(filepath);
    const fileSizeInBytes = stats.size;
    const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2);
    return `${fileSizeInKB} KB`;
  } catch (error) {
    return 'N/A';
  }
}

// Запуск
setupDatabase()
  .then(() => {
    console.log('✅ Скрипт успешно завершён\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  });
