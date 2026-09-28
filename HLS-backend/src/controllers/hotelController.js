const { pool } = require('../db');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const createHotel = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, latitude, longitude, price } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  if (!image) {
    return res.status(400).json({ errors: [{ msg: 'Image is required' }] });
  }

  try {
    const result = await pool.query(
      `INSERT INTO hotels (image_url, title, description, latitude, longitude, price)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [image, title, description, latitude, longitude, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateHotel = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { title, description, latitude, longitude, price } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM hotels WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    let image = existing.rows[0].image_url;
    let oldImage = null;
    if (req.file) {
      oldImage = image;
      image = `/uploads/${req.file.filename}`;
    }

    const result = await pool.query(
      `UPDATE hotels SET image_url = $1, title = $2, description = $3,
       latitude = $4, longitude = $5, price = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [image, title, description, latitude, longitude, price, id]
    );

    if (oldImage && oldImage.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '../uploads', path.basename(oldImage));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteHotel = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await pool.query('SELECT * FROM hotels WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const image = existing.rows[0].image_url;
    if (image && image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '../uploads', path.basename(image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await pool.query('DELETE FROM hotels WHERE id = $1', [id]);
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getHotels = async (req, res) => {
  const { search, minPrice, maxPrice, offset = 0, limit = 9 } = req.query;

  let query = 'SELECT * FROM hotels';
  let countQuery = 'SELECT COUNT(*) FROM hotels';
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (search) {
    const searchWords = search.trim().split(/\s+/).filter((w) => w.length > 0);
    if (searchWords.length > 0) {
      searchWords.forEach((w, i) => {
        conditions.push(`title ILIKE $${paramIndex + i}`);
        values.push(`%${w}%`);
      });
      paramIndex += searchWords.length;
    }
  }

  if (minPrice) {
    conditions.push(`price >= $${paramIndex}`);
    values.push(parseFloat(minPrice));
    paramIndex++;
  }

  if (maxPrice) {
    conditions.push(`price <= $${paramIndex}`);
    values.push(parseFloat(maxPrice));
    paramIndex++;
  }

  if (conditions.length > 0) {
    const whereClause = ' WHERE ' + conditions.join(' AND ');
    query += whereClause;
    countQuery += whereClause;
  } else if (search) {
    const searchWords = search.trim().split(/\s+/).filter((w) => w.length > 0);
    if (searchWords.length > 0) {
      const orConditions = searchWords.map((w, i) => `title ILIKE $${paramIndex + i}`);
      const searchValues = searchWords.map((w) => `%${w}%`);
      query += ` WHERE ` + orConditions.join(' OR ');
      values.push(...searchValues);
      paramIndex += searchWords.length;
    }
  }


  query += ` ORDER BY created_at DESC OFFSET $${paramIndex} LIMIT $${paramIndex + 1}`;
  values.push(parseInt(offset), parseInt(limit));

  try {
    const [hotels, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, values.slice(0, -2)),
    ]);

    res.json({
      hotels: hotels.rows,
      total: parseInt(countResult.rows[0].count),
      offset: parseInt(offset),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getHotelById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM hotels WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createHotel,
  updateHotel,
  deleteHotel,
  getHotels,
  getHotelById,
};
