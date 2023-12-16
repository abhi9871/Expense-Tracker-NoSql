const mongoose = require('mongoose');
const Expense = require('../models/expense');
const User = require('../models/user');

// Update the user's totalExpenses in the database
async function updateUserTotalExpenses(userId, amount, session) {
    try{
    const user = await User.findById(userId).session(session);
    if (user) {
        user.totalExpenses += Number(amount);
        await user.save(); // Save the updated user
    }
 } catch(err) {
    throw new Error('Error while updating the total expenses');
 }
}

// Count no. of expenses
async function expensesCount(userId) {
    try {
        const count = await Expense.countDocuments({ userId: userId });
        return count;
    } catch (err) {
        throw new Error(err.message);
    }
}

// Create an expense with the transaction
exports.addExpense = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const userId = req.user ? req.user._id : null;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const { category, description, amount } = req.body;

        // Add expense to the expense table
        const expense = new Expense({
            category: category,
            description: description,
            amount: amount,
            userId: userId
        });

        await expense.save({ session });

        // Count no.of expenses
        const countExpenses = await expensesCount(userId);

        // Update user total expenses in the database as well with the same transaction
        await updateUserTotalExpenses(userId, amount, session);

        // Commit the transaction if everything is successful
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ success: true, data: expense, expensesCount: countExpenses });
    } catch (err) {
            // Rollback the transaction if an error occurs
            await session.abortTransaction();
            session.endSession();

            console.log(err);
            res.status(500).json({ success: false, message: 'An error occured while creating expense' });
    }
};

// Get all the expenses for a particular user
exports.getExpenses = async (req, res) => {
    try {
       const page = Number(req.query.page) || 1;
       const limit = Number(req.query.limit) || 5;
       let skip;

       // Check for the valid page number and it should be greater than 0
       if(!Number.isNaN(page) && page > 0) {
            skip = (page - 1) * limit;
       }

       // Find expenses for the specified user with pagination
       const expenses = await Expense.find({ userId: req.user._id }).skip(skip).limit(limit);
       const totalCount = await Expense.countDocuments({ userId: req.user._id });
       res.status(200).json({ success: true, rows: expenses, totalCount });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'An error occurred while fetching expenses.' });
    }
};

// Get an expense details for a particular expense id
exports.getExpense = async (req, res) => {
    try {
        const expenseId = req.params.expenseId;
        const expense = await Expense.findById(expenseId);
        // Check for authenticated user
        if(req.user._id.equals(expense.userId)){
            if (!expense) {
                return res.status(404).json({ success: false, message: 'Expense not found' });
            }
            res.status(200).json({ success: true, data: expense });
        } else {
            return res.status(401).json({ success: false, message: 'Unauthenticated user' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'An error occurred while fetching expenses.' });
    }
}

// Update an expense by the expense id
exports.editExpenseById = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const expenseId = req.params.expenseId;
        const { category, description, amount } = req.body;

        const expense = await Expense.findById(expenseId).session(session);

        // Check for authenticated user
        if(req.user._id.equals(expense.userId)){
            // Check if the expense exists or not
            if (!expense) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ success: false, message: 'Expense not found' });
            }

           // Update user total expenses in the database as well with the same transaction
            let updatedAmount = amount - expense.amount;
            await updateUserTotalExpenses(expense.userId, updatedAmount, session);
            
            // Update the expense properties
            expense.category = category;
            expense.description = description;
            expense.amount = amount;

            // Save the updated expense
            const updatedExpense = await expense.save();

            // Commit the transaction if everything is successful
            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ success: true, message: 'Expense has been updated', data: updatedExpense });
        } else {
            // Rollback the transaction if an error occurs
            await session.abortTransaction();
            session.endSession();
            return res.status(401).json({ success: false, message: 'Unauthenticated user' });
        }
    } catch (err) {
        // Rollback the transaction if an error occurs
        await session.abortTransaction();
        session.endSession();
        console.log(err);
        res.status(500).json({ success: false, message: 'An error occured while updating expense' });
    }
};

// Delete an expense by the expense id
exports.deleteExpenseById = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let t; // Declare a transaction variable
        const expenseId = req.params.expenseId;
        const userId = req.user ? req.user._id : null;

        const expense = await Expense.findById(expenseId).session(session);

        // Check for authenticated user
        if(req.user._id.equals(expense.userId)){
            // Check if the expense exists or not
            if (!expense) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ success: false, message: 'Expense not found' });
            }
            
            // Update user total expenses in the database as well with the same transaction
            const amount = -expense.amount;
            await updateUserTotalExpenses(expense.userId, amount, session);

            // Delete the expense
            await expense.deleteOne();

            // Commit the transaction if everything is successful
            await session.commitTransaction();
            session.endSession();

            // Count no.of expenses
            const countExpenses = await expensesCount(userId);

            res.status(200).json({ success: true, countExpenses, message: 'Expense has been deleted' });
        } else {
            // Rollback the transaction if an error occurs
            await session.abortTransaction();
            session.endSession();
            return res.status(401).json({ success: false, message: 'Unauthenticated user' });
        }
    } catch (err) {
            // Rollback the transaction if an error occurs
            await session.abortTransaction();
            session.endSession();
            console.log(err);
            res.status(500).json({ success: false, message: 'An error occured while deleting expense' });
    }
};