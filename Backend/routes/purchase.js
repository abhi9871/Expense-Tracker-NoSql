const express = require('express');
const purchaseController = require('../controllers/purchase');
const userAuthentication = require('../middleware/auth');
const router = express.Router();

// Premium purchase route
router.get('/premiummembership', userAuthentication.authenticate, purchaseController.purchasePremium);

// Update transaction status route
router.post('/updatetransactionstatus', userAuthentication.authenticate, purchaseController.updateTransactionStatus);

module.exports = router;