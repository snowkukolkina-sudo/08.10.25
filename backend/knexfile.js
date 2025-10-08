require('dotenv').config();

module.exports = {
  development: {
    client: process.env.DB_CLIENT || 'postgresql',
    connection: process.env.DB_CLIENT === 'sqlite3' ? {
      filename: process.env.DB_FILENAME || './database.sqlite'
    } : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'dandy_pos',
      user: process.env.DB_USER || 'dandy_user',
      password: process.env.DB_PASSWORD || 'dandy_password'
    },
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds'
    },
    pool: process.env.DB_CLIENT === 'sqlite3' ? {
      min: 1,
      max: 1
    } : {
      min: 2,
      max: 10
    },
    useNullAsDefault: process.env.DB_CLIENT === 'sqlite3'
  },

  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: './database.sqlite'
    },
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds'
    },
    useNullAsDefault: true,
    pool: {
      min: 1,
      max: 1
    }
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds'
    },
    pool: {
      min: 2,
      max: 20
    },
    ssl: {
      rejectUnauthorized: false
    }
  },

  test: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME + '_test' || 'dandy_pos_test',
      user: process.env.DB_USER || 'dandy_user',
      password: process.env.DB_PASSWORD || 'dandy_password'
    },
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds'
    }
  }
};
