const asyncHandler = require('express-async-handler');
const xlsx = require('xlsx');
const FeedbackForm = require('../models/FeedbackForm');
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const Course = require('../models/Course');

// @desc    Upload an Excel file of feedback questions (creates a new active form)
// @route   POST /api/feedback/upload-form
// @access  Private/Admin
const uploadFeedbackForm = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please attach an .xlsx or .xls file');
  }

  let workbook;
  try {
    workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
  } catch (err) {
    res.status(400);
    throw new Error('Could not read the uploaded file — make sure it is a valid Excel file');
  }

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    res.status(400);
    throw new Error('The uploaded file has no sheets');
  }
  const sheet = workbook.Sheets[firstSheetName];

  // Read as an array of arrays so we don't depend on a specific header name
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const questions = rows
    .map((row) => (row && row[0] !== undefined ? String(row[0]).trim() : ''))
    .filter((cell) => cell.length > 0)
    // Skip a header row like "Question" / "Questions" if present
    .filter((cell) => !/^questions?$/i.test(cell));

  if (questions.length === 0) {
    res.status(400);
    throw new Error('No questions found in column A of the first sheet');
  }

  const form = await FeedbackForm.create({
    questions,
    uploadedBy: req.user._id,
    sourceFileName: req.file.originalname,
  });

  res.status(201).json({
    success: true,
    message: `Feedback form created with ${questions.length} question(s)`,
    form,
  });
});

// @desc    Get the current active feedback form (most recently uploaded)
// @route   GET /api/feedback/form
// @access  Private
const getActiveForm = asyncHandler(async (req, res) => {
  const form = await FeedbackForm.findOne().sort({ createdAt: -1 });
  if (!form) {
    return res.json({ success: true, form: null });
  }
  res.json({ success: true, form });
});

// @desc    Delete a feedback form template. Existing student responses tied
//          to it are kept (Feedback documents store their own snapshot via
//          formVersion + answers), so historical analytics are unaffected —
//          this only stops new submissions until a new form is uploaded.
// @route   DELETE /api/feedback/form/:id
// @access  Private/Admin
const deleteFeedbackForm = asyncHandler(async (req, res) => {
  const form = await FeedbackForm.findByIdAndDelete(req.params.id);
  if (!form) {
    res.status(404);
    throw new Error('Feedback form not found');
  }
  res.json({ success: true, message: 'Feedback form deleted' });
});

// @desc    Get the logged-in student's pending (not-yet-reviewed) and
//          already-submitted courses, based on their successful purchases
// @route   GET /api/feedback/my-status
// @access  Private
const getMyFeedbackStatus = asyncHandler(async (req, res) => {
  const activeForm = await FeedbackForm.findOne().sort({ createdAt: -1 });

  const purchasedOrders = await Order.find({ userId: req.user._id, paymentStatus: 'success' }).populate(
    'courseId',
    'title'
  );

  // Only responses submitted against the CURRENTLY active form count as
  // "already submitted" — if the admin uploaded a new form since the
  // student last responded, they should be prompted again.
  const submittedFeedback = activeForm
    ? await Feedback.find({ student: req.user._id, formVersion: activeForm._id }).select('course')
    : [];
  const submittedCourseIds = new Set(submittedFeedback.map((f) => f.course.toString()));

  const seenCourseIds = new Set();
  const pending = [];
  const submitted = [];

  for (const order of purchasedOrders) {
    if (!order.courseId) continue; // course may have been deleted since purchase
    const courseIdStr = order.courseId._id.toString();
    if (seenCourseIds.has(courseIdStr)) continue; // avoid duplicates if somehow purchased twice
    seenCourseIds.add(courseIdStr);

    const entry = { courseId: courseIdStr, courseTitle: order.courseId.title };
    if (submittedCourseIds.has(courseIdStr)) {
      submitted.push(entry);
    } else {
      pending.push(entry);
    }
  }

  res.json({
    success: true,
    hasActiveForm: !!activeForm,
    pending,
    submitted,
  });
});

