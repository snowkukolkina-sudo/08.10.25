// Миграция для системы отчётов

exports.up = function(knex) {
  return knex.schema
    // Таблица сохранённых отчётов
    .createTable('reports', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('report_type').notNullable(); // sales, inventory, cashier, etc.
      table.string('title').notNullable();
      table.date('period_start').notNullable();
      table.date('period_end').notNullable();
      table.uuid('generated_by').notNullable().references('id').inTable('users');
      table.enum('format', ['pdf', 'xlsx', 'csv', 'json']).notNullable();
      table.text('file_path').nullable();
      table.jsonb('parameters').defaultTo('{}');
      table.jsonb('data').notNullable();
      table.timestamp('generated_at').defaultTo(knex.fn.now());
      table.boolean('is_scheduled').defaultTo(false);
      table.timestamps(true, true);
      
      table.index(['report_type', 'period_start', 'period_end']);
      table.index(['generated_by']);
    })
    
    // Таблица запланированных отчётов
    .createTable('scheduled_reports', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('report_type').notNullable();
      table.string('name').notNullable();
      table.string('schedule').notNullable(); // Cron expression
      table.uuid('recipient_user_id').nullable().references('id').inTable('users');
      table.string('recipient_email').nullable();
      table.enum('format', ['pdf', 'xlsx', 'csv']).notNullable();
      table.jsonb('parameters').defaultTo('{}');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('last_run_at').nullable();
      table.timestamp('next_run_at').nullable();
      table.timestamps(true, true);
      
      table.index(['is_active', 'next_run_at']);
    })
    
    // Таблица дневных сводок (Z-отчёты)
    .createTable('daily_summaries', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.date('business_date').notNullable();
      table.uuid('cashier_id').nullable().references('id').inTable('users');
      table.decimal('cash_sales', 12, 2).defaultTo(0);
      table.decimal('card_sales', 12, 2).defaultTo(0);
      table.decimal('online_sales', 12, 2).defaultTo(0);
      table.decimal('total_sales', 12, 2).notNullable();
      table.integer('orders_count').defaultTo(0);
      table.integer('cancelled_orders_count').defaultTo(0);
      table.decimal('average_check', 10, 2).defaultTo(0);
      table.decimal('tips_total', 10, 2).defaultTo(0);
      table.decimal('discounts_total', 10, 2).defaultTo(0);
      table.jsonb('sales_by_category').defaultTo('{}');
      table.jsonb('sales_by_hour').defaultTo('{}');
      table.timestamp('shift_opened_at').nullable();
      table.timestamp('shift_closed_at').nullable();
      table.uuid('closed_by').nullable().references('id').inTable('users');
      table.boolean('is_finalized').defaultTo(false);
      table.timestamps(true, true);
      
      table.unique(['business_date', 'cashier_id']);
      table.index(['business_date']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('daily_summaries')
    .dropTableIfExists('scheduled_reports')
    .dropTableIfExists('reports');
};
