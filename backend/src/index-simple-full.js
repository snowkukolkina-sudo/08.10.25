const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const fs = require('fs');
require('dotenv').config();

const logger = require('./utils/logger');

// Простая БД в памяти для быстрого старта
const inMemoryDB = {
  orders: [],
  products: [],
  categories: [],
  users: [
    {
      id: '1',
      email: 'admin',
      password: '111',
      site: '111',
      role: 'admin',
      name: 'Администратор'
    }
  ],
  orderCounter: 1
};

class DandySimpleServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.server = null;
  }

  initialize() {
    try {
      // Setup middleware
      this.setupMiddleware();

      // Serve static files FIRST
      this.setupStaticFiles();

      // Setup API routes
      this.setupAPIRoutes();

      // Setup error handling
      this.setupErrorHandling();

      logger.info('🚀 DANDY Simple Server initialized successfully');
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

    // Body parsing
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Logging
    this.app.use((req, res, next) => {
      if (!req.path.includes('/api/')) {
        logger.info(`${req.method} ${req.path}`);
      }
      next();
    });
  }

  setupStaticFiles() {
    // Serve static files from root project directory
    const projectRoot = path.join(__dirname, '..', '..');
    
    logger.info(`📁 Serving static files from: ${projectRoot}`);
    
    // Serve all static files
    this.app.use(express.static(projectRoot, {
      extensions: ['html'],
      index: 'index.html'
    }));
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
        database: 'In-Memory',
        version: '1.0.0',
        services: {
          database: 'connected',
          api: 'running'
        }
      });
    });

    // ========== Auth API ==========
    this.app.post('/api/auth/login', (req, res) => {
      try {
        const { email, password, site } = req.body;
        
        logger.info('Login attempt:', { email, site });

        // Проверка учетных данных
        const user = inMemoryDB.users.find(u => 
          (u.email === email || u.email === '111' || email === '111') && 
          (u.password === password || password === '111') &&
          (u.site === site || site === '111')
        );

        if (user) {
          const token = 'demo-token-' + Date.now();
          res.json({
            success: true,
            data: {
              user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
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
    this.app.get('/api/products', (req, res) => {
      try {
        // Читаем menu_data.json
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
            data: inMemoryDB.products
          });
        }
      } catch (error) {
        logger.error('Get products error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });

    this.app.get('/api/categories', (req, res) => {
      try {
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
            data: inMemoryDB.categories
          });
        }
      } catch (error) {
        logger.error('Get categories error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });

    // ========== Orders API ==========
    this.app.post('/api/orders', (req, res) => {
      try {
        logger.info('Order request received:', req.body);
        
        const order = {
          id: 'ORD-' + inMemoryDB.orderCounter++,
          ...req.body,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        inMemoryDB.orders.push(order);
        
        logger.info('Order created:', order.id);
        
        res.status(201).json({
          success: true,
          data: order
        });
      } catch (error) {
        logger.error('Order creation error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });

    this.app.get('/api/orders', (req, res) => {
      try {
        res.json({
          success: true,
          data: inMemoryDB.orders
        });
      } catch (error) {
        logger.error('Get orders error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });

    this.app.get('/api/orders/:id', (req, res) => {
      try {
        const order = inMemoryDB.orders.find(o => o.id === req.params.id);
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

    this.app.put('/api/orders/:id/status', (req, res) => {
      try {
        const order = inMemoryDB.orders.find(o => o.id === req.params.id);
        if (order) {
          order.status = req.body.status;
          order.updatedAt = new Date().toISOString();
          res.json({
            success: true,
            data: order
          });
        } else {
          res.status(404).json({ success: false, error: 'Order not found' });
        }
      } catch (error) {
        logger.error('Update order status error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });

    this.app.get('/api/orders/stats', (req, res) => {
      try {
        const stats = {
          total: inMemoryDB.orders.length,
          pending: inMemoryDB.orders.filter(o => o.status === 'pending').length,
          completed: inMemoryDB.orders.filter(o => o.status === 'completed').length,
          totalRevenue: inMemoryDB.orders.reduce((sum, o) => sum + (o.total || 0), 0)
        };
        
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
    this.app.post('/api/payments', (req, res) => {
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
    this.app.post('/api/fiscal/receipt', (req, res) => {
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
    this.app.get('/api/dashboard/stats', (req, res) => {
      try {
        const stats = {
          todayRevenue: inMemoryDB.orders.reduce((sum, o) => sum + (o.total || 0), 0),
          todayOrders: inMemoryDB.orders.length,
          averageCheck: inMemoryDB.orders.length > 0 
            ? inMemoryDB.orders.reduce((sum, o) => sum + (o.total || 0), 0) / inMemoryDB.orders.length 
            : 0,
          activeOrders: inMemoryDB.orders.filter(o => o.status === 'pending').length,
          completedOrders: inMemoryDB.orders.filter(o => o.status === 'completed').length,
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
    this.app.get('/api/inventory', (req, res) => {
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
    this.app.get('/api/settings', (req, res) => {
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

    this.app.put('/api/settings', (req, res) => {
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
        database: 'In-Memory',
        endpoints: {
          auth: ['/api/auth/login'],
          products: ['/api/products', '/api/categories'],
          orders: ['/api/orders', '/api/orders/:id', '/api/orders/:id/status', '/api/orders/stats'],
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
        const filePath = path.join(projectRoot, req.path);
        if (fs.existsSync(filePath)) {
          res.sendFile(filePath);
        } else {
          res.status(404).send('Page not found');
        }
      } else {
        res.sendFile(path.join(projectRoot, 'index.html'));
      }
    });
  }

  start() {
    try {
      this.initialize();
      
      this.server = this.app.listen(this.port, '0.0.0.0', () => {
        console.log('\n' + '='.repeat(60));
        console.log('🎉 DANDY POS Server запущен!');
        console.log('='.repeat(60));
        console.log(`📊 База данных: In-Memory (для разработки)`);
        console.log(`🌐 Сервер: http://localhost:${this.port}`);
        console.log(`🏠 Главный сайт: http://localhost:${this.port}/`);
        console.log(`⚙️  Админка: http://localhost:${this.port}/admin.html`);
        console.log(`💰 POS касса: http://localhost:${this.port}/pos.html`);
        console.log(`📡 API: http://localhost:${this.port}/api`);
        console.log(`❤️  Health: http://localhost:${this.port}/api/health`);
        console.log('='.repeat(60));
        console.log('✅ Все готово! Можешь тестировать систему');
        console.log('📝 Логин: 111 / Пароль: 111 / Сайт: 111\n');
        
        logger.info('🎉 Server running');
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());

    } catch (error) {
      logger.error('❌ Failed to start server:', error);
      console.error('\n❌ Ошибка запуска сервера:', error.message);
      process.exit(1);
    }
  }

  shutdown() {
    logger.info('🛑 Shutting down server...');
    console.log('\n🛑 Остановка сервера...');
    
    if (this.server) {
      this.server.close(() => {
        logger.info('✅ Server closed');
        console.log('✅ Сервер остановлен');
        process.exit(0);
      });
    }
  }
}

// Start server
const server = new DandySimpleServer();
server.start();

module.exports = DandySimpleServer;
