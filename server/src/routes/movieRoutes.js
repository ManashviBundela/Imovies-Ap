const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { validateRequest } = require('../middleware/validationMiddleware');
const {
  getMovies,
  getFeaturedMovies,
  getMovieById,
  getFilterOptions,
  createMovie,
  updateMovie,
  deleteMovie
} = require('../controllers/movieController');
const { protect, admin } = require('../middleware/authMiddleware');

const movieValidation = [
  check('title', 'Movie title is required').trim().notEmpty(),
  check('description', 'Movie description is required').notEmpty(),
  check('posterUrl', 'Valid poster URL is required').notEmpty(),
  check('bannerUrl', 'Valid banner URL is required').notEmpty(),
  check('duration', 'Duration must be a positive number of minutes').isNumeric(),
  validateRequest
];

router.get('/featured', getFeaturedMovies);
router.get('/meta/filters', getFilterOptions);
router.get('/', getMovies);
router.get('/:id', getMovieById);

// Protected Admin Routes
router.post('/', protect, admin, movieValidation, createMovie);
router.put('/:id', protect, admin, updateMovie);
router.delete('/:id', protect, admin, deleteMovie);

module.exports = router;
