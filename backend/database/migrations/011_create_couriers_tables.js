// Миграция для системы управления курьерами

exports.up = function(knex) {
  return knex.schema
    // Таблица курьеров
    .createTable('couriers', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('phone').unique().notNullable();
      table.string('email').nullable();
      table.string('transport_type').notNullable(); // car, bike, scooter, foot
      table.string('transport_number').nullable(); // Номер авто/мотоцикла
      table.enum('status', ['available', 'busy', 'offline', 'on_break']).defaultTo('offline');
      table.decimal('rating', 3, 2).defaultTo(5.00);
      table.integer('total_deliveries').defaultTo(0);
      table.jsonb('work_schedule').defaultTo('{}'); // График работы
      table.jsonb('documents').defaultTo('{}'); // Паспорт, права и т.д.
      table.string('photo_url').nullable();
      table.boolean('is_active').defaultTo(true);
      table.date('hire_date').nullable();
      table.timestamps(true, true);
      
      table.index(['status']);
      table.index(['phone']);
    })
    
    // Таблица назначений заказов курьерам
    .createTable('courier_assignments', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
      table.uuid('courier_id').notNullable().references('id').inTable('couriers').onDelete('CASCADE');
      table.timestamp('assigned_at').defaultTo(knex.fn.now());
      table.timestamp('picked_up_at').nullable();
      table.timestamp('delivered_at').nullable();
      table.timestamp('cancelled_at').nullable();
      table.enum('status', [
        'assigned',      // Назначен
        'accepted',      // Принят
        'rejected',      // Отклонён
        'en_route',      // В пути к ресторану
        'picked_up',     // Забрал заказ
        'delivering',    // Везёт клиенту
        'delivered',     // Доставлен
        'cancelled'      // Отменён
      ]).defaultTo('assigned');
      table.decimal('delivery_fee', 10, 2).nullable();
      table.decimal('tip_amount', 10, 2).defaultTo(0);
      table.text('cancellation_reason').nullable();
      table.jsonb('tracking_data').defaultTo('{}'); // GPS координаты
      table.timestamps(true, true);
      
      table.index(['courier_id', 'status']);
      table.index(['order_id']);
    })
    
    // Таблица местоположения курьеров в реальном времени
    .createTable('courier_locations', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('courier_id').notNullable().references('id').inTable('couriers').onDelete('CASCADE');
      table.decimal('latitude', 10, 7).notNullable();
      table.decimal('longitude', 10, 7).notNullable();
      table.decimal('accuracy', 10, 2).nullable(); // Точность в метрах
      table.decimal('speed', 5, 2).nullable(); // Скорость км/ч
      table.integer('heading').nullable(); // Направление 0-360
      table.timestamp('recorded_at').defaultTo(knex.fn.now());
      table.uuid('assignment_id').nullable().references('id').inTable('courier_assignments');
      
      table.index(['courier_id', 'recorded_at']);
      table.index(['assignment_id']);
    })
    
    // Таблица зон доставки курьеров
    .createTable('courier_zones', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('courier_id').notNullable().references('id').inTable('couriers').onDelete('CASCADE');
      table.uuid('delivery_zone_id').notNullable().references('id').inTable('delivery_zones').onDelete('CASCADE');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
      
      table.unique(['courier_id', 'delivery_zone_id']);
    })
    
    // Таблица рейтинга и отзывов
    .createTable('courier_ratings', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
      table.uuid('courier_id').notNullable().references('id').inTable('couriers').onDelete('CASCADE');
      table.integer('rating').notNullable(); // 1-5
      table.text('comment').nullable();
      table.jsonb('criteria_ratings').defaultTo('{}'); // Отдельные оценки
      table.uuid('customer_id').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index(['courier_id', 'rating']);
      table.index(['order_id']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('courier_ratings')
    .dropTableIfExists('courier_zones')
    .dropTableIfExists('courier_locations')
    .dropTableIfExists('courier_assignments')
    .dropTableIfExists('couriers');
};
