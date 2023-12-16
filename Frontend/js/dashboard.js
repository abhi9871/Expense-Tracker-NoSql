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

const token = localStorage.getItem('token');

// Decoding a token to obtain user's information whether he/she is a premium user or not
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

async function showDashboard() {
    try {
        const response = await axios.get("http://localhost:5000/expense/dashboard", { headers: { Authorization: token } });
        if (response.data.success) {
          const expenses = response.data.data;
          // Group and sum expenses by category
          const aggregatedExpenses = expenses.reduce((acc, expense) => {
            if (!acc[expense.category]) {
                acc[expense.category] = 0;
            }
            acc[expense.category] += expense.amount;
            return acc;
        }, {});
          const ctx = document.getElementById("myChart").getContext("2d");
          new Chart(ctx, {
            type: "bar",
            data: {
              labels: Object.keys(aggregatedExpenses),
              datasets: [
                {
                  label: "Expenses",
                  data: Object.values(aggregatedExpenses),
                  backgroundColor: [
                    "rgb(255, 99, 132)",
                    "rgb(54, 162, 235)",
                    "rgb(255, 205, 86)",
                    "rgb(75, 192, 192)",
                    "rgb(153, 102, 255)",
                  ],
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              legend: {
                display: false,
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
              plugins: {
                title: {
                  display: true,
                  text: "Expense Breakdown",
                  font: {
                    size: 24,
                },
                },
              },
              animation: {
                duration: 2000, // Set the duration of the animation in milliseconds
                easing: "easeOutQuart", // Choose an easing function (e.g., linear, easeOutQuart, easeInOutSine, etc.)
              },
            },
          });
        }
        toastr.info(`Your dashboard is ready...<span>&#128516</span>`, 'Hey user');
      } catch (err) {
        console.log(err);
          toastr.error("An error occurred while showing the dashboard.");
      }
}

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

window.addEventListener("DOMContentLoaded", async () => {
    const decodedToken = parseJwt(token);
    let isPremiumUser = decodedToken.isPremiumUser;
    //Check whether an user is a premium user or not on reload
    showPremiumUser(isPremiumUser);
    await showDashboard();
});
