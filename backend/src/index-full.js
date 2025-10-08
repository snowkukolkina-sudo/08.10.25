const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { connectDatabase } = require('./config/database');

// Import services
const ordersService = require('./services/orders');

class DandyFullStackServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.server = null;
  }

  async initialize() {
    try {
      // Connect to database (SQLite)
      await connectDatabase();

      // Initialize services
      await ordersService.initialize();

      // Setup middleware
      this.setupMiddleware();

      // Serve static files FIRST
      this.setupStaticFiles();

      // Setup API routes
      this.setupAPIRoutes();

      // Setup error handling
      this.setupErrorHandling();

      logger.info('🚀 DANDY Full Stack Server initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize server:', error);
      throw error;
    }
  }

  setupMiddleware() {
    // Security middleware with relaxed CSP for development
    this.app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    }));
    
    this.app.use(compression());

    // CORS - разрешаем все для разработки
    this.app.use(cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting (более мягкий для разработки)
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      message: 'Too many requests from this IP'
    });
    this.app.use('/api/', limiter);

    // Body parsing
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  setupStaticFiles() {
    // Serve static files from root project directory
    const projectRoot = path.join(__dirname, '..', '..');
    
    logger.info(`📁 Serving static files from: ${projectRoot}`);
    
    // Serve all static files
    this.app.use(express.static(projectRoot));
    this.app.use('/assets', express.static(path.join(projectRoot, 'assets')));
    this.app.use('/modules', express.static(path.join(projectRoot, 'modules')));
    this.app.use('/js', express.static(path.join(projectRoot, 'js')));
    this.app.use('/nav-menu', express.static(path.join(projectRoot, 'nav-menu')));
    this.app.use('/social-icons', express.static(path.join(projectRoot, 'social-icons')));
  }

  setupAPIRoutes() {
    // ========== Health Check ==========
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: 'SQLite',
        version: '1.0.0',
        services: {
          database: 'connected',
          api: 'running'
        }
      });
    });

    // ========== Auth API ==========
    this.app.post('/api/auth/login', async (req, res) => {
      try {
        const { email, password, site } = req.body;
        
        logger.info('Login attempt:', { email, site });

        // Демо-проверка (замени на реальную проверку в БД)
        if ((email === '111' || email === 'admin') && password === '111' && site === '111') {
          const token = 'demo-token-' + Date.now();
          res.json({
            success: true,
            data: {
              user: {
                id: '1',
                email: email,
                role: 'admin',
                name: 'Администратор'
              },
              token
            }
          });
        } else {
          res.status(401).json({
            success: false,
            error: 'Неверные учетные данные'
          });
        }
      } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });

    // ========== Products/Menu API ==========
    this.app.get('/api/products', async (req, res) => {
      try {
        // Читаем menu_data.json
        const fs = require('fs');
        const menuDataPath = path.join(__dirname, '..', '..', 'menu_data.json');
        
        if (fs.existsSync(menuDataPath)) {
          const menuData = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));
          res.json({
            success: true,
            data: menuData.items || []
          });
        } else {
          res.json({
            success: true,
            data: []
          });
        }
      } catch (error) {
        logger.error('Get products error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });

    this.app.get('/api/categories', async (req, res) => {
      try {
        const fs = require('fs');
        const menuDataPath = path.join(__dirname, '..', '..', 'menu_data.json');
        
        if (fs.existsSync(menuDataPath)) {
          const menuData = JSON.parse(fs.readFileSync(menuDataPath, 'utf8'));
          res.json({
            success: true,
            data: menuData.categories || []
          });
        } else {
          res.json({
            success: true,
            data: []
          });
        }
      } catch (error) {
        logger.error('Get categories error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });

    // ========== Orders API ==========
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
        res.json({
          success: true,
          data: orders
        });
      } catch (error) {
        logger.error('Get orders error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });

    this.app.get('/api/orders/:id', async (req, res) => {
      try {
        const order = await ordersService.getOrderById(req.params.id);
        if (order) {
          res.json({
            success: true,
            data: order
          });
        } else {
          res.status(404).json({ success: false, error: 'Order not found' });
        }
      } catch (error) {
        logger.error('Get order error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
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
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });

    this.app.get('/api/orders/stats', async (req, res) => {
      try {
        const stats = await ordersService.getOrderStats();
        res.json({
          success: true,
          data: stats
        });
      } catch (error) {
        logger.error('Get order stats error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });

    // ========== Payments API (эмуляция) ==========
    this.app.post('/api/payments', async (req, res) => {
      try {
        const { orderId, amount, method, terminalId } = req.body;
        
        logger.info('Payment request:', { orderId, amount, method, terminalId });

        // Эмуляция обработки платежа
        const payment = {
          id: 'pay_' + Date.now(),
          orderId,
          amount,
          method,
          terminalId,
          status: 'success',
          transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString()
        };

        res.json({
          success: true,
          data: payment
        });
      } catch (error) {
        logger.error('Payment error:', error);
        res.status(500).json({ success: false, error: 'Payment processing failed' });
      }
    });

    // ========== Fiscal API (эмуляция) ==========
    this.app.post('/api/fiscal/receipt', async (req, res) => {
      try {
        const { orderId, items, total, paymentMethod } = req.body;
        
        logger.info('Fiscal receipt request:', { orderId, total, paymentMethod });

        // Эмуляция фискализации
        const receipt = {
          id: 'rcpt_' + Date.now(),
          orderId,
          fiscalNumber: 'FN' + Math.random().toString().substr(2, 10),
          fiscalSign: 'FS' + Math.random().toString().substr(2, 10),
          ofdStatus: 'sent',
          timestamp: new Date().toISOString(),
          qrCode: 'https://example.com/check/' + orderId
        };

        res.json({
          success: true,
          data: receipt
        });
      } catch (error) {
        logger.error('Fiscal error:', error);
        res.status(500).json({ success: false, error: 'Fiscal processing failed' });
      }
    });

    // ========== Dashboard Stats API ==========
    this.app.get('/api/dashboard/stats', async (req, res) => {
      try {
        const stats = {
          todayRevenue: 125340,
          todayOrders: 47,
          averageCheck: 2667,
          activeOrders: 8,
          completedOrders: 39,
          products: 142,
          lowStockItems: 5
        };

        res.json({
          success: true,
          data: stats
        });
      } catch (error) {
        logger.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });

    // ========== Inventory API ==========
    this.app.get('/api/inventory', async (req, res) => {
      try {
        const inventory = [
          { id: 1, name: 'Мука высшего сорта', quantity: 50, unit: 'кг', minStock: 20, status: 'normal' },
          { id: 2, name: 'Сыр Моцарелла', quantity: 8, unit: 'кг', minStock: 10, status: 'low' },
          { id: 3, name: 'Томаты', quantity: 15, unit: 'кг', minStock: 5, status: 'normal' }
        ];

        res.json({
          success: true,
          data: inventory
        });
      } catch (error) {
        logger.error('Inventory error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });

    // ========== Settings API ==========
    this.app.get('/api/settings', async (req, res) => {
      try {
        const settings = {
          storeName: 'DANDY Pizza',
          storeAddress: 'Москва, ул. Примерная, 123',
          storePhone: '+7 (925) 934-77-28',
          taxRate: 20,
          currency: 'RUB',
          ofdEnabled: true,
          fiscalEnabled: true
        };

        res.json({
          success: true,
          data: settings
        });
      } catch (error) {
        logger.error('Settings error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });

    this.app.put('/api/settings', async (req, res) => {
      try {
        logger.info('Settings update:', req.body);
        
        res.json({
          success: true,
          data: req.body
        });
      } catch (error) {
        logger.error('Settings update error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });

    // Root API route
    this.app.get('/api', (req, res) => {
      res.json({
        message: 'DANDY POS API Server',
        version: '1.0.0',
        database: 'SQLite',
        endpoints: {
          auth: ['/api/auth/login'],
          products: ['/api/products', '/api/categories'],
          orders: ['/api/orders', '/api/orders/:id', '/api/orders/:id/status'],
          payments: ['/api/payments'],
          fiscal: ['/api/fiscal/receipt'],
          dashboard: ['/api/dashboard/stats'],
          inventory: ['/api/inventory'],
          settings: ['/api/settings']
        }
      });
    });
  }

  setupErrorHandling() {
    // 404 handler for API routes
    this.app.use('/api/*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `API endpoint ${req.method} ${req.originalUrl} not found`
      });
    });

    // HTML pages routing - должно быть ПОСЛЕ API routes
    this.app.get('*', (req, res) => {
      const projectRoot = path.join(__dirname, '..', '..');
      
      // Определяем какой HTML файл отдать
      if (req.path === '/' || req.path === '/index.html') {
        res.sendFile(path.join(projectRoot, 'index.html'));
      } else if (req.path.endsWith('.html')) {
        res.sendFile(path.join(projectRoot, req.path));
      } else {
        res.sendFile(path.join(projectRoot, 'index.html'));
      }
    });

    // Error handler
    this.app.use(errorHandler);
  }

  async start() {
    try {
      await this.initialize();
      
      this.server = this.app.listen(this.port, '0.0.0.0', () => {
        console.log('\n' + '='.repeat(60));
        console.log('🎉 DANDY POS Full Stack Server запущен!');
        console.log('='.repeat(60));
        console.log(`📊 База данных: SQLite`);
        console.log(`🌐 Сервер: http://localhost:${this.port}`);
        console.log(`🏠 Главный сайт: http://localhost:${this.port}/`);
        console.log(`⚙️  Админка: http://localhost:${this.port}/admin.html`);
        console.log(`💰 POS касса: http://localhost:${this.port}/pos.html`);
        console.log(`📡 API: http://localhost:${this.port}/api`);
        console.log(`❤️  Health: http://localhost:${this.port}/api/health`);
        console.log('='.repeat(60));
        console.log('✅ Все готово! Можешь тестировать систему\n');
        
        logger.info('🎉 Server running');
        logger.info(`🌐 Main site: http://localhost:${this.port}/`);
        logger.info(`⚙️ Admin: http://localhost:${this.port}/admin.html`);
        logger.info(`💰 POS: http://localhost:${this.port}/pos.html`);
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
const server = new DandyFullStackServer();
server.start().catch(error => {
  logger.error('💥 Server startup failed:', error);
  process.exit(1);
});

module.exports = DandyFullStackServer;
