const amqp = require('amqplib');
const logger = require('../utils/logger');

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
  try {
    const url = process.env.RABBITMQ_URL || 'amqp://dandy_user:dandy_password@localhost:5672';
    connection = await amqp.connect(url);
    
    connection.on('error', (err) => {
      logger.error('RabbitMQ Connection Error:', err);
    });

    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed');
    });

    channel = await connection.createChannel();
    
    // Declare exchanges
    await channel.assertExchange('dandy.orders', 'topic', { durable: true });
    await channel.assertExchange('dandy.payments', 'topic', { durable: true });
    await channel.assertExchange('dandy.fiscal', 'topic', { durable: true });
    await channel.assertExchange('dandy.notifications', 'fanout', { durable: true });

    // Declare queues
    await channel.assertQueue('orders.created', { durable: true });
    await channel.assertQueue('orders.updated', { durable: true });
    await channel.assertQueue('orders.cancelled', { durable: true });
    
    await channel.assertQueue('payments.completed', { durable: true });
    await channel.assertQueue('payments.failed', { durable: true });
    await channel.assertQueue('payments.refunded', { durable: true });
    
    await channel.assertQueue('fiscal.receipt.sent', { durable: true });
    await channel.assertQueue('fiscal.receipt.confirmed', { durable: true });
    await channel.assertQueue('fiscal.receipt.failed', { durable: true });

    // Bind queues to exchanges
    await channel.bindQueue('orders.created', 'dandy.orders', 'order.created');
    await channel.bindQueue('orders.updated', 'dandy.orders', 'order.updated');
    await channel.bindQueue('orders.cancelled', 'dandy.orders', 'order.cancelled');
    
    await channel.bindQueue('payments.completed', 'dandy.payments', 'payment.completed');
    await channel.bindQueue('payments.failed', 'dandy.payments', 'payment.failed');
    await channel.bindQueue('payments.refunded', 'dandy.payments', 'payment.refunded');
    
    await channel.bindQueue('fiscal.receipt.sent', 'dandy.fiscal', 'receipt.sent');
    await channel.bindQueue('fiscal.receipt.confirmed', 'dandy.fiscal', 'receipt.confirmed');
    await channel.bindQueue('fiscal.receipt.failed', 'dandy.fiscal', 'receipt.failed');

    logger.info('✅ RabbitMQ connected successfully');
    return { connection, channel };
  } catch (error) {
    logger.error('❌ RabbitMQ connection failed:', error);
    throw error;
  }
};

const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ not initialized. Call connectRabbitMQ() first.');
  }
  return channel;
};

const publishMessage = async (exchange, routingKey, message, options = {}) => {
  try {
    const ch = getChannel();
    const messageBuffer = Buffer.from(JSON.stringify(message));
    
    const published = ch.publish(exchange, routingKey, messageBuffer, {
      persistent: true,
      timestamp: Date.now(),
      ...options
    });

    if (published) {
      logger.info(`Message published to ${exchange}:${routingKey}`, { messageId: message.id });
    } else {
      logger.warn(`Failed to publish message to ${exchange}:${routingKey}`);
    }

    return published;
  } catch (error) {
    logger.error('Failed to publish message:', error);
    throw error;
  }
};

const consumeMessages = async (queueName, handler, options = {}) => {
  try {
    const ch = getChannel();
    
    await ch.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const message = JSON.parse(msg.content.toString());
          await handler(message);
          ch.ack(msg);
        } catch (error) {
          logger.error(`Error processing message from ${queueName}:`, error);
          ch.nack(msg, false, false); // Reject and don't requeue
        }
      }
    }, {
      noAck: false,
      ...options
    });

    logger.info(`Started consuming messages from ${queueName}`);
  } catch (error) {
    logger.error(`Failed to consume messages from ${queueName}:`, error);
    throw error;
  }
};

const closeRabbitMQ = async () => {
  if (channel) {
    await channel.close();
  }
  if (connection) {
    await connection.close();
  }
  logger.info('RabbitMQ connection closed');
};

module.exports = {
  connectRabbitMQ,
  getChannel,
  publishMessage,
  consumeMessages,
  closeRabbitMQ
};
