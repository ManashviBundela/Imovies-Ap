const Showtime = require('../models/Showtime');
const Cinema = require('../models/Cinema');
const Movie = require('../models/Movie');

// @desc    Get showtimes with filters
// @route   GET /api/showtimes
// @access  Public
const getShowtimes = async (req, res, next) => {
  try {
    const { movieId, cinemaId, date } = req.query;
    const query = { status: 'active' };

    if (movieId) query.movie = movieId;
    if (cinemaId) query.cinema = cinemaId;
    if (date) query.showDate = date;

    const showtimes = await Showtime.find(query)
      .populate('movie', 'title posterUrl duration certificate language rating')
      .populate('cinema', 'name location city address facilities screens')
      .sort({ showDate: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: showtimes.length,
      showtimes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get showtimes for a specific movie grouped by cinema
// @route   GET /api/showtimes/movie/:movieId
// @access  Public
const getShowtimesByMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { date } = req.query;

    const query = { movie: movieId, status: 'active' };
    if (date) {
      query.showDate = date;
    }

    const showtimes = await Showtime.find(query)
      .populate('cinema', 'name location city address facilities screens')
      .sort({ showDate: 1, startTime: 1 });

    // Group showtimes by cinema
    const cinemaMap = {};
    showtimes.forEach((st) => {
      const cinemaId = st.cinema._id.toString();
      if (!cinemaMap[cinemaId]) {
        cinemaMap[cinemaId] = {
          cinema: st.cinema,
          showtimes: []
        };
      }
      cinemaMap[cinemaId].showtimes.push({
        _id: st._id,
        showDate: st.showDate,
        startTime: st.startTime,
        endTime: st.endTime,
        format: st.format,
        screenNumber: st.screenNumber,
        tierPricing: st.tierPricing,
        totalSeats: st.totalSeats,
        availableSeatsCount: st.totalSeats - (st.bookedSeats ? st.bookedSeats.length : 0)
      });
    });

    const grouped = Object.values(cinemaMap);

    res.status(200).json({
      success: true,
      groupedCinemas: grouped
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single showtime with real-time seat availability
// @route   GET /api/showtimes/:id
// @access  Public
const getShowtimeById = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie', 'title posterUrl bannerUrl duration certificate language rating genre')
      .populate('cinema');

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }

    // Find screen layout from cinema
    const cinema = showtime.cinema;
    const screen = cinema.screens.find(
      (s) => s.screenNumber === showtime.screenNumber
    ) || cinema.screens[0];

    // Build list of booked seat numbers
    const bookedSeatNumbers = showtime.bookedSeats.map((s) => s.seatNumber);

    res.status(200).json({
      success: true,
      showtime: {
        _id: showtime._id,
        movie: showtime.movie,
        cinema: {
          _id: cinema._id,
          name: cinema.name,
          location: cinema.location,
          city: cinema.city,
          address: cinema.address
        },
        screen: screen,
        screenNumber: showtime.screenNumber,
        showDate: showtime.showDate,
        startTime: showtime.startTime,
        format: showtime.format,
        tierPricing: showtime.tierPricing,
        totalSeats: showtime.totalSeats,
        bookedSeatNumbers,
        availableSeatsCount: showtime.totalSeats - bookedSeatNumbers.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create showtime (Admin)
// @route   POST /api/showtimes
// @access  Private/Admin
const createShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Showtime created successfully',
      showtime
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update showtime (Admin)
// @route   PUT /api/showtimes/:id
// @access  Private/Admin
const updateShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Showtime updated successfully',
      showtime
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete showtime (Admin)
// @route   DELETE /api/showtimes/:id
// @access  Private/Admin
const deleteShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Showtime deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShowtimes,
  getShowtimesByMovie,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime
};
