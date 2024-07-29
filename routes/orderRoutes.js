const express = require('express');
const { placeOrder, getUserOrders, handleStripeWebhook } = require('../controllers/orderController');
const checkAuth = require('../middlewares/authMiddleware');

const router = express.Router();

// Use the JSON body parser for other routes


router.post('/', checkAuth, placeOrder);
router.get('/', checkAuth, getUserOrders);

// Use the raw body parser for Stripe webhook
// router.post('/stripewebhook', bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
