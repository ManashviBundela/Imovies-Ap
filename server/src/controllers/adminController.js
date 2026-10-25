const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalMovies,
      totalCinemas,
      totalShowtimes,
      totalBookings,
      revenueResult,
      recentBookings
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Movie.countDocuments(),
      Cinema.countDocuments(),
      Showtime.countDocuments({ status: 'active' }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),
      Booking.find()
        .populate('movie', 'title')
        .populate('cinema', 'name')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(6)
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalMovies,
        totalCinemas,
        totalShowtimes,
        totalBookings,
        totalRevenue,
        recentBookings
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
