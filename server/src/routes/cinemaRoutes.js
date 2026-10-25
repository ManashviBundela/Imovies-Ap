const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { validateRequest } = require('../middleware/validationMiddleware');
const {
  getCinemas,
  getCinemaById,
  createCinema,
  updateCinema,
  deleteCinema
} = require('../controllers/cinemaController');
const { protect, admin } = require('../middleware/authMiddleware');

const cinemaValidation = [
  check('name', 'Cinema name is required').trim().notEmpty(),
  check('location', 'Location is required').trim().notEmpty(),
  check('city', 'City is required').trim().notEmpty(),
  check('address', 'Full address is required').notEmpty(),
  validateRequest
];

router.get('/', getCinemas);
router.get('/:id', getCinemaById);

// Protected Admin Routes
router.post('/', protect, admin, cinemaValidation, createCinema);
router.put('/:id', protect, admin, updateCinema);
router.delete('/:id', protect, admin, deleteCinema);

module.exports = router;
