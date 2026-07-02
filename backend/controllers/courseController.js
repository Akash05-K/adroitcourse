const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');

// @desc    Get all courses (supports search, category filter, pagination)
// @route   GET /api/courses?search=&category=&page=&limit=
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 8, 1);
  const skip = (page - 1) * limit;

  const query = {};

  if (req.query.search) {
    // Case-insensitive partial match on title/description/instructor name
    const regex = new RegExp(req.query.search, 'i');
    query.$or = [{ title: regex }, { description: regex }, { 'instructor.name': regex }];
  }

  if (req.query.category && req.query.category !== 'All') {
    query.category = req.query.category;
  }

  const [courses, total, categories] = await Promise.all([
    Course.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Course.countDocuments(query),
    Course.distinct('category'),
  ]);

  res.json({
    success: true,
    courses,
    categories,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    totalCourses: total,
  });
});

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ success: true, course });
});

// @desc    Create a course (admin/seed use)
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create({ ...req.body, vacantSeats: req.body.totalSeats });
  res.status(201).json({ success: true, course });
});

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ success: true, course });
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ success: true, message: 'Course deleted' });
});

module.exports = { getCourses, getCourseById, createCourse, updateCourse, deleteCourse };