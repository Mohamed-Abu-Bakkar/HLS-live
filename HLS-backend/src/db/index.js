const { Pool } = require('pg');
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const poolOptions = {
  max: 5,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 15000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 30000,
  allowExitOnIdle: true,
};

const connectionString = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace(/sslmode=require/, 'sslmode=verify-full')
  : undefined;

const pool = connectionString
  ? new Pool({ ...poolOptions, connectionString })
  : new Pool({
      ...poolOptions,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'hotel_user',
      password: process.env.DB_PASSWORD || 'hotel_password',
      database: process.env.DB_NAME || 'hotel_db',
    });

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

const query = (text, params) => {
  const start = Date.now();
  return pool.query(text, params).then((res) => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text: text.trim().substring(0, 80), duration, rows: res.rowCount });
    }
    return res;
  });
};

module.exports = {
  pool,
  query,
};
