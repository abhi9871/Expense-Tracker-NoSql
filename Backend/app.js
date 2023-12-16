const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();    // To use env file variables
const port = process.env.PORT;
const app = express();

// Set the view engine to EJS. Configures Express to use the EJS template engine for rendering views
app.set('view engine', 'ejs');
app.set('views', 'views');  // Shows where ejs templates are located

const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const leaderboardRoutes = require('./routes/leaderboard');
const resetPasswordRoutes = require('./routes/resetpassword');
const reportRoutes = require('./routes/report');
const dashboardRoute = require('./routes/dashboard');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', leaderboardRoutes);
app.use('/password', resetPasswordRoutes);
app.use('/report', reportRoutes);
app.use('/expense', dashboardRoute);

mongoose.connect(process.env.MONGODB)
.then(() => {
    console.log(`Server is starting at ${port}`);
    app.listen(port || 3000);
})
.catch(err => {
    console.log(err);
})