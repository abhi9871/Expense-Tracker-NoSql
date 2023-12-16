const express = require('express');
const authController = require('../middleware/auth');
const reportController = require('../controllers/report');
const router = express.Router();

// Generate Daily Report Route
router.post('/generate-daily-report', authController.authenticate, reportController.generateDailyReport);

// Generate Weekly Report Route
router.post('/generate-weekly-report', authController.authenticate, reportController.generateWeeklyReport);

// Generate Monthly Report Route
router.post('/generate-monthly-report', authController.authenticate, reportController.generateMonthlyReport);

// Download Report Route
router.post('/download-report', authController.authenticate, reportController.downloadReport);

module.exports = router;