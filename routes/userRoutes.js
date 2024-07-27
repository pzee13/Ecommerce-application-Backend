const express = require('express');

const { registerUser, loginUser } = require('../controllers/userController');



const router = express.Router();
// Register a new user
router.post('/register', registerUser);

// Log in an existing user
router.post('/login', loginUser);

// Get user profile (protected route)
router.get('/profile');

module.exports = router;
