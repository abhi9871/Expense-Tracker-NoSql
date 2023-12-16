const Expense = require('../models/expense');
const json2csv = require('json2csv').Parser;
const { S3, PutObjectCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
dotenv.config();

const generateDailyReport = async (req, res) => {
    try {
        const { dailyReportDate } = req.body;
        const dailyExpenses = await Expense.find({ date: dailyReportDate, userId: req.user._id  });
        if(dailyExpenses){
            res.status(200).json({ success: true, dailyExpenses });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error occured while generating daily report' });
        console.log(err);
    }
}

const generateWeeklyReport = async (req, res) => {
    try {
        const { weeklyStartDate, weeklyEndDate } = req.body;
        const weeklyExpenses = await Expense.find({ date: { $gte: weeklyStartDate, $lte: weeklyEndDate }, userId: req.user._id });
        if(weeklyExpenses){
            res.status(200).json({ success: true, weeklyExpenses });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error occured while generating weekly report' });
        console.log(err);
    }
}

const generateMonthlyReport = async (req, res) => {
    try {
        const { monthNumber } = req.body;
        const monthlyExpenses = await Expense.find({
            $expr: {
              $and: [
                { $eq: [{ $month: '$date' }, monthNumber] },
                { $eq: ['$userId', req.user._id] }
              ]
            }
          });
          
        if(monthlyExpenses) {
            res.status(200).json({ success: true, monthlyExpenses });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error occured while generating monthly report' });
        console.log(err);
    }
}

// Function used to find relevant data along with the total amount
const showDataIntoCSV = (expenseReportData) => {
    const reportData = expenseReportData.map(expense => expense.dataValues);
    const totalAmount = reportData.reduce((total, item) => total + item.amount, 0);
    const totalRow = { description: 'Total Amount', amount: totalAmount };
    const finalReport = [...reportData, totalRow];
    return finalReport;
}

// Convert data into csv format
const convertToCSV = (data) => {
    try {
        const parser = new json2csv();
        const csv = parser.parse(data);
        return csv;
    } catch (error) {
        throw error;
    }
}

// Upload to AWS S3
const uploadToS3 = async (data, fileName) => {
        let s3Bucket = new S3({
            region: process.env.AWS_REGION,
            credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });

        let params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: convertToCSV(data),
        };
        try {
            const command = new PutObjectCommand(params);
            const s3response = await s3Bucket.send(command);
            if(s3response.$metadata?.httpStatusCode === 200){
            const location = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
            console.log('File uploaded:', location);
            return location;
            }
        } catch (err) {
            console.error('Something went wrong.', err);
            throw err;
        }
}

// Function for downloading the reports(daily, weekly, and monthly)
const downloadReport = async (req, res) => {
    try {
       const type = req.query.type;
       let expensesReport;
       let filePath;
       if(type === 'daily') {
            const { dailyReportDate } = req.body;
            expensesReport = await Expense.find({ date: dailyReportDate, userId: req.user._id  }).select('date category description amount');
            filePath = `${type}_report_${new Date(dailyReportDate).getDate()}`;
       } else if(type === 'weekly') {
            const { weeklyStartDate, weeklyEndDate } = req.body;
            expensesReport = await Expense.find({ date: { $gte: weeklyStartDate, $lte: weeklyEndDate }, userId: req.user._id }).select('date category description amount');
            filePath = `${type}_report_(${new Date(weeklyStartDate).getDate()}-${new Date(weeklyEndDate).getDate()})`;
       } else {
            const { monthNumber } = req.body;
            expensesReport = await Expense.find({
                $expr: {
                  $and: [
                    { $eq: [{ $month: '$date' }, monthNumber] },
                    { $eq: ['$userId', req.user._id] }
                  ]
                }
              }).select('date category description amount');
            filePath = `${type}_report_${monthNumber}`;
       }
       const report = showDataIntoCSV(expensesReport);
       filePath = `${filePath}_${new Date().getMilliseconds()}.csv`; // Define the file path where the CSV will be saved
       const downloadReportLink = await uploadToS3(report, filePath);
        res.status(200).json({ success: true, downloadLink: downloadReportLink });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error while generating the report'});
    }
}

module.exports = {
    generateDailyReport,
    generateWeeklyReport,
    generateMonthlyReport,
    downloadReport
}