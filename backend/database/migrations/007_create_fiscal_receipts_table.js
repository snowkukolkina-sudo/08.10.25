exports.up = function(knex) {
  return knex.schema.createTable('fiscal_receipts', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('order_id').notNullable();
    table.string('receipt_number').unique().notNullable();
    table.enum('type', ['sale', 'return', 'refund']).notNullable();
    table.enum('status', ['pending', 'sent', 'confirmed', 'failed']).defaultTo('pending');
    table.string('fn_serial').notNullable();
    table.string('fd_number').nullable();
    table.string('fp_number').nullable();
    table.string('qr_code').nullable();
    table.jsonb('receipt_data').notNullable();
    table.jsonb('ofd_response').nullable();
    table.text('error_message').nullable();
    table.timestamp('sent_at').nullable();
    table.timestamp('confirmed_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.foreign('order_id').references('id').inTable('orders').onDelete('CASCADE');
    table.index(['receipt_number']);
    table.index(['fn_serial', 'fd_number']);
    table.index(['status', 'type']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('fiscal_receipts');
};
