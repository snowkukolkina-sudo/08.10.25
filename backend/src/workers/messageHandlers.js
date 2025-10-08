const { getDatabase } = require('../config/database');
const { publishMessage } = require('../config/rabbitmq');
const logger = require('../utils/logger');

class MessageHandlers {
  constructor() {
    this.db = getDatabase();
  }

  // Order event handlers
  async handleOrderCreated(message) {
    try {
      logger.info('Processing order created event', { orderId: message.id });
      
      // Here you can add business logic for order creation
      // For example: send notifications, update inventory, etc.
      
      // Example: Send notification to kitchen
      await publishMessage('dandy.notifications', '', {
        type: 'order_created',
        order_id: message.id,
        order_number: message.order_number,
        total_amount: message.total_amount,
        created_at: message.created_at
      });

      logger.info('Order created event processed successfully', { orderId: message.id });
    } catch (error) {
      logger.error('Error processing order created event:', error);
      throw error;
    }
  }

  async handleOrderUpdated(message) {
    try {
      logger.info('Processing order updated event', { orderId: message.id });
      
      // Update order status in related systems
      // Send notifications to relevant parties
      
      await publishMessage('dandy.notifications', '', {
        type: 'order_updated',
        order_id: message.id,
        order_number: message.order_number,
        status: message.status,
        updated_at: message.updated_at
      });

      logger.info('Order updated event processed successfully', { orderId: message.id });
    } catch (error) {
      logger.error('Error processing order updated event:', error);
      throw error;
    }
  }

  async handleOrderCancelled(message) {
    try {
      logger.info('Processing order cancelled event', { orderId: message.id });
      
      // Handle order cancellation
      // Refund payments if needed
      // Update inventory
      
      await publishMessage('dandy.notifications', '', {
        type: 'order_cancelled',
        order_id: message.id,
        order_number: message.order_number,
        reason: message.reason,
        cancelled_at: message.cancelled_at
      });

      logger.info('Order cancelled event processed successfully', { orderId: message.id });
    } catch (error) {
      logger.error('Error processing order cancelled event:', error);
      throw error;
    }
  }

  // Payment event handlers
  async handlePaymentCompleted(message) {
    try {
      logger.info('Processing payment completed event', { paymentId: message.id });
      
      // Update order payment status
      // Create fiscal receipt
      // Send confirmation notifications
      
      // Create fiscal receipt for completed payment
      await publishMessage('dandy.fiscal', 'receipt.create', {
        order_id: message.order_id,
        type: 'sale',
        amount: message.amount,
        payment_type: message.type
      });

      await publishMessage('dandy.notifications', '', {
        type: 'payment_completed',
        payment_id: message.id,
        order_id: message.order_id,
        amount: message.amount,
        processed_at: message.processed_at
      });

      logger.info('Payment completed event processed successfully', { paymentId: message.id });
    } catch (error) {
      logger.error('Error processing payment completed event:', error);
      throw error;
    }
  }

  async handlePaymentFailed(message) {
    try {
      logger.info('Processing payment failed event', { paymentId: message.id });
      
      // Handle payment failure
      // Update order status
      // Send failure notifications
      
      await publishMessage('dandy.notifications', '', {
        type: 'payment_failed',
        payment_id: message.id,
        order_id: message.order_id,
        amount: message.amount,
        failed_at: message.processed_at
      });

      logger.info('Payment failed event processed successfully', { paymentId: message.id });
    } catch (error) {
      logger.error('Error processing payment failed event:', error);
      throw error;
    }
  }

  async handlePaymentRefunded(message) {
    try {
      logger.info('Processing payment refunded event', { refundId: message.id });
      
      // Handle refund
      // Create refund fiscal receipt
      // Update order status
      
      await publishMessage('dandy.fiscal', 'receipt.create', {
        order_id: message.order_id,
        type: 'refund',
        amount: message.amount,
        original_payment_id: message.original_payment_id
      });

      await publishMessage('dandy.notifications', '', {
        type: 'payment_refunded',
        refund_id: message.id,
        order_id: message.order_id,
        amount: message.amount,
        reason: message.reason,
        processed_at: message.processed_at
      });

      logger.info('Payment refunded event processed successfully', { refundId: message.id });
    } catch (error) {
      logger.error('Error processing payment refunded event:', error);
      throw error;
    }
  }

