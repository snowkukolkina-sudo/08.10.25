exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('audit_logs').del();
  await knex('fiscal_receipts').del();
  await knex('payments').del();
  await knex('order_items').del();
  await knex('orders').del();
  await knex('products').del();
  await knex('categories').del();
  await knex('delivery_zones').del();
  await knex('users').del();

  // Insert seed entries
  const users = await knex('users').insert([
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      username: 'admin',
      email: 'admin@dandy.ru',
      password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4V7J8Q8Q8Q', // password: admin123
      first_name: 'Администратор',
      last_name: 'Системы',
      role: 'admin',
      status: 'active',
      phone: '+7 (495) 123-45-67',
      permissions: JSON.stringify({
        'pos.sale': true,
        'pos.refund': true,
        'pos.print_receipt': true,
        'pos.view_orders': true,
        'pos.update_order_status': true,
        'pos.cancel_order': true,
        'pos.view_reports': true,
        'pos.manage_discounts': true,
        'pos.manage_users': true,
        'pos.manage_settings': true,
        'pos.view_operation_log': true,
        'pos.manage_terminals': true,
        'pos.manage_delivery_zones': true,
        'pos.manage_menu': true,
        'pos.view_analytics': true
      }),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      username: 'cashier1',
      email: 'cashier1@dandy.ru',
      password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4V7J8Q8Q8Q', // password: cashier123
      first_name: 'Анна',
      last_name: 'Кассирова',
      role: 'cashier',
      status: 'active',
      phone: '+7 (495) 123-45-68',
      permissions: JSON.stringify({
        'pos.sale': true,
        'pos.refund': true,
        'pos.print_receipt': true,
        'pos.view_orders': true,
        'pos.update_order_status': true
      }),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      username: 'manager1',
      email: 'manager1@dandy.ru',
      password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4V7J8Q8Q8Q', // password: manager123
      first_name: 'Петр',
      last_name: 'Менеджеров',
      role: 'manager',
      status: 'active',
      phone: '+7 (495) 123-45-69',
      permissions: JSON.stringify({
        'pos.sale': true,
        'pos.refund': true,
        'pos.print_receipt': true,
        'pos.view_orders': true,
        'pos.update_order_status': true,
        'pos.cancel_order': true,
        'pos.view_reports': true,
        'pos.manage_discounts': true,
        'pos.manage_menu': true,
        'pos.view_analytics': true
      }),
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).returning('*');

  const categories = await knex('categories').insert([
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      name: 'Пицца',
      slug: 'pizza',
      description: 'Классическая итальянская пицца на тонком тесте',
      image_url: '/images/categories/pizza.jpg',
      sort_order: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440002',
      name: 'Роллы',
      slug: 'rolls',
      description: 'Японские роллы с различными начинками',
      image_url: '/images/categories/rolls.jpg',
      sort_order: 2,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440003',
      name: 'Напитки',
      slug: 'drinks',
      description: 'Охлаждающие и горячие напитки',
      image_url: '/images/categories/drinks.jpg',
      sort_order: 3,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440004',
      name: 'Десерты',
      slug: 'desserts',
      description: 'Сладкие десерты и выпечка',
      image_url: '/images/categories/desserts.jpg',
      sort_order: 4,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).returning('*');

  const products = await knex('products').insert([
    {
      id: '770e8400-e29b-41d4-a716-446655440001',
      name: 'Пепперони',
      sku: 'PIZZA-001',
      description: 'Острая пицца с пепперони и моцареллой',
      category_id: categories[0].id,
      price: 399.00,
      cost: 180.00,
      image_url: '/images/products/pepperoni.jpg',
      images: JSON.stringify(['/images/products/pepperoni.jpg']),
      modifiers: JSON.stringify([
        { name: 'Дополнительный сыр', price: 50 },
        { name: 'Острый соус', price: 30 }
      ]),
      allergens: JSON.stringify(['молоко', 'глютен']),
      nutrition: JSON.stringify({
        calories: 320,
        protein: 15,
        fat: 12,
        carbs: 35
      }),
      is_available: true,
      is_marked: false,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440002',
      name: 'Маргарита',
      sku: 'PIZZA-002',
      description: 'Классическая пицца с томатами и моцареллой',
      category_id: categories[0].id,
      price: 349.00,
      cost: 160.00,
      image_url: '/images/products/margherita.jpg',
      images: JSON.stringify(['/images/products/margherita.jpg']),
      modifiers: JSON.stringify([
        { name: 'Дополнительный сыр', price: 50 },
        { name: 'Базилик', price: 20 }
      ]),
      allergens: JSON.stringify(['молоко', 'глютен']),
      nutrition: JSON.stringify({
        calories: 280,
        protein: 12,
        fat: 8,
        carbs: 38
      }),
      is_available: true,
      is_marked: false,
      sort_order: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440003',
      name: 'Филадельфия',
      sku: 'ROLL-001',
      description: 'Классический ролл с лососем и сливочным сыром',
      category_id: categories[1].id,
      price: 459.00,
      cost: 220.00,
      image_url: '/images/products/philadelphia.jpg',
      images: JSON.stringify(['/images/products/philadelphia.jpg']),
      modifiers: JSON.stringify([
        { name: 'Соус унаги', price: 40 },
        { name: 'Кунжут', price: 15 }
      ]),
      allergens: JSON.stringify(['рыба', 'молоко']),
      nutrition: JSON.stringify({
        calories: 180,
        protein: 8,
        fat: 6,
        carbs: 22
      }),
      is_available: true,
      is_marked: false,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440004',
      name: 'Калифорния',
      sku: 'ROLL-002',
      description: 'Ролл с крабом, авокадо и огурцом',
      category_id: categories[1].id,
      price: 389.00,
      cost: 190.00,
      image_url: '/images/products/california.jpg',
      images: JSON.stringify(['/images/products/california.jpg']),
      modifiers: JSON.stringify([
        { name: 'Икра тобико', price: 60 },
        { name: 'Кунжут', price: 15 }
      ]),
      allergens: JSON.stringify(['рыба', 'авокадо']),
      nutrition: JSON.stringify({
        calories: 160,
        protein: 6,
        fat: 4,
        carbs: 24
      }),
      is_available: true,
      is_marked: false,
      sort_order: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440005',
      name: 'Кока-Кола',
      sku: 'DRINK-001',
      description: 'Газированный напиток 0.5л',
      category_id: categories[2].id,
      price: 89.00,
      cost: 35.00,
      image_url: '/images/products/coca-cola.jpg',
      images: JSON.stringify(['/images/products/coca-cola.jpg']),
      modifiers: JSON.stringify([]),
      allergens: JSON.stringify([]),
      nutrition: JSON.stringify({
        calories: 200,
        protein: 0,
        fat: 0,
        carbs: 50
      }),
      is_available: true,
      is_marked: false,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440006',
      name: 'Тирамису',
      sku: 'DESSERT-001',
      description: 'Классический итальянский десерт',
      category_id: categories[3].id,
      price: 199.00,
      cost: 90.00,
      image_url: '/images/products/tiramisu.jpg',
      images: JSON.stringify(['/images/products/tiramisu.jpg']),
      modifiers: JSON.stringify([
        { name: 'Дополнительный кофе', price: 30 }
      ]),
      allergens: JSON.stringify(['молоко', 'яйца', 'глютен']),
      nutrition: JSON.stringify({
        calories: 250,
        protein: 6,
        fat: 12,
        carbs: 28
      }),
      is_available: true,
      is_marked: false,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).returning('*');

  const deliveryZones = await knex('delivery_zones').insert([
    {
      id: '880e8400-e29b-41d4-a716-446655440001',
      name: 'Центр города',
      description: 'Доставка в центр города',
      polygon_coordinates: JSON.stringify([
        [55.7558, 37.6176],
        [55.7558, 37.6276],
        [55.7658, 37.6276],
        [55.7658, 37.6176],
        [55.7558, 37.6176]
      ]),
      delivery_fee: 150.00,
      min_order_amount: 500.00,
      estimated_delivery_time: 30,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440002',
      name: 'Спальные районы',
      description: 'Доставка в спальные районы',
      polygon_coordinates: JSON.stringify([
        [55.7558, 37.6176],
        [55.7558, 37.6076],
        [55.7458, 37.6076],
        [55.7458, 37.6176],
        [55.7558, 37.6176]
      ]),
      delivery_fee: 200.00,
      min_order_amount: 800.00,
      estimated_delivery_time: 45,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).returning('*');

  console.log('✅ Seed data inserted successfully');
  console.log(`👥 Users: ${users.length}`);
  console.log(`📂 Categories: ${categories.length}`);
  console.log(`🍕 Products: ${products.length}`);
  console.log(`🚚 Delivery zones: ${deliveryZones.length}`);
};
