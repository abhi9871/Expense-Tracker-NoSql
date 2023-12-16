const express = require('express');
const leaderBoardController = require('../controllers/leaderboard');
const userAuthentication = require('../middleware/auth');
const router = express.Router();

// Premium purchase route
router.get('/leaderboard', userAuthentication.authenticate, leaderBoardController.getLeaderBoard);

module.exports = router;