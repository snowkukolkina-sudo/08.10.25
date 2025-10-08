const { connectRabbitMQ, consumeMessages } = require('../config/rabbitmq');
const MessageHandlers = require('./messageHandlers');
const logger = require('../utils/logger');

class MessageWorker {
  constructor() {
    this.handlers = new MessageHandlers();
    this.isRunning = false;
  }

  async start() {
    try {
      await connectRabbitMQ();
      this.isRunning = true;

      // Start consuming messages from all queues
      await this.startOrderConsumers();
      await this.startPaymentConsumers();
      await this.startFiscalConsumers();
      await this.startNotificationConsumers();

      logger.info('Message workers started successfully');
    } catch (error) {
      logger.error('Failed to start message workers:', error);
      throw error;
    }
  }

  async startOrderConsumers() {
    // Order created consumer
    await consumeMessages('orders.created', async (message) => {
      await this.handlers.handleOrderCreated(message);
    });

    // Order updated consumer
    await consumeMessages('orders.updated', async (message) => {
      await this.handlers.handleOrderUpdated(message);
    });

    // Order cancelled consumer
    await consumeMessages('orders.cancelled', async (message) => {
      await this.handlers.handleOrderCancelled(message);
    });

    logger.info('Order message consumers started');
  }

  async startPaymentConsumers() {
    // Payment completed consumer
    await consumeMessages('payments.completed', async (message) => {
      await this.handlers.handlePaymentCompleted(message);
    });

    // Payment failed consumer
    await consumeMessages('payments.failed', async (message) => {
      await this.handlers.handlePaymentFailed(message);
    });

    // Payment refunded consumer
    await consumeMessages('payments.refunded', async (message) => {
      await this.handlers.handlePaymentRefunded(message);
    });

    logger.info('Payment message consumers started');
  }

  async startFiscalConsumers() {
    // Fiscal receipt sent consumer
    await consumeMessages('fiscal.receipt.sent', async (message) => {
      await this.handlers.handleFiscalReceiptSent(message);
    });

    // Fiscal receipt confirmed consumer
    await consumeMessages('fiscal.receipt.confirmed', async (message) => {
      await this.handlers.handleFiscalReceiptConfirmed(message);
    });

    // Fiscal receipt failed consumer
    await consumeMessages('fiscal.receipt.failed', async (message) => {
      await this.handlers.handleFiscalReceiptFailed(message);
    });

    logger.info('Fiscal message consumers started');
  }

  async startNotificationConsumers() {
    // Notification consumer (fanout exchange)
    await consumeMessages('notifications', async (message) => {
      await this.handlers.handleNotification(message);
    });

    logger.info('Notification consumers started');
  }

  async stop() {
    this.isRunning = false;
    logger.info('Message workers stopped');
  }
}

// Start workers if this file is run directly
if (require.main === module) {
  const worker = new MessageWorker();
  
  worker.start().catch(error => {
    logger.error('Worker startup failed:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => worker.stop());
  process.on('SIGINT', () => worker.stop());
}

module.exports = MessageWorker;
