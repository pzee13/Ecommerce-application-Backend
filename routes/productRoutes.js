const express = require('express');
const { createProduct, getAllProducts, updateProduct, deleteProduct } = require('../controllers/productController');
const checkAuth = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/', getAllProducts);
router.post('/', checkAuth, checkRole('admin'), createProduct);
router.put('/:id', checkAuth, checkRole('admin'), updateProduct);
router.delete('/:id', checkAuth, checkRole('admin'), deleteProduct);


module.exports = router;
