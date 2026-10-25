const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { validateRequest } = require('../middleware/validationMiddleware');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

const bookingValidation = [
  check('showtimeId', 'Showtime ID is required').notEmpty(),
  check('seats', 'At least one seat must be selected').isArray({ min: 1 }),
  validateRequest
];

// User bookings (Protected)
router.post('/', protect, bookingValidation, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

// Admin all bookings (Protected Admin)
router.get('/', protect, admin, getAllBookings);

module.exports = router;
