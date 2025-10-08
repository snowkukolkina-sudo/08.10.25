const knex = require('knex');
const logger = require('../utils/logger');

class OrdersService {
  constructor() {
    this.db = null;
  }

  async initialize() {
    try {
      const { getDatabase } = require('../config/database');
      this.db = getDatabase();
      logger.info('Orders service initialized');
    } catch (error) {
      logger.error('Failed to initialize orders service:', error);
      throw error;
    }
  }

  // Создание нового заказа
  async createOrder(orderData) {
    try {
      const orderId = this.generateOrderId();
      
      const order = {
        id: orderId,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_email: orderData.customerEmail,
        delivery_type: orderData.deliveryType,
        payment_method: orderData.paymentMethod,
        address: orderData.address || null,
        apartment: orderData.apartment || null,
        address_comment: orderData.addressComment || null,
        order_comment: orderData.orderComment || null,
        subtotal: orderData.subtotal,
        delivery_cost: orderData.deliveryCost,
        total: orderData.total,
        status: 'accepted',
        created_at: new Date(),
        updated_at: new Date()
      };

      // Сохраняем заказ в базе данных
      await this.db('orders').insert(order);

      // Сохраняем товары заказа
      for (const item of orderData.items) {
        await this.db('order_items').insert({
          order_id: orderId,
          product_name: item.name,
          product_price: item.price,
          quantity: item.qty || item.quantity || 1,
          total: item.price * (item.qty || item.quantity || 1),
          extras: JSON.stringify(item.extras || [])
        });
      }

      logger.info(`Order created: ${orderId}`);
      return { success: true, orderId, order };
    } catch (error) {
      logger.error('Error creating order:', error);
      return { success: false, error: error.message };
    }
  }

  // Получение всех заказов
  async getAllOrders() {
    try {
      const orders = await this.db('orders')
        .select('*')
        .orderBy('created_at', 'desc');
      
      // Получаем товары для каждого заказа
      for (let order of orders) {
        const items = await this.db('order_items')
          .select('*')
          .where('order_id', order.id);
        
        order.items = items;
      }
      
      return orders;
    } catch (error) {
      logger.error('Error getting orders:', error);
      throw error;
    }
  }

  // Получение заказа по ID
  async getOrderById(orderId) {
    try {
      const order = await this.db('orders')
        .where('id', orderId)
        .first();
      
      if (!order) {
        return null;
      }

      // Получаем товары заказа
      const items = await this.db('order_items')
        .where('order_id', orderId);

      order.items = items;
      return order;
    } catch (error) {
      logger.error('Error getting order:', error);
      throw error;
    }
  }

  // Обновление статуса заказа
  async updateOrderStatus(orderId, status) {
    try {
      const validStatuses = ['accepted', 'preparing', 'ready', 'with_courier', 'in_transit', 'delivered', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      await this.db('orders')
        .where('id', orderId)
        .update({
          status: status,
          updated_at: new Date()
        });

      logger.info(`Order ${orderId} status updated to: ${status}`);
      return { success: true };
    } catch (error) {
      logger.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  }

  // Получение заказов по статусу
  async getOrdersByStatus(status) {
    try {
      const orders = await this.db('orders')
        .where('status', status)
        .orderBy('created_at', 'desc');
      
      return orders;
    } catch (error) {
      logger.error('Error getting orders by status:', error);
      throw error;
    }
  }

  // Генерация ID заказа
  generateOrderId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `D${timestamp}${random}`;
  }

  // Получение статистики заказов
  async getOrderStats() {
    try {
      const stats = await this.db('orders')
        .select('status')
        .count('* as count')
        .groupBy('status');

      const totalOrders = await this.db('orders').count('* as count').first();
      const totalRevenue = await this.db('orders').sum('total as sum').first();

      return {
        byStatus: stats,
        totalOrders: totalOrders.count,
        totalRevenue: totalRevenue.sum || 0
      };
    } catch (error) {
      logger.error('Error getting order stats:', error);
      throw error;
    }
  }
}

module.exports = new OrdersService();