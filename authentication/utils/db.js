// ===================================
// 2. DATABASE CONNECTION (db.js)
// ===================================
const { Pool } = require('pg');
require('dotenv').config();
const logger = require('./logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  logger.info('Database connection established', { database: 'postgresql' });
});

pool.on('error', (err) => {
  logger.error('Unexpected database error on idle client', err);
  process.exit(-1);
});

module.exports = pool;