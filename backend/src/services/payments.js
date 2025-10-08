const express = require('express');
const { body, validationResult, param, query } = require('express-validator');
const { getDatabase } = require('../config/database');
const { publishMessage } = require('../config/rabbitmq');
const { authenticateToken, authorize, requireRole } = require('../middleware/auth');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all payments
router.get('/', [
  requireRole(['admin', 'manager', 'senior_cashier']),
  query('status').optional().isIn(['pending', 'completed', 'failed', 'refunded']),
  query('type').optional().isIn(['cash', 'card', 'online', 'mixed']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('date_from').optional().isISO8601(),
  query('date_to').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { 
      status, 
      type, 
      page = 1, 
      limit = 50, 
      date_from, 
      date_to 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const db = getDatabase();

    let query = db('payments')
      .leftJoin('orders', 'payments.order_id', 'orders.id')
      .leftJoin('users', 'payments.processed_by', 'users.id')
      .select(
        'payments.*',
        'orders.order_number',
        'orders.total_amount as order_total',
        'users.first_name as processed_by_first_name',
        'users.last_name as processed_by_last_name'
      );

    if (status) {
      query = query.where('payments.status', status);
    }

    if (type) {
      query = query.where('payments.type', type);
    }

    if (date_from) {
      query = query.where('payments.created_at', '>=', date_from);
    }

    if (date_to) {
      query = query.where('payments.created_at', '<=', date_to);
    }

    const payments = await query
      .orderBy('payments.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('payments')
      .count('* as count')
      .first();

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments'
    });
  }
});

// Get payment by ID
router.get('/:id', [
  requireRole(['admin', 'manager', 'senior_cashier']),
  param('id').isUUID().withMessage('Invalid payment ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const db = getDatabase();

    const payment = await db('payments')
      .leftJoin('orders', 'payments.order_id', 'orders.id')
      .leftJoin('users', 'payments.processed_by', 'users.id')
      .select(
        'payments.*',
        'orders.order_number',
        'orders.total_amount as order_total',
        'orders.customer_name',
        'orders.customer_phone',
        'users.first_name as processed_by_first_name',
        'users.last_name as processed_by_last_name'
      )
      .where('payments.id', id)
      .first();

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment'
    });
  }
});

// Create new payment
router.post('/', [
  body('order_id').isUUID().withMessage('Invalid order ID'),
  body('type').isIn(['cash', 'card', 'online', 'mixed']).withMessage('Invalid payment type'),
  body('amount').isDecimal({ decimal_digits: '0,2' }).withMessage('Invalid amount'),
  body('transaction_id').optional().isString(),
  body('terminal_id').optional().isString(),
  body('payment_data').optional().isObject(),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const db = getDatabase();
    const { order_id, type, amount, transaction_id, terminal_id, payment_data, notes } = req.body;

    // Check if order exists
    const order = await db('orders').where({ id: order_id }).first();
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if payment amount is valid
    if (amount > order.total_amount) {
      return res.status(400).json({
        success: false,
        error: 'Payment amount cannot exceed order total'
      });
    }

    const paymentData = {
      id: uuidv4(),
      order_id,
      type,
      status: 'pending',
      amount,
      transaction_id,
      terminal_id,
      payment_data,
      notes,
      processed_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [payment] = await db('payments')
      .insert(paymentData)
      .returning('*');

    logger.info('Payment created', { 
      paymentId: payment.id, 
      orderId: order_id,
      amount: amount,
      userId: req.user.id 
    });

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment'
    });
  }
});

// Process payment
router.patch('/:id/process', [
  param('id').isUUID().withMessage('Invalid payment ID'),
  body('status').isIn(['completed', 'failed']).withMessage('Invalid status'),
  body('transaction_id').optional().isString(),
  body('payment_data').optional().isObject(),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, transaction_id, payment_data, notes } = req.body;
    const db = getDatabase();

    const [payment] = await db('payments')
      .where({ id })
      .update({
        status,
        transaction_id: transaction_id || null,
        payment_data: payment_data || null,
        notes: notes || null,
        processed_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Update order payment status
    const order = await db('orders').where({ id: payment.order_id }).first();
    if (order) {
      const totalPaid = await db('payments')
        .where({ order_id: payment.order_id, status: 'completed' })
        .sum('amount as total')
        .first();

      const newPaymentStatus = totalPaid.total >= order.total_amount ? 'paid' : 'pending';
      
      await db('orders')
        .where({ id: payment.order_id })
        .update({
          payment_status: newPaymentStatus,
          updated_at: new Date()
        });
    }

    // Publish payment event
    const eventType = status === 'completed' ? 'payment.completed' : 'payment.failed';
    await publishMessage('dandy.payments', eventType, {
      id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      type: payment.type,
      status: payment.status,
      processed_at: payment.processed_at
    });

    logger.info('Payment processed', { 
      paymentId: payment.id, 
      status: payment.status,
      userId: req.user.id 
    });

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment'
    });
  }
});

