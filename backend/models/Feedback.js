const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    formVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeedbackForm',
      required: true,
    },
    // One rating (1-5) per question, in the same order as the form's
    // questions at the time of submission — kept as {question, rating}
    // pairs (not just an array of numbers) so responses remain readable
    // even if the active form's question list changes later.
    answers: [
      {
        question: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        _id: false,
      },
    ],
    comment: {
      type: String,
      default: '',
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// A student can only submit feedback once per course
feedbackSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);