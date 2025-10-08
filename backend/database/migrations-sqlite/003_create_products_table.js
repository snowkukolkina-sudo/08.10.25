exports.up = function(knex) {
  return knex.schema.createTable('products', function(table) {
    table.string('id').primary();
    table.string('name').notNullable();
    table.string('sku').unique().notNullable();
    table.text('description').nullable();
    table.string('category_id').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.decimal('cost', 10, 2).nullable();
    table.string('image_url').nullable();
    table.text('images').nullable(); // JSON as text
    table.text('modifiers').nullable(); // JSON as text
    table.text('allergens').nullable(); // JSON as text
    table.text('nutrition').nullable(); // JSON as text
    table.boolean('is_available').defaultTo(true);
    table.boolean('is_marked').defaultTo(false);
    table.string('marking_code').nullable();
    table.integer('sort_order').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['category_id', 'is_available']);
    table.index(['sku', 'name']);
    table.index(['is_marked', 'marking_code']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('products');
};
