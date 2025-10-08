// Миграция для интеграций: ЕГАИС, Меркурий, Честный знак, ЭДО, ERP, Агрегаторы

exports.up = function(knex) {
  return knex.schema
    // ЕГАИС (учёт алкоголя)
    .createTable('egais_documents', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('document_type').notNullable(); // WayBill, ActChargeOn, etc.
      table.string('document_number').notNullable();
      table.date('document_date').notNullable();
      table.string('fsrar_id').nullable(); // ID в ЕГАИС
      table.enum('status', ['draft', 'sent', 'accepted', 'rejected', 'cancelled']).defaultTo('draft');
      table.jsonb('document_data').notNullable();
      table.text('response_xml').nullable();
      table.text('error_message').nullable();
      table.timestamp('sent_at').nullable();
      table.timestamp('processed_at').nullable();
      table.timestamps(true, true);
      
      table.index(['document_type', 'status']);
      table.index(['document_number']);
    })
    
    // Меркурий (ветеринарный контроль)
    .createTable('mercury_documents', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('document_type').notNullable(); // VSD, Production, etc.
      table.string('document_uuid').unique().notNullable();
      table.string('vsd_number').nullable(); // Номер ВСД
      table.uuid('product_id').nullable().references('id').inTable('products');
      table.date('issue_date').notNullable();
      table.date('expiry_date').nullable();
      table.string('supplier').nullable();
      table.string('producer').nullable();
      table.enum('status', ['active', 'used', 'cancelled', 'expired']).defaultTo('active');
      table.jsonb('document_data').notNullable();
      table.timestamps(true, true);
      
      table.index(['vsd_number']);
      table.index(['status']);
    })
    
    // Честный знак (маркировка)
    .createTable('honest_sign_marks', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('product_id').notNullable().references('id').inTable('products');
      table.string('gtin').notNullable(); // Код товара
      table.string('sgtin').unique().notNullable(); // Индивидуальный код
      table.string('kit_code').nullable(); // Код комплекта
      table.enum('status', ['available', 'sold', 'returned', 'withdrawn']).defaultTo('available');
      table.uuid('order_id').nullable().references('id').inTable('orders');
      table.timestamp('marked_at').defaultTo(knex.fn.now());
      table.timestamp('sold_at').nullable();
      table.jsonb('ofd_data').nullable(); // Данные отправленные в ОФД
      table.timestamps(true, true);
      
      table.index(['sgtin']);
      table.index(['product_id', 'status']);
    })
    
    // ЭДО (электронный документооборот)
    .createTable('edo_documents', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('document_type').notNullable(); // invoice, act, contract, etc.
      table.string('document_number').notNullable();
      table.date('document_date').notNullable();
      table.string('counterparty').notNullable();
      table.string('counterparty_inn').notNullable();
      table.decimal('document_sum', 12, 2).nullable();
      table.enum('direction', ['incoming', 'outgoing']).notNullable();
      table.enum('status', ['draft', 'sent', 'delivered', 'signed', 'rejected']).defaultTo('draft');
      table.text('file_path').nullable();
      table.text('signature').nullable(); // ЭЦП
      table.timestamp('signed_at').nullable();
      table.uuid('signed_by').nullable().references('id').inTable('users');
      table.jsonb('metadata').defaultTo('{}');
      table.timestamps(true, true);
      
      table.index(['document_type', 'status']);
      table.index(['counterparty_inn']);
    })
    
    // 1С интеграция (обмен данными)
    .createTable('erp_sync_log', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('erp_system').notNullable(); // 1c, sap, oracle
      table.string('entity_type').notNullable(); // products, orders, payments, etc.
      table.uuid('entity_id').nullable();
      table.string('external_id').nullable();
      table.enum('operation', ['create', 'update', 'delete', 'sync']).notNullable();
      table.enum('direction', ['to_erp', 'from_erp']).notNullable();
      table.enum('status', ['pending', 'success', 'failed']).defaultTo('pending');
      table.jsonb('data').nullable();
      table.text('error_message').nullable();
      table.integer('retry_count').defaultTo(0);
      table.timestamp('last_retry_at').nullable();
      table.timestamps(true, true);
      
      table.index(['entity_type', 'status']);
      table.index(['external_id']);
    })
    
    // Агрегаторы доставки
    .createTable('aggregator_orders', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('aggregator').notNullable(); // yandex, deliveryclub, etc.
      table.string('external_order_id').notNullable();
      table.uuid('internal_order_id').nullable().references('id').inTable('orders');
      table.enum('status', ['new', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled']).defaultTo('new');
      table.decimal('order_sum', 10, 2).notNullable();
      table.decimal('commission', 10, 2).nullable();
      table.jsonb('order_data').notNullable();
      table.timestamp('placed_at').notNullable();
      table.timestamp('confirmed_at').nullable();
      table.timestamp('delivered_at').nullable();
      table.timestamps(true, true);
      
      table.index(['aggregator', 'external_order_id']);
      table.index(['internal_order_id']);
    })
    
    // KDS (Kitchen Display System) заказы
    .createTable('kds_orders', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
      table.string('station').notNullable(); // hot, cold, bar
      table.integer('display_number').notNullable(); // Номер на экране
      table.enum('priority', ['normal', 'high', 'urgent']).defaultTo('normal');
      table.enum('status', ['pending', 'preparing', 'ready', 'served']).defaultTo('pending');
      table.timestamp('received_at').defaultTo(knex.fn.now());
      table.timestamp('started_at').nullable();
      table.timestamp('completed_at').nullable();
      table.uuid('prepared_by').nullable().references('id').inTable('users');
      table.integer('preparation_time').nullable(); // в секундах
      table.jsonb('items').notNullable(); // Позиции для этой станции
      table.text('notes').nullable();
      
      table.index(['station', 'status']);
      table.index(['order_id']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('kds_orders')
    .dropTableIfExists('aggregator_orders')
    .dropTableIfExists('erp_sync_log')
    .dropTableIfExists('edo_documents')
    .dropTableIfExists('honest_sign_marks')
    .dropTableIfExists('mercury_documents')
    .dropTableIfExists('egais_documents');
};
