const expenseForm = document.getElementById('expense-form');
const expenseTableBody = document.getElementById('expense-table-body');
const expenseBtn = document.getElementById('expense-btn');
let isEdit = false; // Flag to check whether the expense needs to update or not.
const token = localStorage.getItem('token');
let recordLimit = document.getElementById('records');

// Initialize Toastr options
toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: false,
    progressBar: true,
    positionClass: "toast-top-right",
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "5000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut"
};

    // To show success notification when user successfully login
    const isAuthenticated = JSON.parse(localStorage.getItem('isAuthenticated')); // To convert localstorage string value to boolean
    if(isAuthenticated){
        toastr.success('Login Successful');
        localStorage.setItem('isAuthenticated', false);
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

// Add an event listener to the form
expenseForm.addEventListener('submit', submitExpenseDetails);

 function submitExpenseDetails(e) {
    e.preventDefault(); // Prevent form submission to avoid page refresh
    const category = document.getElementById('category');
    const description = document.getElementById('description');
    const amount = document.getElementById('amount');

    // Expense details object
    const expenseDetails = {
        category: category.value,
        description: description.value,
        amount: amount.value
    }

        if(isEdit){
            const expenseId = expenseForm.getAttribute('expense-id');
            const tr = document.getElementById(expenseId);
            tr.children[1].textContent = expenseDetails.category;
            tr.children[2].textContent = expenseDetails.description;
            tr.children[3].innerHTML = `<span>&#8377;</span>${expenseDetails.amount}`;
            updateExpense(expenseId, expenseDetails);
        }
        else{
            addExpense(expenseDetails);
        }
        expenseForm.reset();
}

// Show expense details on user screen
function expenseDetailsOnScreen(expenseData) {

    // Creating a dynamic table data to show 
    const tr = document.createElement('tr');

    // Set an id attribute for tr element
    tr.setAttribute('id', expenseData._id);

    const dateCell = document.createElement('td');
    const categoryCell = document.createElement('td');
    const descriptionCell = document.createElement('td');
    const amountCell = document.createElement('td');
    const actionBtns = document.createElement('td');

    // Convert the string to a Date object
    const date = new Date(expenseData.date);

    // Get individual components (year, month, day)
    const day = date.getDate();
    const month = date.getMonth() + 1;  // Month is 0-indexed, so we add 1
    const year = date.getFullYear();

    const formattedDate = `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;

    dateCell.textContent = formattedDate;
    categoryCell.textContent = expenseData.category;
    descriptionCell.textContent = expenseData.description;
    amountCell.innerHTML = `<span>&#8377;</span>${expenseData.amount}`;

    // Create an edit icon to update the expense
    const editIcon = document.createElement('i');
    editIcon.className = 'bi bi-pencil-square table-heading p-2';
    editIcon.style.cursor = 'pointer';
    actionBtns.appendChild(editIcon);

    // Add an event listener to the editIcon for editing the expense
    editIcon.addEventListener('click', (e) => {
        const tr = e.target.parentElement.parentElement;
        const expenseId = tr.getAttribute('id');
        expenseForm.setAttribute('expense-id', expenseId);
        getExpense(expenseId);
    })

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'bi bi-trash table-heading mx-2';
    deleteIcon.style.cursor = 'pointer';
    actionBtns.appendChild(deleteIcon);

    // Add an event listener to the deleteIcon for deleting the expense
    deleteIcon.addEventListener('click', (e) => {
        const tr = e.target.parentElement.parentElement;
        const expenseId = tr.getAttribute('id');
        expenseTableBody.removeChild(tr);
        deleteExpense(expenseId);
    })

    tr.appendChild(dateCell);
    tr.appendChild(categoryCell);
    tr.appendChild(descriptionCell);
    tr.appendChild(amountCell);
    tr.appendChild(actionBtns);

    expenseTableBody.appendChild(tr);
}

// Choose no. of records limit for a page
function handleSelectChange() {
    const selectedValue = recordLimit.value;
    return Number(selectedValue);
}

recordLimit.addEventListener('change', () => {
    const noOfRecords = handleSelectChange();
    localStorage.setItem('limit', noOfRecords);
    localStorage.setItem('currentPage', 1);  // Set current page while choosing no. of records per page
    const currentPage = Number(localStorage.getItem('currentPage'));
    getExpenses(currentPage, noOfRecords);
});

// Returns limit for each page
function noOfRecordsPerPage() {
    const limit = localStorage.getItem('limit');
    const limitPerPage = (limit !== null) ? Number(limit) : 5;
    return limitPerPage;
}

// Return page number
function pageNumber(expensesCount) {
    const limit = noOfRecordsPerPage();
    return Math.ceil(expensesCount/limit);
}

//Show pagination
function showPagination(expensesCount) {
    const totalPagesBtn = pageNumber(expensesCount);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';
    const limit = noOfRecordsPerPage();
    for(let i = 1; i <= totalPagesBtn; i++){
        const btn = document.createElement('button');
        btn.className='btn btn-light btn-sm m-1'
        btn.setAttribute('id', i);
        btn.textContent = i;
        btn.addEventListener('click', () => {
            localStorage.setItem('currentPage', i);
            getExpenses(i, limit);   
        });
        paginationContainer.appendChild(btn);
}
}

// Create an expense function
async function addExpense(expenseDataObj) {
    try{
        const response = await axios.post('http://localhost:5000/expense/add-expense', expenseDataObj, { headers: { "Authorization": token }});
        if(response.data.success){
            const expenseData = response.data.data;
            const expensesCount = response.data.expensesCount;
            const pageNo = localStorage.getItem('currentPage');
            const limit = noOfRecordsPerPage();
            if(pageNo * limit < expensesCount){
                expenseTableBody.innerHTML = '';
                getExpenses(pageNo, limit);
            }
            else {
                expenseDetailsOnScreen(expenseData);
                getExpenses(pageNo, limit);
            }
        }
    } catch(err) {
        console.log(err);
        if (err.response && err.response.data && err.response.data.success === false) {
            const errorMessage = err.response.data.message;
            toastr.error(errorMessage);
        }
    }
}

async function getExpense(expenseId) {
    try{
        const response = await axios.get(`http://localhost:5000/expense/get-expense/${expenseId}`, { headers: { "Authorization": token } });
        if(response.data.success){
            isEdit = true;
            const expense = response.data.data;
            const category = document.getElementById('category');
            const description = document.getElementById('description');
            const amount = document.getElementById('amount');
            category.value = expense.category;
            description.value = expense.description;
            amount.value = expense.amount;

            //Changing the button value add to update expense
            expenseBtn.textContent = 'Update Expense';
        }   
    } catch(err) {
        const error = err.response.data.message;
        toastr.error(error);
        console.log(err);
    }
}

// Get all the expenses function
async function getExpenses(pageNumber, limit) {
    try{
        const response = await axios.get(`http://localhost:5000/expense/get-expenses?page=${pageNumber}&limit=${limit}`, { headers: { "Authorization": token } });
        if(response.data.success){
            const expenseData = response.data.rows;
            expenseTableBody.innerHTML = '';
            expenseData.forEach((expense) => {
                expenseDetailsOnScreen(expense);
            });

            showPagination(response.data.totalCount);
        }   
    } catch(err) {
        console.log(err);
        if (err.response && err.response.data && err.response.data.success === false) {
            const errorMessage = err.response.data.message;
            toastr.error(errorMessage);
        } else {
            // Handle other errors (e.g., network errors) or provide a generic error message.
            toastr.error("An error occurred while fetching data.");
        }
    }
}

// Update an expense function
async function updateExpense(expenseId, expenseData) {
    try{
        const response = await axios.put(`http://localhost:5000/expense/edit-expense/${expenseId}`, expenseData, { headers: { "Authorization": `${token}` }});
        if(response.data.success){
            const expenseData = response.data;
            toastr.success(expenseData.message);
            isEdit = false;
            if(!isEdit)
                expenseBtn.textContent = 'Add Expense';
        }     
    } catch(err) {
        const error = err.response.data.message;
        toastr.error(error);
        console.log(err);
    }
}

// Delete an expense function
async function deleteExpense(expenseId) {
    try{
        const response = await axios.delete(`http://localhost:5000/expense/delete-expense/${expenseId}`, { headers: { "Authorization": `${token}` }});
        if(response.data.success){
            const expensesCount = response.data.countExpenses;
            const pageNo = pageNumber(expensesCount);
            const currentPage = localStorage.getItem('currentPage');
            const limit = noOfRecordsPerPage();
             if(expensesCount % limit === 0){
                getExpenses(pageNo, limit);
            }
            else {
                getExpenses(currentPage, limit);
            }
            toastr.success(response.data.message);
        }
    } catch(err) {
        if (err.response && err.response.data && err.response.data.success === false) {
            // The error response contains a 'success' property set to 'false'.
            const errorMessage = err.response.data.message;
            toastr.error(errorMessage);
        } else {
            // Handle other errors (e.g., network errors) or provide a generic error message.
            toastr.error("An error occurred while deleting data.");
        }
        console.log(err);
    }
}

// Show premium user tag who purchase premium
function showPremiumUser(isPremiumUser) {
    //Check whether an user is a premium user or not
    if(isPremiumUser){
        const purchaseMembershipBtn = document.getElementById("purchase-membership");
        const message = document.getElementById("premium-msg"); 
        purchaseMembershipBtn.style.display = 'none';
        message.style.display = 'block';
        message.textContent = 'Premium User';
    } else {
        // Checking condition according to the buying premium
        purchaseMembershipBtn.style.display = 'block';
    }
}

// Fetching the data while refreshing the page
window.addEventListener('DOMContentLoaded', () => {
    const decodedToken = parseJwt(token);
    let isPremiumUser = decodedToken.isPremiumUser;
    //Check whether an user is a premium user or not on reload
    showPremiumUser(isPremiumUser);

    // Fetching the data on screen reload along with the record per page
    const limit = Number(recordLimit.value);
    localStorage.setItem('currentPage', 1); // When someone add expense first time in that case default page will be 1
    localStorage.setItem('limit', limit);
    const currentPage = Number(localStorage.getItem('currentPage'));
    getExpenses(currentPage, limit);
});
