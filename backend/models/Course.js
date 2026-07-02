const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    duration: {
      // e.g. "3 months" or "45 days"
      type: String,
      required: true,
    },
    dailyTiming: {
      // e.g. "6:00 PM - 8:00 PM"
      type: String,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    vacantSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    instructor: {
      name: { type: String, required: true },
      bio: { type: String, default: '' },
      photo: { type: String, default: '' },
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/600x400?text=Course+Banner',
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    studentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    certificateIncluded: {
      type: Boolean,
      default: true,
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    // Optimistic concurrency helper (used alongside atomic $inc updates)
    version: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index to support search by title/description/category
courseSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Course', courseSchema);