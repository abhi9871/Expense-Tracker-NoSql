const express = require('express');
const forgotPasswordController = require('../controllers/resetpassword');
const router = express.Router();

// Forgot Password route
router.post('/forgotPassword', forgotPasswordController.forgotPassword);

// Show Reset Password page route
router.get('/resetpassword/:requestId', forgotPasswordController.resetPasswordPage);

// Reset Password route
router.post('/updatepassword/:requestId', forgotPasswordController.updatePassword);

module.exports = router;