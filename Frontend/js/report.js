const reportContainer = document.getElementById('report-container');
const token = localStorage.getItem('token');

const dailyDatePicker = document.getElementById('dailyDatePicker');
const weeklyDatePicker = document.getElementById('weeklyDatePicker');
const monthlyDatePicker = document.getElementById('monthlyDatePicker');

const generateDailyReportBtn = document.getElementById('generateDailyReport');
const generateWeeklyReportBtn = document.getElementById('generateWeeklyReport');
const generateMonthlyReportBtn = document.getElementById('generateMonthlyReport');

const dailyDownloadReport = document.getElementById('dailyDownloadReport');
const weeklyDownloadReport = document.getElementById('weeklyDownloadReport');
const monthlyDownloadReport = document.getElementById('monthlyDownloadReport');

// Initialize toastr with configurations
toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }

// Decoding a token to obtain user's information whether he/she is a premium user or not
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Allow only premium users
function allowPremiumFeature() {
    const leaderBoard = document.getElementById('leaderboard');
    leaderBoard.addEventListener('click', (e) => {
        e.preventDefault();
        const decodeToken = parseJwt(token);
        if(decodeToken.isPremiumUser){
            window.location.href = 'http://127.0.0.1:5500/Frontend/html/leaderboard.html';
        } else {
            toastr.warning('You are not a premium user');
        }
    })
}

allowPremiumFeature();

// To check whether it is a premium user or not for downloading the report
function isPremiumMember(token) {
    const decodedToken = parseJwt(token);
    let isPremiumUser = decodedToken.isPremiumUser;
    return isPremiumUser;
}

async function showExpensesOnScreen(data, reportTableBody, reportFooterAmount) {
    try {
       const expenses = data;
       let totalAmount = 0;
       expenses.forEach(expense => {
        const row = document.createElement('tr');
        const dateCell = document.createElement('td');
        const categoryCell = document.createElement('td');
        const descriptionCell = document.createElement('td');
        const amountCell = document.createElement('td');

        // Retrieving the date and store it in a variable
        const expenseCreatedDate = expense.date;

        // Convert the string to a Date object
        const date = new Date(expenseCreatedDate);

        // Get individual components (year, month, day)
        const day = date.getDate();
        const month = date.getMonth() + 1;  // Month is 0-indexed, so we add 1
        const year = date.getFullYear();

        const formattedDate = `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;

        dateCell.textContent = formattedDate;
        categoryCell.textContent = expense.category;
        descriptionCell.textContent = expense.description;
        amountCell.innerHTML = `<span>&#8377;</span>${expense.amount}`;
        totalAmount = totalAmount + Number(expense.amount);

        row.appendChild(dateCell);
        row.appendChild(categoryCell);
        row.appendChild(descriptionCell);
        row.appendChild(amountCell);

        reportTableBody.appendChild(row);
       });
       // Show total amount based on daily, weekly, and monthly at the footer of the table
       reportFooterAmount.textContent = totalAmount;

    } catch (err) {
        console.log(err);
    }
}

// Initialize Flatpickr for each date picker input
flatpickr(dailyDatePicker, {
    dateFormat: 'Y-m-d',
    theme: "dark" 
});

flatpickr(weeklyDatePicker, {
    dateFormat: 'Y-m-d',
    mode: 'range',
    theme: "dark",
    onChange: function(selectedDates, dateStr, instance) {
        if(selectedDates.length > 0){
            const newMinDate = new Date(selectedDates[0]);
            const newMaxDate = new Date(selectedDates[0]);
            newMinDate.setDate(newMinDate.getDate() + (-6));
            newMaxDate.setDate(newMaxDate.getDate() + (6));
            instance.set('minDate', newMinDate);
            instance.set('maxDate', newMaxDate);
        }
    }
});

