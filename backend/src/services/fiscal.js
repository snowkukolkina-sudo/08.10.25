const express = require('express');
const crypto = require('crypto');
const { body, validationResult, param, query } = require('express-validator');
const { getDatabase } = require('../config/database');
const { publishMessage } = require('../config/rabbitmq');
const { authenticateToken, authorize, requireRole } = require('../middleware/auth');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Generate fiscal receipt number
const generateReceiptNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `REC-${timestamp}-${random}`;
};

// Generate QR code for fiscal receipt
const generateQRCode = (receiptData) => {
  const qrData = {
    t: receiptData.created_at,
    s: receiptData.total_amount,
    fn: receiptData.fn_serial,
    i: receiptData.fd_number,
    fp: receiptData.fp_number,
    n: receiptData.type === 'sale' ? 1 : 2
  };
  
  return `t=${qrData.t}&s=${qrData.s}&fn=${qrData.fn}&i=${qrData.i}&fp=${qrData.fp}&n=${qrData.n}`;
};

// Simulate fiscal data generation (in real implementation, this would integrate with actual FN)
const generateFiscalData = (order, receiptType = 'sale') => {
  const fiscalData = {
    receipt_number: generateReceiptNumber(),
    fn_serial: '9999078900001234', // Mock FN serial
    fd_number: Math.floor(Math.random() * 1000000).toString(),
    fp_number: Math.floor(Math.random() * 1000000000).toString(),
    type: receiptType,
    items: order.items.map(item => ({
      name: item.product_name,
      quantity: item.quantity,
      price: item.unit_price,
      total: item.total_price,
      tax_rate: 10, // 10% НДС
      tax_amount: item.total_price * 0.1
    })),
    subtotal: order.subtotal,
    tax_amount: order.tax_amount,
    total_amount: order.total_amount,
    payment_method: order.payment_method || 'card',
    created_at: new Date().toISOString()
  };

  return fiscalData;
};

// Get all fiscal receipts
router.get('/', [
  requireRole(['admin', 'manager', 'senior_cashier']),
  query('status').optional().isIn(['pending', 'sent', 'confirmed', 'failed']),
  query('type').optional().isIn(['sale', 'return', 'refund']),
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

    let query = db('fiscal_receipts')
      .leftJoin('orders', 'fiscal_receipts.order_id', 'orders.id')
      .select(
        'fiscal_receipts.*',
        'orders.order_number',
        'orders.total_amount as order_total',
        'orders.customer_name',
        'orders.customer_phone'
      );

    if (status) {
      query = query.where('fiscal_receipts.status', status);
    }

    if (type) {
      query = query.where('fiscal_receipts.type', type);
    }

    if (date_from) {
      query = query.where('fiscal_receipts.created_at', '>=', date_from);
    }

    if (date_to) {
      query = query.where('fiscal_receipts.created_at', '<=', date_to);
    }

    const receipts = await query
      .orderBy('fiscal_receipts.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('fiscal_receipts')
      .count('* as count')
      .first();

    res.json({
      success: true,
      data: receipts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching fiscal receipts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fiscal receipts'
    });
  }
});

// Get fiscal receipt by ID
router.get('/:id', [
  requireRole(['admin', 'manager', 'senior_cashier']),
  param('id').isUUID().withMessage('Invalid fiscal receipt ID')
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

    const receipt = await db('fiscal_receipts')
      .leftJoin('orders', 'fiscal_receipts.order_id', 'orders.id')
      .select(
        'fiscal_receipts.*',
        'orders.order_number',
        'orders.total_amount as order_total',
        'orders.customer_name',
        'orders.customer_phone',
        'orders.customer_email'
      )
      .where('fiscal_receipts.id', id)
      .first();

    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: 'Fiscal receipt not found'
      });
    }

    res.json({
      success: true,
      data: receipt
    });
  } catch (error) {
    logger.error('Error fetching fiscal receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fiscal receipt'
    });
  }
});

