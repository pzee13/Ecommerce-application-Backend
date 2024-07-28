const express = require('express');

const { registerUser, loginUser,logoutUser } = require('../controllers/userController');
const checkAuth = require('../middlewares/authMiddleware');


const router = express.Router();
// Register a new user
router.post('/register', registerUser);

// Log in an existing user
router.post('/login', loginUser);

router.post('/logout',checkAuth, logoutUser);

// Get user profile (protected route)
router.get('/profile');

module.exports = router;