flatpickr(monthlyDatePicker, {
    plugins: [
        new monthSelectPlugin({
            shorthand: true,   // Use shorthand month names
            dateFormat: "F Y", // Display month and year (e.g., 09.23 for September 2023)
            altFormat: "F Y",  // Display full month name and year (e.g., September 2023)
            theme: "dark"      // Use dark theme (you can change it to "light" if you prefer)
        })
    ]
});

// Attach event listeners for report generation

// Generate daily expense report
generateDailyReportBtn.addEventListener('click', async () => {
try{
    const selectedDate = dailyDatePicker.value;
    const dailyExpenseTable = document.getElementById('daily-expense-table-body');
    const heading = document.getElementById('daily-heading');
    const dailyTable = document.getElementById('daily-table');
    const dailyFooterAmount = document.getElementById('daily-footer-amount');
    if (selectedDate) {
        const dailyReportDate = new Date(selectedDate);
        const response = await axios.post('http://localhost:5000/report/generate-daily-report', { dailyReportDate }, { headers: { "Authorization": token } });
        if(response) {
            dailyExpenseTable.innerHTML = '';
            heading.style.display = 'block';
            dailyTable.style.display = 'table';
            reportContainer.style.display = 'block';
            showExpensesOnScreen(response.data.dailyExpenses, dailyExpenseTable, dailyFooterAmount);
            toastr.info(`Generating daily report for ${selectedDate}`, 'Daily Report');
            dailyDatePicker.value = '';
        }
        else {
            toastr.error(response.data.message);
        }
    }
    else {
        toastr.error('Please first enter the date');
    }
} catch(err) {
    console.log(err);
    toastr.error(err.message);
}
});

// Generate weekly expense report
generateWeeklyReportBtn.addEventListener('click', async () => {
try {
    const selectedWeek = weeklyDatePicker.value;
    const weeklyExpenseTable = document.getElementById('weekly-expense-table-body');
    const heading = document.getElementById('weekly-heading');
    const weeklyTable = document.getElementById('weekly-table');
    const weeklyFooterAmount = document.getElementById('weekly-footer-amount');
    if (selectedWeek) {
        const dates = selectedWeek.split(' to ');
        const weeklyStartDate = new Date(dates[0]);
        const weeklyEndDate = new Date(dates[1]);
        const response = await axios.post('http://localhost:5000/report/generate-weekly-report', { weeklyStartDate, weeklyEndDate }, { headers: { "Authorization": token } });
        if(response) {
            weeklyExpenseTable.innerHTML = '';
            heading.style.display = 'block';
            weeklyTable.style.display = 'table';
            reportContainer.style.display = 'block';
            showExpensesOnScreen(response.data.weeklyExpenses, weeklyExpenseTable, weeklyFooterAmount);
            toastr.info(`Generating weekly report for ${selectedWeek}`, 'Weekly Report');
            weeklyDatePicker.value = '';
        }
        else {
            toastr.error(response.data.message);
        }
    }
    else {
        toastr.error('Please first enter the week');
    }
} catch (err) {
    console.log(err);
    toastr.error(err.message);
}
});

// Convert month to month number
function monthNameToNumber(month) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return months.indexOf(month) + 1;
}

// Generate monthly expense report
generateMonthlyReportBtn.addEventListener('click', async () => {
try {
    const selectedMonth = monthlyDatePicker.value;
    const monthlyExpenseTable = document.getElementById('monthly-expense-table-body');
    const heading = document.getElementById('monthly-heading');
    const monthlyTable = document.getElementById('monthly-table');
    const monthlyFooterAmount = document.getElementById('monthly-footer-amount');
    if (selectedMonth) {
        const month = selectedMonth.split(' ')[0];
        const monthNumber = monthNameToNumber(month);
        const response = await axios.post('http://localhost:5000/report/generate-monthly-report', { monthNumber }, { headers: { "Authorization": token } });
        if(response) {
            monthlyExpenseTable.innerHTML = '';
            heading.style.display = 'block';
            monthlyTable.style.display = 'table';
            reportContainer.style.display = 'block';
            showExpensesOnScreen(response.data.monthlyExpenses, monthlyExpenseTable, monthlyFooterAmount);
            toastr.info(`Generating monthly report for ${selectedMonth}`, 'Monthly Report');
            monthlyDatePicker.value = '';
        }
        else {
            toastr.error(response.data.message);
        }
    }
    else {
        toastr.error('Please first enter the month');
    }
} catch(err) {
    console.log(err);
    toastr.error(err.message);
}
});

