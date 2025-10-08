const { getDatabase } = require('../config/database');
const { cache } = require('../config/redis');
const { publishMessage } = require('../config/rabbitmq');
const logger = require('../utils/logger');

const resolvers = {
  DateTime: {
    serialize: (date) => date.toISOString(),
    parseValue: (value) => new Date(value),
    parseLiteral: (ast) => new Date(ast.value)
  },

  JSON: {
    serialize: (value) => value,
    parseValue: (value) => value,
    parseLiteral: (ast) => ast.value
  },

  Query: {
    // Users
    me: async (parent, args, { user }) => {
      if (!user) return null;
      return user;
    },

    users: async (parent, { page = 1, limit = 50 }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();
      const offset = (page - 1) * limit;

      const users = await db('users')
        .select('*')
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      const total = await db('users').count('* as count').first();

      return {
        data: users,
        pagination: {
          page,
          limit,
          total: parseInt(total.count),
          pages: Math.ceil(total.count / limit)
        }
      };
    },

    user: async (parent, { id }, { user }) => {
      if (!user || (user.role !== 'admin' && user.id !== id)) {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();
      return await db('users').where({ id }).first();
    },

    // Categories
    categories: async () => {
      const cacheKey = 'categories:all';
      let categories = await cache.get(cacheKey);
      
      if (!categories) {
        const db = getDatabase();
        categories = await db('categories')
          .where({ is_active: true })
          .orderBy('sort_order', 'asc')
          .orderBy('name', 'asc');
        
        await cache.set(cacheKey, categories, 3600);
      }

      return categories;
    },

    category: async (parent, { id }) => {
      const cacheKey = `category:${id}`;
      let category = await cache.get(cacheKey);
      
      if (!category) {
        const db = getDatabase();
        category = await db('categories').where({ id }).first();
        
        if (category) {
          await cache.set(cacheKey, category, 3600);
        }
      }

      return category;
    },

    categoriesConnection: async (parent, { page = 1, limit = 50 }) => {
      const db = getDatabase();
      const offset = (page - 1) * limit;

      const categories = await db('categories')
        .orderBy('sort_order', 'asc')
        .orderBy('name', 'asc')
        .limit(limit)
        .offset(offset);

      const total = await db('categories').count('* as count').first();

      return {
        data: categories,
        pagination: {
          page,
          limit,
          total: parseInt(total.count),
          pages: Math.ceil(total.count / limit)
        }
      };
    },

    // Products
    products: async (parent, { page = 1, limit = 50, filters = {} }) => {
      const db = getDatabase();
      const offset = (page - 1) * limit;

      let query = db('products')
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .select(
          'products.*',
          'categories.name as category_name',
          'categories.slug as category_slug'
        );

      if (filters.categoryId) {
        query = query.where('products.category_id', filters.categoryId);
      }

      if (filters.isAvailable !== undefined) {
        query = query.where('products.is_available', filters.isAvailable);
      }

      if (filters.search) {
        query = query.where(function() {
          this.where('products.name', 'ilike', `%${filters.search}%`)
            .orWhere('products.sku', 'ilike', `%${filters.search}%`);
        });
      }

      const products = await query
        .orderBy('products.sort_order', 'asc')
        .orderBy('products.name', 'asc')
        .limit(limit)
        .offset(offset);

      const total = await db('products').count('* as count').first();

      return {
        data: products,
        pagination: {
          page,
          limit,
          total: parseInt(total.count),
          pages: Math.ceil(total.count / limit)
        }
      };
    },

    product: async (parent, { id }) => {
      const cacheKey = `product:${id}`;
      let product = await cache.get(cacheKey);
      
      if (!product) {
        const db = getDatabase();
        product = await db('products')
          .leftJoin('categories', 'products.category_id', 'categories.id')
          .select(
            'products.*',
            'categories.name as category_name',
            'categories.slug as category_slug'
          )
          .where('products.id', id)
          .first();
        
        if (product) {
          await cache.set(cacheKey, product, 1800);
        }
      }

      return product;
    },

    // Orders
    orders: async (parent, { page = 1, limit = 50, filters = {} }, { user }) => {
      if (!user) {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();
      const offset = (page - 1) * limit;

      let query = db('orders')
        .leftJoin('users as cashiers', 'orders.cashier_id', 'cashiers.id')
        .leftJoin('users as couriers', 'orders.courier_id', 'couriers.id')
        .select(
          'orders.*',
          'cashiers.first_name as cashier_first_name',
          'cashiers.last_name as cashier_last_name',
          'couriers.first_name as courier_first_name',
          'couriers.last_name as courier_last_name'
        );

      if (filters.status) {
        query = query.where('orders.status', filters.status);
      }

      if (filters.type) {
        query = query.where('orders.type', filters.type);
      }

      if (filters.dateFrom) {
        query = query.where('orders.created_at', '>=', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.where('orders.created_at', '<=', filters.dateTo);
      }

      const orders = await query
        .orderBy('orders.created_at', 'desc')
        .limit(limit)
        .offset(offset);

      const total = await db('orders').count('* as count').first();

      return {
        data: orders,
        pagination: {
          page,
          limit,
          total: parseInt(total.count),
          pages: Math.ceil(total.count / limit)
        }
      };
    },

    order: async (parent, { id }, { user }) => {
      if (!user) {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();
      const order = await db('orders')
        .leftJoin('users as cashiers', 'orders.cashier_id', 'cashiers.id')
        .leftJoin('users as couriers', 'orders.courier_id', 'couriers.id')
        .select(
          'orders.*',
          'cashiers.first_name as cashier_first_name',
          'cashiers.last_name as cashier_last_name',
          'couriers.first_name as courier_first_name',
          'couriers.last_name as courier_last_name'
        )
        .where('orders.id', id)
        .first();

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    },

    // Payments
    payments: async (parent, { page = 1, limit = 50 }, { user }) => {
      if (!user || !['admin', 'manager', 'senior_cashier'].includes(user.role)) {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();
      const offset = (page - 1) * limit;

      const payments = await db('payments')
        .leftJoin('orders', 'payments.order_id', 'orders.id')
        .leftJoin('users', 'payments.processed_by', 'users.id')
        .select(
          'payments.*',
          'orders.order_number',
          'users.first_name as processed_by_first_name',
          'users.last_name as processed_by_last_name'
        )
        .orderBy('payments.created_at', 'desc')
        .limit(limit)
        .offset(offset);

      const total = await db('payments').count('* as count').first();

      return {
        data: payments,
        pagination: {
          page,
          limit,
          total: parseInt(total.count),
          pages: Math.ceil(total.count / limit)
        }
      };
    },

    payment: async (parent, { id }, { user }) => {
      if (!user || !['admin', 'manager', 'senior_cashier'].includes(user.role)) {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();
      return await db('payments')
        .leftJoin('orders', 'payments.order_id', 'orders.id')
        .leftJoin('users', 'payments.processed_by', 'users.id')
        .select(
          'payments.*',
          'orders.order_number',
          'users.first_name as processed_by_first_name',
          'users.last_name as processed_by_last_name'
        )
        .where('payments.id', id)
        .first();
    },

    // Fiscal Receipts
    fiscalReceipts: async (parent, { page = 1, limit = 50 }, { user }) => {
      if (!user || !['admin', 'manager', 'senior_cashier'].includes(user.role)) {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();
      const offset = (page - 1) * limit;

      const receipts = await db('fiscal_receipts')
        .leftJoin('orders', 'fiscal_receipts.order_id', 'orders.id')
        .select(
          'fiscal_receipts.*',
          'orders.order_number'
        )
        .orderBy('fiscal_receipts.created_at', 'desc')
        .limit(limit)
        .offset(offset);

      const total = await db('fiscal_receipts').count('* as count').first();

      return {
        data: receipts,
        pagination: {
          page,
          limit,
          total: parseInt(total.count),
          pages: Math.ceil(total.count / limit)
        }
      };
    },

    fiscalReceipt: async (parent, { id }, { user }) => {
      if (!user || !['admin', 'manager', 'senior_cashier'].includes(user.role)) {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();
      return await db('fiscal_receipts')
        .leftJoin('orders', 'fiscal_receipts.order_id', 'orders.id')
        .select(
          'fiscal_receipts.*',
          'orders.order_number'
        )
        .where('fiscal_receipts.id', id)
        .first();
    },

    // Delivery Zones
    deliveryZones: async () => {
      const db = getDatabase();
      return await db('delivery_zones')
        .where({ is_active: true })
        .orderBy('name', 'asc');
    },

    deliveryZone: async (parent, { id }) => {
      const db = getDatabase();
      return await db('delivery_zones').where({ id }).first();
    }
  },

  Mutation: {
    // Categories
    createCategory: async (parent, { input }, { user }) => {
      if (!user || !['admin', 'manager'].includes(user.role)) {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();
      const categoryData = {
        ...input,
        created_at: new Date(),
        updated_at: new Date()
      };

      const [category] = await db('categories')
        .insert(categoryData)
        .returning('*');

      // Clear cache
      await cache.del('categories:all');

      logger.info('Category created via GraphQL', { categoryId: category.id, userId: user.id });

      return category;
    },

    updateCategory: async (parent, { id, input }, { user }) => {
      if (!user || !['admin', 'manager'].includes(user.role)) {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();
      const updateData = {
        ...input,
        updated_at: new Date()
      };

      const [category] = await db('categories')
        .where({ id })
        .update(updateData)
        .returning('*');

      if (!category) {
        throw new Error('Category not found');
      }

      // Clear cache
      await cache.del(`category:${id}`);
      await cache.del('categories:all');

      logger.info('Category updated via GraphQL', { categoryId: category.id, userId: user.id });

      return category;
    },

    deleteCategory: async (parent, { id }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();
      const deleted = await db('categories').where({ id }).del();

      if (!deleted) {
        throw new Error('Category not found');
      }

      // Clear cache
      await cache.del(`category:${id}`);
      await cache.del('categories:all');

      logger.info('Category deleted via GraphQL', { categoryId: id, userId: user.id });

      return true;
    },

    // Products
    createProduct: async (parent, { input }, { user }) => {
      if (!user || !['admin', 'manager'].includes(user.role)) {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();
      const productData = {
        ...input,
        created_at: new Date(),
        updated_at: new Date()
      };

      const [product] = await db('products')
        .insert(productData)
        .returning('*');

      // Clear cache
      await cache.del('categories:all');

      logger.info('Product created via GraphQL', { productId: product.id, userId: user.id });

      return product;
    },

    updateProduct: async (parent, { id, input }, { user }) => {
      if (!user || !['admin', 'manager'].includes(user.role)) {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();
      const updateData = {
        ...input,
        updated_at: new Date()
      };

      const [product] = await db('products')
        .where({ id })
        .update(updateData)
        .returning('*');

      if (!product) {
        throw new Error('Product not found');
      }

      // Clear cache
      await cache.del(`product:${id}`);
      await cache.del('categories:all');

      logger.info('Product updated via GraphQL', { productId: product.id, userId: user.id });

      return product;
    },

    deleteProduct: async (parent, { id }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();
      const deleted = await db('products').where({ id }).del();

      if (!deleted) {
        throw new Error('Product not found');
      }

      // Clear cache
      await cache.del(`product:${id}`);
      await cache.del('categories:all');

      logger.info('Product deleted via GraphQL', { productId: id, userId: user.id });

      return true;
    },

    // Orders
    createOrder: async (parent, { input }, { user }) => {
      if (!user) {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();
      const trx = await db.transaction();

      try {
        const { items, ...orderData } = input;
        
        // Calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
          const product = await trx('products')
            .where({ id: item.product_id })
            .first();

          if (!product) {
            throw new Error(`Product ${item.product_id} not found`);
          }

          if (!product.is_available) {
            throw new Error(`Product ${product.name} is not available`);
          }

          const itemTotal = product.price * item.quantity;
          subtotal += itemTotal;

          orderItems.push({
            product_id: product.id,
            product_name: product.name,
            product_sku: product.sku,
            quantity: item.quantity,
            unit_price: product.price,
            total_price: itemTotal,
            modifiers: item.modifiers || [],
            notes: item.notes
          });
        }

        const taxAmount = subtotal * 0.1; // 10% tax
        const deliveryFee = orderData.type === 'DELIVERY' ? 150 : 0;
        const totalAmount = subtotal + taxAmount + deliveryFee;

        // Generate order number
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const orderNumber = `ORD-${timestamp}-${random}`;

        // Create order
        const order = {
          id: require('uuid').v4(),
          order_number: orderNumber,
          ...orderData,
          subtotal,
          tax_amount: taxAmount,
          delivery_fee: deliveryFee,
          total_amount: totalAmount,
          cashier_id: user.id,
          status: 'PENDING',
          payment_status: 'PENDING',
          created_at: new Date(),
          updated_at: new Date()
        };

        const [createdOrder] = await trx('orders')
          .insert(order)
          .returning('*');

        // Create order items
        const itemsWithOrderId = orderItems.map(item => ({
          id: require('uuid').v4(),
          order_id: createdOrder.id,
          ...item,
          created_at: new Date()
        }));

        await trx('order_items').insert(itemsWithOrderId);

        await trx.commit();

        // Publish order created event
        await publishMessage('dandy.orders', 'order.created', {
          id: createdOrder.id,
          order_number: createdOrder.order_number,
          type: createdOrder.type,
          total_amount: createdOrder.total_amount,
          customer_phone: createdOrder.customer_phone,
          created_at: createdOrder.created_at
        });

        logger.info('Order created via GraphQL', { 
          orderId: createdOrder.id, 
          orderNumber: createdOrder.order_number,
          userId: user.id 
        });

        return createdOrder;
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    },

    updateOrderStatus: async (parent, { id, input }, { user }) => {
      if (!user) {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();
      const { status, notes } = input;

      const [order] = await db('orders')
        .where({ id })
        .update({
          status,
          notes: notes || null,
          updated_at: new Date()
        })
        .returning('*');

      if (!order) {
        throw new Error('Order not found');
      }

      // Publish order updated event
      await publishMessage('dandy.orders', 'order.updated', {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        updated_at: order.updated_at
      });

      logger.info('Order status updated via GraphQL', { 
        orderId: order.id, 
        status: order.status,
        userId: user.id 
      });

      return order;
    },

    cancelOrder: async (parent, { id, reason }, { user }) => {
      if (!user) {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();

      const [order] = await db('orders')
        .where({ id })
        .update({
          status: 'CANCELLED',
          notes: reason || 'Order cancelled',
          updated_at: new Date()
        })
        .returning('*');

      if (!order) {
        throw new Error('Order not found');
      }

      // Publish order cancelled event
      await publishMessage('dandy.orders', 'order.cancelled', {
        id: order.id,
        order_number: order.order_number,
        reason: reason || 'Order cancelled',
        cancelled_at: order.updated_at
      });

      logger.info('Order cancelled via GraphQL', { 
        orderId: order.id, 
        reason: reason,
        userId: user.id 
      });

      return order;
    },

    assignCourier: async (parent, { orderId, courierId }, { user }) => {
      if (!user || !['admin', 'manager'].includes(user.role)) {
        throw new Error('Unauthorized');
      }

      const db = getDatabase();

      // Check if courier exists and has courier role
      const courier = await db('users')
        .where({ id: courierId, role: 'courier' })
        .first();

      if (!courier) {
        throw new Error('Courier not found');
      }

      const [order] = await db('orders')
        .where({ id: orderId })
        .update({
          courier_id: courierId,
          updated_at: new Date()
        })
        .returning('*');

      if (!order) {
        throw new Error('Order not found');
      }

      logger.info('Courier assigned to order via GraphQL', { 
        orderId: order.id, 
        courierId: courierId,
        userId: user.id 
      });

      return order;
    }
  },

  // Field resolvers
  Category: {
    parent: async (parent) => {
      if (!parent.parent_id) return null;
      
      const db = getDatabase();
      return await db('categories').where({ id: parent.parent_id }).first();
    },

    children: async (parent) => {
      const db = getDatabase();
      return await db('categories')
        .where({ parent_id: parent.id, is_active: true })
        .orderBy('sort_order', 'asc');
    },

    products: async (parent) => {
      const db = getDatabase();
      return await db('products')
        .where({ category_id: parent.id, is_available: true })
        .orderBy('sort_order', 'asc');
    }
  },

  Product: {
    category: async (parent) => {
      const db = getDatabase();
      return await db('categories').where({ id: parent.category_id }).first();
    }
  },

  Order: {
    cashier: async (parent) => {
      if (!parent.cashier_id) return null;
      
      const db = getDatabase();
      return await db('users').where({ id: parent.cashier_id }).first();
    },

    courier: async (parent) => {
      if (!parent.courier_id) return null;
      
      const db = getDatabase();
      return await db('users').where({ id: parent.courier_id }).first();
    },

    items: async (parent) => {
      const db = getDatabase();
      return await db('order_items')
        .leftJoin('products', 'order_items.product_id', 'products.id')
        .select(
          'order_items.*',
          'products.name as product_name',
          'products.image_url as product_image'
        )
        .where('order_items.order_id', parent.id);
    }
  },

  OrderItem: {
    product: async (parent) => {
      const db = getDatabase();
      return await db('products').where({ id: parent.product_id }).first();
    }
  },

  Payment: {
    order: async (parent) => {
      const db = getDatabase();
      return await db('orders').where({ id: parent.order_id }).first();
    },

    processedByUser: async (parent) => {
      if (!parent.processed_by) return null;
      
      const db = getDatabase();
      return await db('users').where({ id: parent.processed_by }).first();
    }
  },

  FiscalReceipt: {
    order: async (parent) => {
      const db = getDatabase();
      return await db('orders').where({ id: parent.order_id }).first();
    }
  }
};

module.exports = resolvers;
