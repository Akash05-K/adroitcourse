// One-off cleanup script — deletes all orders, clears users' purchasedCourses,
// and restores course seat counts to full capacity.
//
// Run with:  node resetOrders.js
//
// Safe to delete this file afterward — it's not part of the running app.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Order = require('./models/Order');
const User = require('./models/User');
const Course = require('./models/Course');

const run = async () => {
  try {
    await connectDB();

    const orderResult = await Order.deleteMany({});
    console.log(`🗑️  Deleted ${orderResult.deletedCount} order(s)`);

    const userResult = await User.updateMany({}, { $set: { purchasedCourses: [] } });
    console.log(`🧹 Cleared purchasedCourses on ${userResult.modifiedCount} user(s)`);

    // Restore vacantSeats back to totalSeats for every course
    const courses = await Course.find({});
    for (const course of courses) {
      course.vacantSeats = course.totalSeats;
      await course.save();
    }
    console.log(`🔄 Reset seat counts on ${courses.length} course(s)`);

    console.log('✅ Done. Database is back to a clean state.');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error.message);
    process.exit(1);
  }
};

run();