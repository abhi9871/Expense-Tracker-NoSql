// Initialize Toastr options
toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-center",
    "preventDuplicates": false,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }

const forgotPasswordForm = document.getElementById('forgotpassword-form');

forgotPasswordForm.addEventListener('submit', forgotPassword);

async function forgotPassword(e) {
    e.preventDefault();
    try{
    const email = document.getElementById('emailInput');
    const response = await axios.post('http://localhost:5000/password/forgotpassword', { email: email.value });
    if(response.data.success) {
        forgotPasswordForm.reset();
        toastr.info(response.data.message, 'Reset Link');
        setTimeout(() => {
            window.location.href = 'http://127.0.0.1:5500/Frontend/html/login.html';
        }, 2000)
    }
 } catch(err) {
    if(!err.response.data.success){
        toastr.error(err.response.data.message);
    }
    console.log(err);
 }
}

