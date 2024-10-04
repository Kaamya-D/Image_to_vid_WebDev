const form = document.getElementById('form')
const firstname_input = document.getElementById('firstname-input')
const email_input = document.getElementById('email-input')
const password_input = document.getElementById('password-input')
const repeat_password_input = document.getElementById('repeat-password-input') // corrected this line
const error_message = document.getElementById('error-message')

form.addEventListener('submit', (e) => {
    // Clear all existing error styles
    clearErrors();

    let errors = []

    if (firstname_input) {
        errors = getSignup_Form_Errors(firstname_input.value, email_input.value, password_input.value, repeat_password_input.value)
    } else {
        errors = getLogin_Form_Errors(email_input.value, password_input.value)
    }

    if (errors.length > 0) {
        e.preventDefault();
        error_message.innerHTML = "<ul><li>" + errors.join("</li><li>") + "</li></ul>";
    }
    
})

function getSignup_Form_Errors(firstname, email, password, repeat_password) {
    let errors = []

    if (firstname === '' || firstname == null) {
        errors.push('Firstname is necessary')
        firstname_input.parentElement.classList.add('incorrect')
    }

    if (email === '' || email == null) {
        errors.push('Email is necessary')
        email_input.parentElement.classList.add('incorrect')
    }

    if (password === '' || password == null) {
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
    }
    if(password.length < 8){
        errors.push('Password must contain atleast 8 characters')
        password_input.parentElement.classList.add('incorrect')
    }
    if (password !== repeat_password) {
        errors.push('Passwords do not match')
        repeat_password_input.parentElement.classList.add('incorrect')
    }

    return errors
}

function getLogin_Form_Errors(email, password){
    let errors = []
    if (email === '' || email == null) {
        errors.push('Email is necessary')
        email_input.parentElement.classList.add('incorrect')
    }

    if (password === '' || password == null) {
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
    }
    return errors
}

const allInputs  = [firstname_input, email_input, password_input, repeat_password_input].filter(input => input != null)

allInputs.forEach(input => {
    input.addEventListener('input', () => {
        if(input.parentElement.classList.contains('incorrect')) {
            input.parentElement.classList.remove('incorrect');
            error_message.innerText = ''; // This clears the error messages on any input change
        }
    });
});


function clearErrors() {
    document.querySelectorAll('.incorrect').forEach((element) => {
        element.classList.remove('incorrect')
    })
}

