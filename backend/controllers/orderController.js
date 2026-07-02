const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Order = require('../models/Order');
const User = require('../models/User');

/**
 * CONCURRENCY STRATEGY
 * ---------------------------------------------------------------------
 * Many users can click "Buy Now" on the same course at the same instant.
 * We must never let vacantSeats go below 0 (overselling).
 *
 * We solve this with an ATOMIC conditional update:
 *   Course.findOneAndUpdate(
 *     { _id: courseId, vacantSeats: { $gt: 0 } },   // condition checked
 *     { $inc: { vacantSeats: -1 } },                 // atomic decrement
 *     { new: true }
 *   )
 *
 * MongoDB guarantees this find+update pair is atomic at the document level.
 * If two requests race, only the requests that find vacantSeats > 0 at the
 * moment of the atomic op will succeed; once seats hit 0, subsequent calls
 * simply won't match the filter and return null, so we can safely reject
 * the purchase with "Course full" instead of decrementing into negative
 * numbers.
 *
 * We additionally wrap the seat decrement + order creation + user update in
 * a MongoDB session transaction where possible (requires a replica set /
 * Atlas cluster) so that if order creation fails after the seat was
 * decremented, the seat decrement is rolled back too. On a standalone
 * MongoDB instance without transaction support, we fall back to the atomic
 * decrement alone, which is still safe against overselling.
 */

// @desc    Purchase a course
// @route   POST /api/orders
// @access  Private
const purchaseCourse = asyncHandler(async (req, res) => {
  const { courseId, paymentMethod } = req.body;
  const userId = req.user._id;

  if (!courseId || !paymentMethod) {
    res.status(400);
    throw new Error('courseId and paymentMethod are required');
  }

  const validMethods = ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet', 'Cash on Delivery', 'PayPal', 'Stripe'];
  if (!validMethods.includes(paymentMethod)) {
    res.status(400);
    throw new Error('Invalid payment method');
  }

  // Prevent duplicate purchase of the same course by the same user
  const alreadyPurchased = await Order.findOne({ userId, courseId, paymentStatus: 'success' });
  if (alreadyPurchased) {
    res.status(400);
    throw new Error('You have already purchased this course');
  }

  let session = null;
  let useTransaction = true;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    // Standalone Mongo instance (no replica set) - transactions unsupported.
    // We still proceed safely using the atomic $inc guard below.
    useTransaction = false;
  }

  try {
    // ATOMIC, RACE-CONDITION-SAFE SEAT DECREMENT
    const course = await Course.findOneAndUpdate(
      { _id: courseId, vacantSeats: { $gt: 0 } },
      { $inc: { vacantSeats: -1, version: 1 } },
      { new: true, session: useTransaction ? session : undefined }
    );

    if (!course) {
      if (useTransaction) await session.abortTransaction();
      // Distinguish "course not found" vs "course full"
      const exists = await Course.findById(courseId);
      res.status(exists ? 409 : 404);
      throw new Error(exists ? 'No vacant seats available for this course' : 'Course not found');
    }

    // Simulate a payment gateway call (replace with real Stripe/PayPal call).
    // We treat non-COD methods as instantly "successful" in this demo.
    const paymentStatus = 'success';

    const order = await Order.create(
      [
        {
          userId,
          courseId,
          courseTitleSnapshot: course.title,
          priceSnapshot: course.price,
          imageSnapshot: course.image,
          paymentMethod,
          paymentStatus,
        },
      ],
      useTransaction ? { session } : undefined
    );

    const createdOrder = Array.isArray(order) ? order[0] : order;

    await User.findByIdAndUpdate(
      userId,
      { $push: { purchasedCourses: { course: courseId } } },
      useTransaction ? { session } : undefined
    );

    if (useTransaction) {
      await session.commitTransaction();
    }

    res.status(201).json({
      success: true,
      message: 'Course purchased successfully',
      order: createdOrder,
      vacantSeats: course.vacantSeats,
    });
  } catch (error) {
    if (useTransaction && session) {
      try {
        await session.abortTransaction();
      } catch (_) {
        /* transaction may already be aborted */
      }
    }
    throw error;
  } finally {
    if (session) session.endSession();
  }
});

// @desc    Get logged-in user's purchase history
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id })
    .populate('courseId', 'title image price duration instructor')
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
});

// @desc    Get single order by ID (order confirmation page)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('courseId');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Ensure user can only view their own order (unless admin)
  if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, order });
});

module.exports = { purchaseCourse, getMyOrders, getOrderById };