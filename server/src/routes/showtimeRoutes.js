const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { validateRequest } = require('../middleware/validationMiddleware');
const {
  getShowtimes,
  getShowtimesByMovie,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime
} = require('../controllers/showtimeController');
const { protect, admin } = require('../middleware/authMiddleware');

const showtimeValidation = [
  check('movie', 'Movie ID is required').notEmpty(),
  check('cinema', 'Cinema ID is required').notEmpty(),
  check('showDate', 'Show date (YYYY-MM-DD) is required').notEmpty(),
  check('startTime', 'Start time is required').notEmpty(),
  validateRequest
];

router.get('/', getShowtimes);
router.get('/movie/:movieId', getShowtimesByMovie);
router.get('/:id', getShowtimeById);

// Protected Admin Routes
router.post('/', protect, admin, showtimeValidation, createShowtime);
router.put('/:id', protect, admin, updateShowtime);
router.delete('/:id', protect, admin, deleteShowtime);

module.exports = router;
