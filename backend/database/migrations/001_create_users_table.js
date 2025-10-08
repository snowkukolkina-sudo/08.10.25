exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.string('id', 36).primary();
    table.string('username').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('role').notNullable();
    table.string('status').defaultTo('active');
    table.string('phone').nullable();
    table.string('avatar_url').nullable();
    table.text('permissions').defaultTo('{}');
    table.timestamp('last_login').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['username', 'email']);
    table.index(['role', 'status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
