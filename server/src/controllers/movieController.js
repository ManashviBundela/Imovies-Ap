const Movie = require('../models/Movie');

// @desc    Get all movies with search, filter, and sorting
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const { search, genre, language, status, sortBy, limit = 50 } = req.query;

    const query = {};

    // Search by title (regex case-insensitive)
    if (search && search.trim() !== '') {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by genre
    if (genre && genre !== 'All') {
      query.genre = { $in: [genre] };
    }

    // Filter by language
    if (language && language !== 'All') {
      query.language = { $regex: new RegExp(`^${language}$`, 'i') };
    }

    // Filter by status (Now Showing / Upcoming)
    if (status && status !== 'All') {
      query.status = status;
    }

    // Sorting
    let sortOptions = { releaseDate: -1 };
    if (sortBy === 'rating') {
      sortOptions = { rating: -1 };
    } else if (sortBy === 'releaseDateDesc') {
      sortOptions = { releaseDate: -1 };
    } else if (sortBy === 'releaseDateAsc') {
      sortOptions = { releaseDate: 1 };
    } else if (sortBy === 'title') {
      sortOptions = { title: 1 };
    }

    const movies = await Movie.find(query)
      .sort(sortOptions)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: movies.length,
      movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured hero movies
// @route   GET /api/movies/featured
// @access  Public
const getFeaturedMovies = async (req, res, next) => {
  try {
    const featured = await Movie.find({ isFeatured: true, status: 'Now Showing' })
      .sort({ rating: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      count: featured.length,
      movies: featured
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.status(200).json({
      success: true,
      movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available genres and languages for filters
// @route   GET /api/movies/meta/filters
// @access  Public
const getFilterOptions = async (req, res, next) => {
  try {
    const genres = await Movie.distinct('genre');
    const languages = await Movie.distinct('language');

    res.status(200).json({
      success: true,
      genres: genres.sort(),
      languages: languages.sort()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie (Admin)
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Movie added successfully',
      movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie (Admin)
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      movie
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie (Admin)
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getFeaturedMovies,
  getMovieById,
  getFilterOptions,
  createMovie,
  updateMovie,
  deleteMovie
};
