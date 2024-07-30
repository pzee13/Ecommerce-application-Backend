const express = require('express');

const { registerUser, loginUser, logoutUser } = require('../controllers/userController');
const { getAllSessions } = require('../controllers/sessionController')
const checkAuth = require('../middlewares/authMiddleware');


const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);



router.post('/logout',checkAuth, logoutUser);


router.get('/sessions',checkAuth, getAllSessions);

module.exports = router;