// Create fiscal receipt for order
router.post('/create', [
  body('order_id').isUUID().withMessage('Invalid order ID'),
  body('type').isIn(['sale', 'return', 'refund']).withMessage('Invalid receipt type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { order_id, type } = req.body;
    const db = getDatabase();

    // Check if order exists
    const order = await db('orders')
      .leftJoin('order_items', 'orders.id', 'order_items.order_id')
      .select(
        'orders.*',
        db.raw('JSON_AGG(JSON_BUILD_OBJECT(\'product_name\', order_items.product_name, \'quantity\', order_items.quantity, \'unit_price\', order_items.unit_price, \'total_price\', order_items.total_price)) as items')
      )
      .where('orders.id', order_id)
      .groupBy('orders.id')
      .first();

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if fiscal receipt already exists for this order
    const existingReceipt = await db('fiscal_receipts')
      .where({ order_id, type })
      .first();

    if (existingReceipt) {
      return res.status(400).json({
        success: false,
        error: 'Fiscal receipt already exists for this order'
      });
    }

    // Generate fiscal data
    const fiscalData = generateFiscalData(order, type);

    // Create fiscal receipt record
    const receiptData = {
      id: uuidv4(),
      order_id,
      receipt_number: fiscalData.receipt_number,
      type,
      status: 'pending',
      fn_serial: fiscalData.fn_serial,
      fd_number: fiscalData.fd_number,
      fp_number: fiscalData.fp_number,
      qr_code: generateQRCode(fiscalData),
      receipt_data: fiscalData,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [receipt] = await db('fiscal_receipts')
      .insert(receiptData)
      .returning('*');

    logger.info('Fiscal receipt created', { 
      receiptId: receipt.id, 
      orderId: order_id,
      type: type,
      userId: req.user.id 
    });

    res.status(201).json({
      success: true,
      data: receipt
    });
  } catch (error) {
    logger.error('Error creating fiscal receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create fiscal receipt'
    });
  }
});

// Send fiscal receipt to OFD
router.post('/:id/send', [
  requireRole(['admin', 'manager', 'senior_cashier']),
  param('id').isUUID().withMessage('Invalid fiscal receipt ID')
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

    const receipt = await db('fiscal_receipts').where({ id }).first();
    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: 'Fiscal receipt not found'
      });
    }

    if (receipt.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Fiscal receipt is not in pending status'
      });
    }

    // Simulate sending to OFD (in real implementation, this would make actual API call)
    try {
      // Mock OFD response
      const ofdResponse = {
        status: 'success',
        message_id: `OFD-${Date.now()}`,
        sent_at: new Date().toISOString(),
        response_code: 200
      };

      // Update receipt status
      const [updatedReceipt] = await db('fiscal_receipts')
        .where({ id })
        .update({
          status: 'sent',
          ofd_response: ofdResponse,
          sent_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      // Publish fiscal receipt sent event
      await publishMessage('dandy.fiscal', 'receipt.sent', {
        id: updatedReceipt.id,
        order_id: updatedReceipt.order_id,
        receipt_number: updatedReceipt.receipt_number,
        fn_serial: updatedReceipt.fn_serial,
        fd_number: updatedReceipt.fd_number,
        sent_at: updatedReceipt.sent_at
      });

      logger.info('Fiscal receipt sent to OFD', { 
        receiptId: updatedReceipt.id, 
        receiptNumber: updatedReceipt.receipt_number,
        userId: req.user.id 
      });

      res.json({
        success: true,
        data: updatedReceipt
      });
    } catch (ofdError) {
      // Handle OFD error
      const [failedReceipt] = await db('fiscal_receipts')
        .where({ id })
        .update({
          status: 'failed',
          error_message: ofdError.message,
          updated_at: new Date()
        })
        .returning('*');

      // Publish fiscal receipt failed event
      await publishMessage('dandy.fiscal', 'receipt.failed', {
        id: failedReceipt.id,
        order_id: failedReceipt.order_id,
        receipt_number: failedReceipt.receipt_number,
        error_message: failedReceipt.error_message,
        failed_at: failedReceipt.updated_at
      });

      logger.error('Failed to send fiscal receipt to OFD', { 
        receiptId: failedReceipt.id, 
        error: ofdError.message,
        userId: req.user.id 
      });

      res.status(500).json({
        success: false,
        error: 'Failed to send fiscal receipt to OFD',
        data: failedReceipt
      });
    }
  } catch (error) {
    logger.error('Error sending fiscal receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send fiscal receipt'
    });
  }
});

