const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const upload = require('../middlewares/upload');
const {
  createHotel,
  updateHotel,
  deleteHotel,
  getHotels,
  getHotelById,
} = require('../controllers/hotelController');

const validateHotel = [
  check('title')
    .trim()
    .notEmpty()
    .withMessage('Hotel title is required')
    .isLength({ max: 255 })
    .withMessage('Hotel title cannot exceed 255 characters'),
  check('description')
    .trim()
    .notEmpty()
    .withMessage('Hotel description is required'),
  check('price')
    .isFloat({ min: 0 })
    .withMessage('Valid price is required'),
  check('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  check('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
];

router.get('/', getHotels);
router.get('/:id', getHotelById);
router.post('/', upload.single('image'), validateHotel, createHotel);
router.put('/:id', upload.single('image'), validateHotel, updateHotel);
router.delete('/:id', deleteHotel);

module.exports = router;
