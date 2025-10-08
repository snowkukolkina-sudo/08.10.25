// Миграция для складского учёта с FEFO (First Expired, First Out)

exports.up = function(knex) {
  return knex.schema
    // Таблица складов/точек хранения
    .createTable('warehouses', function(table) {
      table.string('id', 36).primary();
      table.string('name').notNullable();
      table.string('code').unique().notNullable();
      table.string('address').nullable();
      table.string('type').notNullable();
      table.boolean('is_active').defaultTo(true);
      table.jsonb('settings').defaultTo('{}');
      table.timestamps(true, true);
    })
    
    // Таблица товаров на складе
    .createTable('warehouse_inventory', function(table) {
      table.string('id', 36).primary();
      table.string('warehouse_id', 36).notNullable().references('id').inTable('warehouses').onDelete('CASCADE');
      table.string('product_id', 36).notNullable().references('id').inTable('products').onDelete('CASCADE');
      table.string('batch_number').notNullable(); // Номер партии
      table.decimal('quantity', 10, 3).notNullable().defaultTo(0);
      table.string('unit').notNullable().defaultTo('kg'); // kg, pcs, l
      table.date('production_date').nullable();
      table.date('expiry_date').notNullable(); // Срок годности (для FEFO)
      table.decimal('purchase_price', 10, 2).notNullable();
      table.string('supplier').nullable();
      table.string('supplier_invoice').nullable();
      table.string('status').defaultTo('available');
      table.jsonb('documents').defaultTo('{}'); // Меркурий, ЕГАИС и т.д.
      table.timestamps(true, true);
      
      table.index(['warehouse_id', 'product_id']);
      table.index(['expiry_date']); // Для FEFO
      table.index(['status']);
    })
    
    // Таблица операций склада
    .createTable('warehouse_operations', function(table) {
      table.string('id', 36).primary();
      table.string('warehouse_id', 36).notNullable().references('id').inTable('warehouses').onDelete('CASCADE');
      table.string('product_id', 36).notNullable().references('id').inTable('products').onDelete('CASCADE');
      table.string('inventory_id', 36).nullable().references('id').inTable('warehouse_inventory');
      table.string('operation_type').notNullable();
      table.decimal('quantity', 10, 3).notNullable();
      table.string('unit').notNullable();
      table.decimal('price', 10, 2).nullable();
      table.string('related_order_id', 36).nullable().references('id').inTable('orders');
      table.string('target_warehouse_id', 36).nullable().references('id').inTable('warehouses'); // Для перемещений
      table.string('user_id', 36).notNullable().references('id').inTable('users');
      table.string('reason').nullable();
      table.text('comment').nullable();
      table.jsonb('metadata').defaultTo('{}');
      table.timestamp('operation_date').defaultTo(knex.fn.now());
      table.timestamps(true, true);
      
      table.index(['warehouse_id', 'operation_date']);
      table.index(['operation_type']);
      table.index(['product_id']);
    })
    
    // Таблица для уведомлений об истечении сроков
    .createTable('expiry_alerts', function(table) {
      table.string('id', 36).primary();
      table.string('inventory_id', 36).notNullable().references('id').inTable('warehouse_inventory').onDelete('CASCADE');
      table.string('product_id', 36).notNullable().references('id').inTable('products');
      table.string('warehouse_id', 36).notNullable().references('id').inTable('warehouses');
      table.date('expiry_date').notNullable();
      table.integer('days_until_expiry').notNullable();
      table.string('alert_level').notNullable();
      table.boolean('is_resolved').defaultTo(false);
      table.timestamp('resolved_at').nullable();
      table.string('resolved_by', 36).nullable().references('id').inTable('users');
      table.timestamps(true, true);
      
      table.index(['expiry_date']);
      table.index(['alert_level', 'is_resolved']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('expiry_alerts')
    .dropTableIfExists('warehouse_operations')
    .dropTableIfExists('warehouse_inventory')
    .dropTableIfExists('warehouses');
};
