const mongoose = require('mongoose');

const bookedSeatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bookedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required']
    },
    cinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: [true, 'Cinema reference is required']
    },
    screenNumber: {
      type: Number,
      required: [true, 'Screen number is required'],
      default: 1
    },
    showDate: {
      type: String, // Stored as YYYY-MM-DD for easy day queries
      required: [true, 'Show date string (YYYY-MM-DD) is required']
    },
    startTime: {
      type: String, // e.g. "10:30 AM", "01:45 PM", "07:30 PM"
      required: [true, 'Start time is required']
    },
    endTime: {
      type: String,
      default: ''
    },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX'],
      default: '2D'
    },
    language: {
      type: String,
      default: 'English'
    },
    tierPricing: {
      silver: { type: Number, default: 180 },
      gold: { type: Number, default: 280 },
      vip: { type: Number, default: 420 }
    },
    bookedSeats: [bookedSeatSchema],
    totalSeats: {
      type: Number,
      default: 60
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
showtimeSchema.index({ movie: 1, showDate: 1 });
showtimeSchema.index({ cinema: 1, showDate: 1 });
showtimeSchema.index({ "bookedSeats.seatNumber": 1 });

module.exports = mongoose.model('Showtime', showtimeSchema);
