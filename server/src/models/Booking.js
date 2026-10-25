const mongoose = require('mongoose');

const seatItemSchema = new mongoose.Schema(
  {
    seatNumber: { type: String, required: true },
    tier: { type: String, default: 'Gold' },
    price: { type: Number, required: true }
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    cinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true
    },
    seats: [seatItemSchema],
    seatNumbers: {
      type: [String],
      required: true
    },
    screenNumber: {
      type: Number,
      default: 1
    },
    showDate: {
      type: String,
      required: true
    },
    showTime: {
      type: String,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
    convenienceFee: {
      type: Number,
      default: 30
    },
    taxes: {
      type: Number,
      default: 18
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paymentDetails: {
      method: {
        type: String,
        default: 'Card'
      },
      transactionId: {
        type: String,
        default: () => 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      },
      paymentStatus: {
        type: String,
        enum: ['Completed', 'Failed', 'Refunded'],
        default: 'Completed'
      }
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    },
    cancelledAt: {
      type: Date
    },
    cancellationReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
