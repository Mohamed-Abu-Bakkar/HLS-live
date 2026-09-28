const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { pool } = require('./index');

async function init() {
  const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
  const target = process.env.DATABASE_URL
    ? `branch ${process.env.NEON_BRANCH || 'production'} (Neon)`
    : `${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'hotel_db'}`;
  console.log(`Applying ${path.join(__dirname, 'init.sql')} to ${target}...`);
  await pool.query(sql);
  const { rows } = await pool.query(
    "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname"
  );
  console.log('Schema ready:', rows.map((r) => r.indexname).join(', '));
}

init()
  .then(() => pool.end())
  .catch((err) => {
    console.error('Schema init failed:', err.message);
    process.exit(1);
  });