  // Fiscal event handlers
  async handleFiscalReceiptSent(message) {
    try {
      logger.info('Processing fiscal receipt sent event', { receiptId: message.id });
      
      // Handle fiscal receipt sent to OFD
      // Update receipt status
      // Send notifications
      
      await publishMessage('dandy.notifications', '', {
        type: 'fiscal_receipt_sent',
        receipt_id: message.id,
        order_id: message.order_id,
        receipt_number: message.receipt_number,
        sent_at: message.sent_at
      });

      logger.info('Fiscal receipt sent event processed successfully', { receiptId: message.id });
    } catch (error) {
      logger.error('Error processing fiscal receipt sent event:', error);
      throw error;
    }
  }

  async handleFiscalReceiptConfirmed(message) {
    try {
      logger.info('Processing fiscal receipt confirmed event', { receiptId: message.id });
      
      // Handle fiscal receipt confirmation from OFD
      // Update receipt status
      // Send confirmation notifications
      
      await publishMessage('dandy.notifications', '', {
        type: 'fiscal_receipt_confirmed',
        receipt_id: message.id,
        order_id: message.order_id,
        receipt_number: message.receipt_number,
        confirmed_at: message.confirmed_at
      });

      logger.info('Fiscal receipt confirmed event processed successfully', { receiptId: message.id });
    } catch (error) {
      logger.error('Error processing fiscal receipt confirmed event:', error);
      throw error;
    }
  }

  async handleFiscalReceiptFailed(message) {
    try {
      logger.info('Processing fiscal receipt failed event', { receiptId: message.id });
      
      // Handle fiscal receipt failure
      // Update receipt status
      // Send failure notifications
      // Schedule retry if needed
      
      await publishMessage('dandy.notifications', '', {
        type: 'fiscal_receipt_failed',
        receipt_id: message.id,
        order_id: message.order_id,
        receipt_number: message.receipt_number,
        error_message: message.error_message,
        failed_at: message.failed_at
      });

      logger.info('Fiscal receipt failed event processed successfully', { receiptId: message.id });
    } catch (error) {
      logger.error('Error processing fiscal receipt failed event:', error);
      throw error;
    }
  }

  // Notification handlers
  async handleNotification(message) {
    try {
      logger.info('Processing notification', { type: message.type });
      
      // Handle different types of notifications
      switch (message.type) {
        case 'order_created':
          await this.handleOrderNotification(message);
          break;
        case 'order_updated':
          await this.handleOrderNotification(message);
          break;
        case 'order_cancelled':
          await this.handleOrderNotification(message);
          break;
        case 'payment_completed':
          await this.handlePaymentNotification(message);
          break;
        case 'payment_failed':
          await this.handlePaymentNotification(message);
          break;
        case 'payment_refunded':
          await this.handlePaymentNotification(message);
          break;
        case 'fiscal_receipt_sent':
          await this.handleFiscalNotification(message);
          break;
        case 'fiscal_receipt_confirmed':
          await this.handleFiscalNotification(message);
          break;
        case 'fiscal_receipt_failed':
          await this.handleFiscalNotification(message);
          break;
        default:
          logger.warn('Unknown notification type', { type: message.type });
      }

      logger.info('Notification processed successfully', { type: message.type });
    } catch (error) {
      logger.error('Error processing notification:', error);
      throw error;
    }
  }

  async handleOrderNotification(message) {
    // Send order notifications via email, SMS, push notifications, etc.
    logger.info('Sending order notification', { 
      type: message.type, 
      orderId: message.order_id 
    });
  }

  async handlePaymentNotification(message) {
    // Send payment notifications
    logger.info('Sending payment notification', { 
      type: message.type, 
      paymentId: message.payment_id || message.refund_id 
    });
  }

  async handleFiscalNotification(message) {
    // Send fiscal notifications
    logger.info('Sending fiscal notification', { 
      type: message.type, 
      receiptId: message.receipt_id 
    });
  }
}

module.exports = MessageHandlers;
