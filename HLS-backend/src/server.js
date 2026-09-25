const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const hotelRoutes = require('./routes/hotelRoutes');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL;

app.use(cors(CLIENT_URL ? { origin: CLIENT_URL } : {}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'hotel-backend', timestamp: new Date().toISOString() });
});

app.use('/api/hotels', hotelRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

app.use((err, req, res, next) => {
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  } else if (err) {
    console.error('Unhandled server error:', err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  }
  next();
});

async function startServerWithRetry(maxRetries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Connecting to database (attempt ${attempt}/${maxRetries})...`);
      await pool.query('SELECT 1');
      console.log('Database connection established.');
      break;
    } catch (err) {
      console.error(`Database connection attempt ${attempt} failed:`, err.message);
      if (attempt === maxRetries) {
        console.error('Max database connection attempts reached. Exiting.');
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hotel Management Backend server running on http://0.0.0.0:${PORT}`);
  });

}

startServerWithRetry();
