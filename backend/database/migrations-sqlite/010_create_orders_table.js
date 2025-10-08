exports.up = function(knex) {
  return knex.schema.createTable('orders', function(table) {
    table.string('id').primary();
    table.string('customer_name').notNullable();
    table.string('customer_phone').notNullable();
    table.string('customer_email').nullable();
    table.string('delivery_type').notNullable(); // 'delivery' or 'pickup'
    table.string('payment_method').notNullable(); // 'card', 'cash', 'sbp'
    table.string('address').nullable();
    table.string('apartment').nullable();
    table.text('address_comment').nullable();
    table.text('order_comment').nullable();
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('delivery_cost', 10, 2).notNullable().defaultTo(0);
    table.decimal('total', 10, 2).notNullable();
    table.string('status').notNullable().defaultTo('accepted'); // accepted, preparing, ready, with_courier, in_transit, delivered, cancelled
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());

    table.index(['status']);
    table.index(['created_at']);
    table.index(['customer_phone']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('orders');
};


