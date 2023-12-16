const leaderBoardData = document.getElementById('leaderboard-table-body');
const token = localStorage.getItem('token');

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

// Decoding a token to obtain user's information whether he/she is a premium user or not
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

async function getLeaderBoardData() {
    try {
        const response = await axios.get('http://localhost:5000/premium/leaderboard', { headers: { "Authorization": token } });
        const leaderBoardDetails = response.data.usersWithExpenses
        leaderBoardDetails.forEach((item, index) => {
            item.totalExpenses = (!item.totalExpenses) ? 0 : item.totalExpenses;
            const row = document.createElement('tr');
            const rankCell = document.createElement('td');
            rankCell.textContent = index + 1;
            row.appendChild(rankCell);
      
            const nameCell = document.createElement('td');
            nameCell.textContent = item.name;
            row.appendChild(nameCell);
      
            const expensesCell = document.createElement('td');
            expensesCell.innerHTML = `<span>&#8377;</span>${item.totalExpenses}`;
            row.appendChild(expensesCell);
      
            leaderBoardData.appendChild(row);
          });
    } catch (error) {
            if(!error.response.success){
                console.error('Error fetching leaderboard data:', error);
                toastr.error(error.response.message);
            }
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
window.addEventListener('DOMContentLoaded', async () => {
    const decodedToken = parseJwt(token);
    let isPremiumUser = decodedToken.isPremiumUser;
    //Check whether an user is a premium user or not on reload
    showPremiumUser(isPremiumUser);
    await getLeaderBoardData();
});