let passwordInput = document.getElementById('password');
let confirmPasswordInput = document.getElementById('password-confirm');
let passwordLengthMsg = document.getElementById('passwordLengthMessage');
// let submitButton = document.getElementById("submitButton");

passwordInput.addEventListener('input', checkPasswordLength); // checks the length when user enters the password

// Check password length
function checkPasswordLength() {
    let password = passwordInput.value;
    if(password.length < 8 && password.length > 0){
        passwordLengthMsg.textContent = 'Password must be atleast 8 characters long';
    }
    else {
        passwordLengthMsg.textContent = '';
    }
}

// Check both the password fields to verify that user has entered the correct value or not

confirmPasswordInput.addEventListener('input', confirmPassword);

function confirmPassword() {
    let password = passwordInput.value;
    let confirmPwd = confirmPasswordInput.value;
    if(password !== confirmPwd && confirmPwd !== ''){
        confirmPasswordMessage.textContent = 'Password must be the same';
    }
    else {
        confirmPasswordMessage.textContent = '';
    }
}


