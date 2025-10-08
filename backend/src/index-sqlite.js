const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { connectDatabase } = require('./config/database');

// Import services
const catalogService = require('./services/catalog');
const ordersService = require('./services/orders');
const paymentsService = require('./services/payments');
const usersService = require('./services/users');
const fiscalService = require('./services/fiscal');

class DandyPOSServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.server = null;
  }

  async initialize() {
    try {
      // Connect to database only (SQLite)
      await connectDatabase();

      // Initialize services
      await ordersService.initialize();

      // Setup middleware
      this.setupMiddleware();

      // Setup routes
      this.setupRoutes();

      // Setup error handling
      this.setupErrorHandling();

      logger.info('🚀 DANDY POS Server initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize server:', error);
      throw error;
    }
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(compression());

    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:8080'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      message: 'Too many requests from this IP'
    });
    this.app.use('/api/', limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: 'SQLite',
        version: '1.0.0'
      });
    });

    // Orders routes
    this.app.post('/api/orders', async (req, res) => {
      try {
        logger.info('Order request received:', JSON.stringify(req.body, null, 2));
        const result = await ordersService.createOrder(req.body);
        if (result.success) {
          res.status(201).json(result);
        } else {
          res.status(400).json(result);
        }
      } catch (error) {
        logger.error('Order creation error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });

    this.app.get('/api/orders', async (req, res) => {
      try {
        const orders = await ordersService.getAllOrders();
        res.json(orders);
      } catch (error) {
        logger.error('Get orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.get('/api/orders/:id', async (req, res) => {
      try {
        const order = await ordersService.getOrderById(req.params.id);
        if (order) {
          res.json(order);
        } else {
          res.status(404).json({ error: 'Order not found' });
        }
      } catch (error) {
        logger.error('Get order error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.put('/api/orders/:id/status', async (req, res) => {
      try {
        const result = await ordersService.updateOrderStatus(req.params.id, req.body.status);
        if (result.success) {
          res.json(result);
        } else {
          res.status(400).json(result);
        }
      } catch (error) {
        logger.error('Update order status error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    this.app.get('/api/orders/stats', async (req, res) => {
      try {
        const stats = await ordersService.getOrderStats();
        res.json(stats);
      } catch (error) {
        logger.error('Get order stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        message: 'DANDY POS API Server',
        version: '1.0.0',
        database: 'SQLite',
        endpoints: [
          '/api/health',
          '/api/catalog',
          '/api/orders',
          '/api/payments',
          '/api/users',
          '/api/fiscal'
        ]
      });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`
      });
    });

    // Error handler
    this.app.use(errorHandler);
  }

  async start() {
    try {
      await this.initialize();
      
      this.server = this.app.listen(this.port, () => {
        logger.info(`🎉 Server running on port ${this.port}`);
        logger.info(`📊 Database: SQLite`);
        logger.info(`🌐 API: http://localhost:${this.port}/api`);
        logger.info(`📋 Health: http://localhost:${this.port}/api/health`);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());

    } catch (error) {
      logger.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  async shutdown() {
    logger.info('🛑 Shutting down server...');
    
    if (this.server) {
      this.server.close(() => {
        logger.info('✅ Server closed');
        process.exit(0);
      });
    }
  }
}

// Start server
const server = new DandyPOSServer();
server.start().catch(error => {
  logger.error('💥 Server startup failed:', error);
  process.exit(1);
});
