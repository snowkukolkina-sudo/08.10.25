#!/usr/bin/env node

/**
 * Запуск воркеров для обработки сообщений RabbitMQ
 * Используется для отдельного процесса обработки сообщений
 */

require('dotenv').config();
const MessageWorker = require('./index');
const logger = require('../utils/logger');

async function startWorkers() {
  try {
    logger.info('Starting DANDY POS Message Workers...');
    
    const worker = new MessageWorker();
    await worker.start();
    
    logger.info('Message workers started successfully');
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down workers...');
      await worker.stop();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down workers...');
      await worker.stop();
      process.exit(0);
    });
    
    // Keep the process alive
    setInterval(() => {
      // Health check - workers are running
    }, 30000);
    
  } catch (error) {
    logger.error('Failed to start message workers:', error);
    process.exit(1);
  }
}

// Start workers if this file is run directly
if (require.main === module) {
  startWorkers();
}

module.exports = startWorkers;
