const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();

// Create user signup 
router.post('/signup', userController.createUser);

// Login user route
router.post('/login', userController.loginUser);

module.exports = router;