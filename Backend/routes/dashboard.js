const express = require('express');
const dashboardController = require('../controllers/dashboard');
const userAuthentication = require('../middleware/auth');

const router = express.Router();

// Show dashboard route
router.get('/dashboard', userAuthentication.authenticate, dashboardController.showDashboard);

module.exports = router;