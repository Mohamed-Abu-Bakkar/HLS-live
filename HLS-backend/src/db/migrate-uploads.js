const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { pool } = require('./index');
const { putObject } = require('../storage');

const uploadsDir = path.resolve(__dirname, '../uploads');
const KEY_PREFIX = 'hotels/';

const CONTENT_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

async function migrate() {
  const { rows } = await pool.query(
    `SELECT id, image_url FROM hotels WHERE image_url LIKE '/uploads/%' ORDER BY id`
  );
  console.log(`Found ${rows.length} hotel(s) still pointing at local /uploads/ files.`);

  const missing = [];
  let migrated = 0;

  for (const row of rows) {
    const filename = path.basename(row.image_url);
    const source = path.join(uploadsDir, filename);

    if (!fs.existsSync(source)) {
      missing.push(`#${row.id} ${filename}`);
      continue;
    }

    const ext = path.extname(filename).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
    const url = await putObject(`${KEY_PREFIX}${filename}`, fs.readFileSync(source), contentType);

    await pool.query(
      'UPDATE hotels SET image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [url, row.id]
    );
    migrated++;
    console.log(`  #${row.id} ${filename} -> ${url}`);
  }

  console.log(`Migrated ${migrated}/${rows.length}.`);
  if (missing.length > 0) {
    console.warn(`Skipped ${missing.length} row(s) with no local file:\n  ${missing.join('\n  ')}`);
  }
}

migrate()
  .then(() => pool.end())
  .catch((err) => {
    console.error('Upload migration failed:', err.message);
    process.exit(1);
  });
