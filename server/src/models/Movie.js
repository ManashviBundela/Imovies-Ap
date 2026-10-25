const mongoose = require('mongoose');

const castSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: '' },
  photoUrl: { type: String, default: '' }
}, { _id: false });

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Movie description is required']
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required']
    },
    bannerUrl: {
      type: String,
      required: [true, 'Banner image URL is required']
    },
    trailerUrl: {
      type: String,
      default: ''
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      validate: [val => val.length > 0, 'Movie must have at least one genre']
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Movie duration in minutes is required']
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      default: 'English'
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required']
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.0
    },
    votesCount: {
      type: Number,
      default: 150
    },
    certificate: {
      type: String,
      enum: ['U', 'UA', 'A', 'R', 'PG-13', 'PG'],
      default: 'UA'
    },
    director: {
      type: String,
      default: 'Unknown'
    },
    cast: [castSchema],
    isFeatured: {
      type: Boolean,
      default: false
    },
    isUpcoming: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Now Showing', 'Upcoming', 'Ended'],
      default: 'Now Showing'
    }
  },
  {
    timestamps: true
  }
);

// Index for search optimization
movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ status: 1, isFeatured: 1 });

module.exports = mongoose.model('Movie', movieSchema);
