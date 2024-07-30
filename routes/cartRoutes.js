const express = require('express');
const checkAuth = require('../middlewares/authMiddleware');
const { addToCart, getCart ,updateCart,removeFromCart } = require('../controllers/cartController');

const router = express.Router();

router.get('/', checkAuth, getCart);
router.post('/', checkAuth, addToCart);
router.patch('/update', checkAuth, updateCart);
router.patch('/remove',checkAuth, removeFromCart);


module.exports = router;
