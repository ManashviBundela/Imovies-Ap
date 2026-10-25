const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');

// Helper to generate unique booking reference
const generateBookingReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `IMV-${timestamp}-${random}`;
};

// @desc    Create a new booking with atomic seat reservation
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { showtimeId, seats, paymentMethod = 'Card' } = req.body;

    if (!showtimeId) {
      return res.status(400).json({ success: false, message: 'Showtime ID is required' });
    }

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one seat' });
    }

    // Extract seat numbers
    const seatNumbers = seats.map((s) => (typeof s === 'string' ? s : s.seatNumber));

    // Verify Showtime exists and is active
    const showtime = await Showtime.findById(showtimeId).populate('movie').populate('cinema');
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }

    if (showtime.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This showtime is no longer available for booking' });
    }

    // Server-side seat pricing calculation based on showtime's tier pricing
    const tierPricing = showtime.tierPricing || { silver: 180, gold: 280, vip: 420 };
    let subtotal = 0;
    const seatDetails = [];

    seats.forEach((seat) => {
      const seatNumber = typeof seat === 'string' ? seat : seat.seatNumber;
      const rowChar = seatNumber.charAt(0).toUpperCase();

      // Determine tier by row if not provided
      let tier = 'Gold';
      let price = tierPricing.gold;

      if (typeof seat === 'object' && seat.tier) {
        tier = seat.tier;
        const tierKey = tier.toLowerCase();
        price = tierPricing[tierKey] || tierPricing.gold;
      } else {
        // Default tier assignment: A, B = Silver; C, D = Gold; E, F = VIP
        if (['A', 'B'].includes(rowChar)) {
          tier = 'Silver';
          price = tierPricing.silver;
        } else if (['E', 'F'].includes(rowChar)) {
          tier = 'VIP';
          price = tierPricing.vip;
        } else {
          tier = 'Gold';
          price = tierPricing.gold;
        }
      }

      subtotal += price;
      seatDetails.push({
        seatNumber,
        tier,
        price
      });
    });

    const convenienceFee = Math.round(seatDetails.length * 20); // 20 per ticket
    const taxes = Math.round(subtotal * 0.05); // 5% GST/Tax
    const totalAmount = subtotal + convenienceFee + taxes;

    // Generate unique reference
    const bookingReference = generateBookingReference();

    // ATOMIC RESERVATION:
    // Update showtime only if NONE of the requested seats are already in bookedSeats
    const atomicSeatEntries = seatNumbers.map((seatNum) => ({
      seatNumber: seatNum,
      userId: req.user._id,
      bookedAt: new Date()
    }));

    const updatedShowtime = await Showtime.findOneAndUpdate(
      {
        _id: showtimeId,
        status: 'active',
        'bookedSeats.seatNumber': { $nin: seatNumbers }
      },
      {
        $push: {
          bookedSeats: { $each: atomicSeatEntries }
        }
      },
      { new: true }
    );

    // If null, atomic condition failed => one or more seats were already booked!
    if (!updatedShowtime) {
      // Find which seat was already booked to provide clear user feedback
      const currentShow = await Showtime.findById(showtimeId);
      const alreadyTaken = currentShow.bookedSeats
        .map((s) => s.seatNumber)
        .filter((sn) => seatNumbers.includes(sn));

      return res.status(409).json({
        success: false,
        message: `Seat ${alreadyTaken.join(', ')} is already booked. Please choose another seat.`,
        conflictSeats: alreadyTaken
      });
    }

    // Create the booking document
    const booking = await Booking.create({
      bookingReference,
      user: req.user._id,
      showtime: showtime._id,
      movie: showtime.movie._id,
      cinema: showtime.cinema._id,
      seats: seatDetails,
      seatNumbers,
      screenNumber: showtime.screenNumber,
      showDate: showtime.showDate,
      showTime: showtime.startTime,
      subtotal,
      convenienceFee,
      taxes,
      totalAmount,
      paymentDetails: {
        method: paymentMethod,
        transactionId: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        paymentStatus: 'Completed'
      },
      status: 'confirmed'
    });

    // Backlink booking ID to the showtime's bookedSeats
    await Showtime.updateOne(
      { _id: showtimeId, 'bookedSeats.seatNumber': { $in: seatNumbers } },
      { $set: { 'bookedSeats.$[elem].bookingId': booking._id } },
      { arrayFilters: [{ 'elem.seatNumber': { $in: seatNumbers } }] }
    );

    // Populate booking details for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie', 'title posterUrl duration certificate language')
      .populate('cinema', 'name location city address');

    res.status(201).json({
      success: true,
      message: 'Tickets booked successfully!',
      booking: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title posterUrl bannerUrl duration certificate language rating')
      .populate('cinema', 'name location city address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by ID or Reference
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId
      ? { $or: [{ _id: req.params.id }, { bookingReference: req.params.id }] }
      : { bookingReference: req.params.id };

    const booking = await Booking.findOne(query)
      .populate('movie')
      .populate('cinema')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify user ownership or admin privilege
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You cannot view another customer’s booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check ownership or admin
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You cannot cancel another user’s booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled.'
      });
    }

    // Check cancellation rule:
    // Show date and time must not be in the past
    // Parse show date (YYYY-MM-DD)
    const showDateTimeString = `${booking.showDate} ${booking.showTime}`;
    const showTimeObj = new Date(showDateTimeString);

    // If date format parses cleanly, check time limit
    if (!isNaN(showTimeObj.getTime())) {
      const now = new Date();
      // Allow cancellation if show is at least 30 minutes in the future
      if (showTimeObj.getTime() - now.getTime() < 30 * 60 * 1000) {
        return res.status(400).json({
          success: false,
          message: 'Bookings can only be cancelled up to 30 minutes before showtime.'
        });
      }
    }

    // Release seats from Showtime atomically
    await Showtime.findByIdAndUpdate(booking.showtime, {
      $pull: {
        bookedSeats: {
          seatNumber: { $in: booking.seatNumbers }
        }
      }
    });

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    booking.paymentDetails.paymentStatus = 'Refunded';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been released and refund initiated.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.bookingReference = { $regex: search.trim(), $options: 'i' };
    }

    const bookings = await Booking.find(query)
      .populate('movie', 'title posterUrl')
      .populate('cinema', 'name location city')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings
};
