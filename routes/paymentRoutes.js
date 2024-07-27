const express = require('express');
const { processPayment } = require('../controllers/paymentController');
const checkAuth = require('../middlewares/authMiddleware');
const router = express.Router();

// Process payment
router.post('/', checkAuth,processPayment);

module.exports = router;
