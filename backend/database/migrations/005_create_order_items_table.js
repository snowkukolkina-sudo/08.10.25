exports.up = function(knex) {
  return knex.schema.createTable('order_items', function(table) {
    table.increments('id').primary();
    table.string('order_id').notNullable();
    table.string('product_name').notNullable();
    table.decimal('product_price', 10, 2).notNullable();
    table.integer('quantity').notNullable();
    table.decimal('total', 10, 2).notNullable();
    table.text('extras').nullable(); // JSON string for extras/modifiers
    table.datetime('created_at').defaultTo(knex.fn.now());

    table.foreign('order_id').references('id').inTable('orders').onDelete('CASCADE');
    table.index(['order_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('order_items');
};