// Retry sending fiscal receipt
router.post('/:id/retry', [
  requireRole(['admin', 'manager', 'senior_cashier']),
  param('id').isUUID().withMessage('Invalid fiscal receipt ID')
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

    const receipt = await db('fiscal_receipts').where({ id }).first();
    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: 'Fiscal receipt not found'
      });
    }

    if (receipt.status !== 'failed') {
      return res.status(400).json({
        success: false,
        error: 'Can only retry failed fiscal receipts'
      });
    }

    // Reset status to pending and retry
    const [retryReceipt] = await db('fiscal_receipts')
      .where({ id })
      .update({
        status: 'pending',
        error_message: null,
        updated_at: new Date()
      })
      .returning('*');

    logger.info('Fiscal receipt retry initiated', { 
      receiptId: retryReceipt.id, 
      userId: req.user.id 
    });

    res.json({
      success: true,
      data: retryReceipt,
      message: 'Fiscal receipt retry initiated'
    });
  } catch (error) {
    logger.error('Error retrying fiscal receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retry fiscal receipt'
    });
  }
});

// Confirm fiscal receipt (simulate OFD confirmation)
router.post('/:id/confirm', [
  requireRole(['admin']),
  param('id').isUUID().withMessage('Invalid fiscal receipt ID')
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

    const receipt = await db('fiscal_receipts').where({ id }).first();
    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: 'Fiscal receipt not found'
      });
    }

    if (receipt.status !== 'sent') {
      return res.status(400).json({
        success: false,
        error: 'Can only confirm sent fiscal receipts'
      });
    }

    // Simulate OFD confirmation
    const confirmationResponse = {
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      confirmation_code: `CONF-${Date.now()}`
    };

    const [confirmedReceipt] = await db('fiscal_receipts')
      .where({ id })
      .update({
        status: 'confirmed',
        ofd_response: {
          ...receipt.ofd_response,
          ...confirmationResponse
        },
        confirmed_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    // Publish fiscal receipt confirmed event
    await publishMessage('dandy.fiscal', 'receipt.confirmed', {
      id: confirmedReceipt.id,
      order_id: confirmedReceipt.order_id,
      receipt_number: confirmedReceipt.receipt_number,
      fn_serial: confirmedReceipt.fn_serial,
      fd_number: confirmedReceipt.fd_number,
      confirmed_at: confirmedReceipt.confirmed_at
    });

    logger.info('Fiscal receipt confirmed', { 
      receiptId: confirmedReceipt.id, 
      receiptNumber: confirmedReceipt.receipt_number,
      userId: req.user.id 
    });

    res.json({
      success: true,
      data: confirmedReceipt
    });
  } catch (error) {
    logger.error('Error confirming fiscal receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm fiscal receipt'
    });
  }
});

// Get fiscal statistics
router.get('/stats/summary', [
  requireRole(['admin', 'manager', 'senior_cashier']),
  query('date_from').optional().isISO8601(),
  query('date_to').optional().isISO8601()
], async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    const db = getDatabase();

    let query = db('fiscal_receipts');

    if (date_from) {
      query = query.where('created_at', '>=', date_from);
    }

    if (date_to) {
      query = query.where('created_at', '<=', date_to);
    }

    const stats = await query
      .select(
        db.raw('COUNT(*) as total_receipts'),
        db.raw('COUNT(CASE WHEN status = \'confirmed\' THEN 1 END) as confirmed_receipts'),
        db.raw('COUNT(CASE WHEN status = \'sent\' THEN 1 END) as sent_receipts'),
        db.raw('COUNT(CASE WHEN status = \'failed\' THEN 1 END) as failed_receipts'),
        db.raw('COUNT(CASE WHEN status = \'pending\' THEN 1 END) as pending_receipts'),
        db.raw('COUNT(CASE WHEN type = \'sale\' THEN 1 END) as sale_receipts'),
        db.raw('COUNT(CASE WHEN type = \'return\' THEN 1 END) as return_receipts'),
        db.raw('COUNT(CASE WHEN type = \'refund\' THEN 1 END) as refund_receipts')
      )
      .first();

    res.json({
      success: true,
      data: {
        total_receipts: parseInt(stats.total_receipts),
        by_status: {
          confirmed: parseInt(stats.confirmed_receipts),
          sent: parseInt(stats.sent_receipts),
          failed: parseInt(stats.failed_receipts),
          pending: parseInt(stats.pending_receipts)
        },
        by_type: {
          sale: parseInt(stats.sale_receipts),
          return: parseInt(stats.return_receipts),
          refund: parseInt(stats.refund_receipts)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching fiscal statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fiscal statistics'
    });
  }
});

module.exports = { router };
