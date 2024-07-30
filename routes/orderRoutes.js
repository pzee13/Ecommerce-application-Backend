const express = require('express');
const { placeOrder, getUserOrders, handleStripeWebhook } = require('../controllers/orderController');
const checkAuth = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', checkAuth, placeOrder);
router.get('/', checkAuth, getUserOrders);



module.exports = router;
