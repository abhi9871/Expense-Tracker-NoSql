const express = require('express');
const expenseController = require('../controllers/expense');
const userAuthentication = require('../middleware/auth');
const router = express.Router();

// Create an expense route
router.post('/add-expense', userAuthentication.authenticate, expenseController.addExpense);

// Get all the expenses by the user id route
router.get('/get-expenses', userAuthentication.authenticate, expenseController.getExpenses);

// Get an expense by the expense id
router.get('/get-expense/:expenseId', userAuthentication.authenticate, expenseController.getExpense);

// Edit an expense by the expense id route
router.put('/edit-expense/:expenseId', userAuthentication.authenticate, expenseController.editExpenseById);

// Delete an expense by the expense id route
router.delete('/delete-expense/:expenseId', userAuthentication.authenticate, expenseController.deleteExpenseById);

module.exports = router;