const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDatabase } = require('./config/database');

class SimplePOSServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
  }

  async initialize() {
    try {
      // Connect to SQLite database only
      await connectDatabase();

      // Setup middleware
      this.app.use(cors());
      this.app.use(express.json());

      // Setup routes
      this.setupRoutes();

      console.log('✅ Server initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize server:', error);
      throw error;
    }
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

    // Test database connection
    this.app.get('/api/test-db', async (req, res) => {
      try {
        const db = require('./config/database').getDatabase();
        const result = await db.raw('SELECT 1 as test');
        res.json({
          status: 'OK',
          database: 'SQLite',
          test: result
        });
      } catch (error) {
        res.status(500).json({
          status: 'ERROR',
          error: error.message
        });
      }
    });

    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        message: 'DANDY POS API Server (SQLite)',
        version: '1.0.0',
        database: 'SQLite',
        endpoints: [
          '/api/health',
          '/api/test-db'
        ]
      });
    });
  }

  async start() {
    try {
      await this.initialize();
      
      this.app.listen(this.port, () => {
        console.log(`🎉 Server running on port ${this.port}`);
        console.log(`📊 Database: SQLite`);
        console.log(`🌐 API: http://localhost:${this.port}/api`);
        console.log(`📋 Health: http://localhost:${this.port}/api/health`);
        console.log(`🔍 Test DB: http://localhost:${this.port}/api/test-db`);
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start server
const server = new SimplePOSServer();
server.start().catch(error => {
  console.error('💥 Server startup failed:', error);
  process.exit(1);
});
