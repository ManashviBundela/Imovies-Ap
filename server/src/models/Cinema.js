const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  screenNumber: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    default: 'Screen 1'
  },
  soundSystem: {
    type: String,
    default: 'Dolby Atmos 7.1'
  },
  screenType: {
    type: String,
    enum: ['Standard', 'IMAX', '4DX', '3D', 'Gold Class'],
    default: 'Standard'
  },
  totalSeats: {
    type: Number,
    default: 60
  },
  seatLayout: {
    rows: { type: Number, default: 6 }, // A to F
    cols: { type: Number, default: 10 }, // 1 to 10
    tiers: [
      {
        name: { type: String, default: 'Silver' }, // Silver, Gold, VIP
        rowLabels: [{ type: String }],
        basePrice: { type: Number, default: 200 }
      }
    ]
  }
});

const cinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Cinema name is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location area is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Full address is required']
    },
    facilities: {
      type: [String],
      default: ['Dolby Atmos', 'Recliner Seats', 'Parking', 'Food & Beverages']
    },
    contactPhone: {
      type: String,
      default: '+1 (800) 555-FILM'
    },
    screens: [screenSchema]
  },
  {
    timestamps: true
  }
);

cinemaSchema.index({ city: 1, name: 1 });

module.exports = mongoose.model('Cinema', cinemaSchema);
