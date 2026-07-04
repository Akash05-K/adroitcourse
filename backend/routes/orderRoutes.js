const express = require('express');
const { purchaseCourse, getMyOrders, getAllOrdersForAdmin, getOrderById } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, purchaseCourse);
router.get('/my-orders', protect, getMyOrders);
router.get('/admin/all', protect, admin, getAllOrdersForAdmin);
router.get('/:id', protect, getOrderById);

module.exports = router;