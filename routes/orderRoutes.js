const express = require('express');
const { placeOrder, getUserOrders } = require('../controllers/orderController');
const checkAuth = require('../middlewares/authMiddleware');

const router = express.Router();

// Place a new order
router.post('/',checkAuth, placeOrder);

// Get all orders for the logged-in user
router.get('/',checkAuth, getUserOrders);

module.exports = router;
