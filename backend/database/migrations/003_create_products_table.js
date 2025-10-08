exports.up = function(knex) {
  return knex.schema.createTable('products', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('sku').unique().notNullable();
    table.text('description').nullable();
    table.uuid('category_id').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.decimal('cost', 10, 2).nullable();
    table.string('image_url').nullable();
    table.jsonb('images').defaultTo('[]');
    table.jsonb('modifiers').defaultTo('[]');
    table.jsonb('allergens').defaultTo('[]');
    table.jsonb('nutrition').nullable();
    table.boolean('is_available').defaultTo(true);
    table.boolean('is_marked').defaultTo(false);
    table.string('marking_code').nullable();
    table.integer('sort_order').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.foreign('category_id').references('id').inTable('categories').onDelete('CASCADE');
    table.index(['sku', 'is_available']);
    table.index(['category_id', 'sort_order']);
    table.index(['is_available', 'is_marked']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('products');
};