// @desc    Submit feedback for a course
// @route   POST /api/feedback
// @access  Private
const submitFeedback = asyncHandler(async (req, res) => {
  const { courseId, answers, comment } = req.body;

  if (!courseId || !Array.isArray(answers) || answers.length === 0) {
    res.status(400);
    throw new Error('courseId and at least one answer are required');
  }

  for (const a of answers) {
    if (!a.question || typeof a.rating !== 'number' || a.rating < 1 || a.rating > 5) {
      res.status(400);
      throw new Error('Each answer must include a question and a rating between 1 and 5');
    }
  }

  // Must have actually purchased this course successfully
  const purchased = await Order.findOne({ userId: req.user._id, courseId, paymentStatus: 'success' });
  if (!purchased) {
    res.status(403);
    throw new Error('You can only leave feedback for courses you have purchased');
  }

  const activeForm = await FeedbackForm.findOne().sort({ createdAt: -1 });
  if (!activeForm) {
    res.status(400);
    throw new Error('No feedback form is currently active');
  }

  // Unique index on {student, course, formVersion} guarantees this at the
  // DB level too, but we check first to return a clean error message
  // instead of a raw duplicate-key error. Scoping by formVersion means a
  // student who already answered an OLDER form can submit again once a
  // new form has been uploaded.
  const existing = await Feedback.findOne({ student: req.user._id, course: courseId, formVersion: activeForm._id });
  if (existing) {
    res.status(400);
    throw new Error('You have already submitted feedback for this course');
  }

  const feedback = await Feedback.create({
    student: req.user._id,
    course: courseId,
    formVersion: activeForm._id,
    answers,
    comment: comment || '',
  });

  res.status(201).json({ success: true, message: 'Thank you for your feedback!', feedback });
});

// @desc    Get aggregated feedback analytics (course-wise, question-wise, overall)
// @route   GET /api/feedback/analytics
// @access  Private/Admin
const getAnalytics = asyncHandler(async (req, res) => {
  const activeForm = await FeedbackForm.findOne().sort({ createdAt: -1 });

  // Only count responses to the CURRENTLY active form. Once the admin
  // uploads a new form, older responses become historical and drop out of
  // the live charts — they're still preserved in the database, just not
  // shown here, since they answered a different question set.
  const feedbackList = activeForm
    ? await Feedback.find({ formVersion: activeForm._id }).populate('course', 'title category')
    : [];

  if (feedbackList.length === 0) {
    return res.json({
      success: true,
      totalResponses: 0,
      overallAverage: 0,
      byCourse: [],
      byQuestion: [],
    });
  }

  let totalRatingSum = 0;
  let totalRatingCount = 0;

  const courseMap = new Map(); // courseId -> { courseTitle, category, sum, count, responseCount }
  const questionMap = new Map(); // question text -> { sum, count }

  for (const fb of feedbackList) {
    const courseId = fb.course?._id?.toString() || 'unknown';
    if (!courseMap.has(courseId)) {
      courseMap.set(courseId, {
        courseId,
        courseTitle: fb.course?.title || 'Deleted course',
        category: fb.course?.category || '—',
        sum: 0,
        count: 0,
        responseCount: 0,
      });
    }
    const courseEntry = courseMap.get(courseId);
    courseEntry.responseCount += 1;

    for (const ans of fb.answers) {
      totalRatingSum += ans.rating;
      totalRatingCount += 1;

      courseEntry.sum += ans.rating;
      courseEntry.count += 1;

      if (!questionMap.has(ans.question)) {
        questionMap.set(ans.question, { sum: 0, count: 0 });
      }
      const qEntry = questionMap.get(ans.question);
      qEntry.sum += ans.rating;
      qEntry.count += 1;
    }
  }

  const byCourse = Array.from(courseMap.values()).map((c) => ({
    courseId: c.courseId,
    courseTitle: c.courseTitle,
    category: c.category,
    averageRating: +(c.sum / c.count).toFixed(2),
    responseCount: c.responseCount,
  }));

  const byQuestion = Array.from(questionMap.entries()).map(([question, q]) => ({
    question,
    averageRating: +(q.sum / q.count).toFixed(2),
    responseCount: q.count,
  }));

  res.json({
    success: true,
    totalResponses: feedbackList.length,
    overallAverage: +(totalRatingSum / totalRatingCount).toFixed(2),
    byCourse,
    byQuestion,
  });
});

module.exports = {
  uploadFeedbackForm,
  getActiveForm,
  deleteFeedbackForm,
  getMyFeedbackStatus,
  submitFeedback,
  getAnalytics,
};