// Refund payment
router.patch('/:id/refund', [
  requireRole(['admin', 'manager', 'senior_cashier']),
  param('id').isUUID().withMessage('Invalid payment ID'),
  body('amount').optional().isDecimal({ decimal_digits: '0,2' }),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { amount, reason } = req.body;
    const db = getDatabase();

    const payment = await db('payments').where({ id }).first();
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Can only refund completed payments'
      });
    }

    const refundAmount = amount || payment.amount;

    if (refundAmount > payment.amount) {
      return res.status(400).json({
        success: false,
        error: 'Refund amount cannot exceed payment amount'
      });
    }

    // Create refund payment record
    const refundData = {
      id: uuidv4(),
      order_id: payment.order_id,
      type: payment.type,
      status: 'refunded',
      amount: refundAmount,
      transaction_id: `REF-${payment.transaction_id}`,
      terminal_id: payment.terminal_id,
      payment_data: {
        ...payment.payment_data,
        refund_reason: reason || 'Payment refund',
        original_payment_id: payment.id
      },
      notes: reason || 'Payment refund',
      processed_by: req.user.id,
      processed_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };

    const [refund] = await db('payments')
      .insert(refundData)
      .returning('*');

    // Update original payment status if full refund
    if (refundAmount === payment.amount) {
      await db('payments')
        .where({ id })
        .update({
          status: 'refunded',
          updated_at: new Date()
        });
    }

    // Update order payment status
    const order = await db('orders').where({ id: payment.order_id }).first();
    if (order) {
      const totalPaid = await db('payments')
        .where({ order_id: payment.order_id, status: 'completed' })
        .sum('amount as total')
        .first();

      const totalRefunded = await db('payments')
        .where({ order_id: payment.order_id, status: 'refunded' })
        .sum('amount as total')
        .first();

      const netAmount = (totalPaid.total || 0) - (totalRefunded.total || 0);
      const newPaymentStatus = netAmount >= order.total_amount ? 'paid' : 'pending';
      
      await db('orders')
        .where({ id: payment.order_id })
        .update({
          payment_status: newPaymentStatus,
          updated_at: new Date()
        });
    }

    // Publish refund event
    await publishMessage('dandy.payments', 'payment.refunded', {
      id: refund.id,
      original_payment_id: payment.id,
      order_id: payment.order_id,
      amount: refundAmount,
      reason: reason || 'Payment refund',
      processed_at: refund.processed_at
    });

    logger.info('Payment refunded', { 
      refundId: refund.id,
      originalPaymentId: payment.id,
      amount: refundAmount,
      userId: req.user.id 
    });

    res.json({
      success: true,
      data: refund
    });
  } catch (error) {
    logger.error('Error refunding payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refund payment'
    });
  }
});

// Get payment statistics
router.get('/stats/summary', [
  requireRole(['admin', 'manager', 'senior_cashier']),
  query('date_from').optional().isISO8601(),
  query('date_to').optional().isISO8601()
], async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const db = getDatabase();

    let query = db('payments')
      .where({ status: 'completed' });

    if (date_from) {
      query = query.where('created_at', '>=', date_from);
    }

    if (date_to) {
      query = query.where('created_at', '<=', date_to);
    }

    const stats = await query
      .select(
        db.raw('COUNT(*) as total_payments'),
        db.raw('SUM(amount) as total_amount'),
        db.raw('AVG(amount) as average_amount'),
        db.raw('COUNT(CASE WHEN type = \'cash\' THEN 1 END) as cash_payments'),
        db.raw('COUNT(CASE WHEN type = \'card\' THEN 1 END) as card_payments'),
        db.raw('COUNT(CASE WHEN type = \'online\' THEN 1 END) as online_payments'),
        db.raw('SUM(CASE WHEN type = \'cash\' THEN amount ELSE 0 END) as cash_amount'),
        db.raw('SUM(CASE WHEN type = \'card\' THEN amount ELSE 0 END) as card_amount'),
        db.raw('SUM(CASE WHEN type = \'online\' THEN amount ELSE 0 END) as online_amount')
      )
      .first();

    res.json({
      success: true,
      data: {
        total_payments: parseInt(stats.total_payments),
        total_amount: parseFloat(stats.total_amount || 0),
        average_amount: parseFloat(stats.average_amount || 0),
        by_type: {
          cash: {
            count: parseInt(stats.cash_payments),
            amount: parseFloat(stats.cash_amount || 0)
          },
          card: {
            count: parseInt(stats.card_payments),
            amount: parseFloat(stats.card_amount || 0)
          },
          online: {
            count: parseInt(stats.online_payments),
            amount: parseFloat(stats.online_amount || 0)
          }
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching payment statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment statistics'
    });
  }
});

module.exports = { router };
