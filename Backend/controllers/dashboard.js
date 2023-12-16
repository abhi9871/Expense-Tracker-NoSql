const Expense = require('../models/expense');

// Show dashboard to the user
exports.showDashboard = async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user._id });
        res.status(200).json({ success: true, data: expenses });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
    }
}