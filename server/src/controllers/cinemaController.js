const Cinema = require('../models/Cinema');

// @desc    Get all cinemas
// @route   GET /api/cinemas
// @access  Public
const getCinemas = async (req, res, next) => {
  try {
    const { city } = req.query;
    const query = {};
    if (city && city !== 'All') {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    const cinemas = await Cinema.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: cinemas.length,
      cinemas
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get cinema by ID
// @route   GET /api/cinemas/:id
// @access  Public
const getCinemaById = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);

    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: 'Cinema not found'
      });
    }

    res.status(200).json({
      success: true,
      cinema
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create cinema (Admin)
// @route   POST /api/cinemas
// @access  Private/Admin
const createCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Cinema added successfully',
      cinema
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cinema (Admin)
// @route   PUT /api/cinemas/:id
// @access  Private/Admin
const updateCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: 'Cinema not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cinema updated successfully',
      cinema
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete cinema (Admin)
// @route   DELETE /api/cinemas/:id
// @access  Private/Admin
const deleteCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);

    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: 'Cinema not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cinema deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCinemas,
  getCinemaById,
  createCinema,
  updateCinema,
  deleteCinema
};
