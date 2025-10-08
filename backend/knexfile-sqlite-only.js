require('dotenv').config();

module.exports = {
  development: {
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
  }
};
