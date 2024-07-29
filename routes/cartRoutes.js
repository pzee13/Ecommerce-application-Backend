const express = require('express');
const checkAuth = require('../middlewares/authMiddleware');
const { addToCart, getCart ,updateCart } = require('../controllers/cartController');

const router = express.Router();

// Add a product to the cart
router.get('/', checkAuth, getCart);
router.post('/', checkAuth, addToCart);
router.patch('/', checkAuth, updateCart);


module.exports = router;
