const knex = require('knex');
const logger = require('../utils/logger');

let db = null;

const connectDatabase = async () => {
  try {
    // Если используется SQLite, создаем конфигурацию напрямую
    if (process.env.DB_CLIENT === 'sqlite3') {
      const sqliteConfig = {
        client: 'sqlite3',
        connection: {
          filename: './database.sqlite'
        },
        migrations: {
          directory: './database/migrations-sqlite'
        },
        seeds: {
          directory: './database/seeds'
        },
        useNullAsDefault: true,
        pool: {
          min: 1,
          max: 1
        }
      };
      db = knex(sqliteConfig);
    } else {
      const knexfile = require('../../knexfile');
      const env = process.env.NODE_ENV || 'development';
      db = knex(knexfile[env]);
    }
    
    // Test connection
    await db.raw('SELECT 1');
    logger.info('✅ Database connected successfully');
    
    return db;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return db;
};

const closeDatabase = async () => {
  if (db) {
    await db.destroy();
    logger.info('Database connection closed');
  }
};

module.exports = {
  connectDatabase,
  getDatabase,
  closeDatabase
};
