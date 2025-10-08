exports.up = function(knex) {
  return knex.schema.createTable('categories', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('slug').unique().notNullable();
    table.text('description').nullable();
    table.string('image_url').nullable();
    table.integer('sort_order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.uuid('parent_id').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.foreign('parent_id').references('id').inTable('categories').onDelete('SET NULL');
    table.index(['slug', 'is_active']);
    table.index(['parent_id', 'sort_order']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('categories');
};
