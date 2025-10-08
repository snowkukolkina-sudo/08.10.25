exports.up = function(knex) {
  return knex.schema.createTable('payments', function(table) {
    table.increments('id').primary();
    table.string('order_id').notNullable();
    table.string('type').notNullable(); // 'cash', 'card', 'online', 'mixed'
    table.string('status').defaultTo('pending'); // 'pending', 'completed', 'failed', 'refunded'
    table.decimal('amount', 10, 2).notNullable();
    table.string('transaction_id').nullable();
    table.string('terminal_id').nullable();
    table.text('payment_data').nullable(); // JSON string
    table.text('notes').nullable();
    table.string('processed_by').nullable();
    table.datetime('processed_at').nullable();
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());
    
    table.foreign('order_id').references('id').inTable('orders').onDelete('CASCADE');
    table.index(['order_id']);
    table.index(['transaction_id']);
    table.index(['status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('payments');
};
