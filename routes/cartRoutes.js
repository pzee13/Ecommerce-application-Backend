const express = require('express');
const checkAuth = require('../middlewares/authMiddleware');
const { addToCart, getCart } = require('../controllers/cartController');

const router = express.Router();

// Add a product to the cart
router.get('/', checkAuth, getCart);
router.post('/', checkAuth, addToCart);


module.exports = router;
