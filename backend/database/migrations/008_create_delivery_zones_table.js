exports.up = function(knex) {
  return knex.schema.createTable('delivery_zones', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('description').nullable();
    table.jsonb('polygon_coordinates').notNullable();
    table.decimal('delivery_fee', 10, 2).defaultTo(0);
    table.integer('min_order_amount').defaultTo(0);
    table.integer('estimated_delivery_time').defaultTo(30);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('delivery_zones');
};
