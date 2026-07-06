const mongoose = require('mongoose');

// Represents one uploaded feedback form template. Each upload creates a new
// version; the most recently created one is treated as "active" (fetched via
// .sort({ createdAt: -1 }).limit(1) wherever the active form is needed).
// Keeping history instead of overwriting means past student responses always
// stay meaningfully tied to the question set they actually answered.
const feedbackFormSchema = new mongoose.Schema(
  {
    questions: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one question is required',
      },
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sourceFileName: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FeedbackForm', feedbackFormSchema);