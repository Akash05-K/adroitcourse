const express = require('express');
const {
  uploadFeedbackForm,
  getActiveForm,
  getMyFeedbackStatus,
  submitFeedback,
  getAnalytics,
} = require('../controllers/feedbackController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/upload-form', protect, admin, upload.single('file'), uploadFeedbackForm);
router.get('/form', protect, getActiveForm);
router.get('/my-status', protect, getMyFeedbackStatus);
router.post('/', protect, submitFeedback);
router.get('/analytics', protect, admin, getAnalytics);

module.exports = router;