// Download daily report 
dailyDownloadReport.addEventListener('click', async () => {
    try {
        const selectedDate = dailyDatePicker.value;
        const isPremiumUser = isPremiumMember(token);
     if(isPremiumUser) {
        if(selectedDate) {
            const dailyReportDate = new Date(selectedDate);
            const response = await axios.post('http://localhost:5000/report/download-report?type=daily', { dailyReportDate }, { headers: { "Authorization": token } });
            const link = document.createElement('a');
            link.setAttribute('href', response.data.downloadLink);
            link.click();
            dailyDatePicker.value = '';
        } else {
            toastr.warning('Please first select the date');
        }
    } else {
        toastr.warning('You are not a premium user');
    }
    } catch (err) {
        console.log(err);
    }
});

// Download weekly report
weeklyDownloadReport.addEventListener('click', async () => {
    try {
        const selectedWeek = weeklyDatePicker.value;
        const isPremiumUser = isPremiumMember(token);
     if(isPremiumUser) {
        if(selectedWeek){
            const dates = selectedWeek.split(' to ');
            const weeklyStartDate = new Date(dates[0]);
            const weeklyEndDate = new Date(dates[1]);
            const response = await axios.post('http://localhost:5000/report/download-report?type=weekly', { weeklyStartDate, weeklyEndDate }, { headers: { "Authorization": token } });
            console.log(response);
            const link = document.createElement('a');
            link.setAttribute('href', response.data.downloadLink);
            link.click();
            weeklyDatePicker.value = '';
        } else {
            toastr.warning('Please first select the week');
        }
     }  else {
        toastr.warning('You are not a premium user');
    }
    } catch (err) {
            console.log(err);
        }
});

// Download monthly report
monthlyDownloadReport.addEventListener('click', async () => {
    try {
        const selectedMonth = monthlyDatePicker.value;
        const isPremiumUser = isPremiumMember(token);
     if(isPremiumUser) {
        if (selectedMonth) {
            const month = selectedMonth.split(' ')[0];
            const monthNumber = monthNameToNumber(month);
            const response = await axios.post('http://localhost:5000/report/download-report?type=monthly', { monthNumber }, { headers: { "Authorization": token } }); 
            const link = document.createElement('a');
            link.setAttribute('href', response.data.downloadLink);
            link.click(); 
            monthlyDatePicker.value = '';
        } else {
            toastr.warning('Please first select the month');
        }
    } else {
        toastr.warning('You are not a premium user')
    }
    } catch (err) {
        console.log(err);
    }
});

// Show premium user tag who purchase premium
function showPremiumUser(isPremiumUser) {
    const purchaseMembershipBtn = document.getElementById("purchase-membership");
    //Check whether an user is a premium user or not
    if(isPremiumUser){
        const message = document.getElementById("premium-msg"); 
        purchaseMembershipBtn.style.display = 'none';
        message.style.display = 'block';
        message.textContent = 'Premium User';
    } else {
        // Checking condition according to the buying premium
        purchaseMembershipBtn.style.display = 'block';
    }
}

// Fetching the user while refreshing the page
window.addEventListener('DOMContentLoaded', async () => {
    const decodedToken = parseJwt(token);
    let isPremiumUser = decodedToken.isPremiumUser;
    // Check whether an user is a premium user or not on reload
    showPremiumUser(isPremiumUser);
});


