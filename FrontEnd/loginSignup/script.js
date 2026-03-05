// API base URL
const API_URL = 'https://null-xsgo.onrender.com/api';

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginCard = document.getElementById('loginCard');
const signupCard = document.getElementById('signupCard');
const loginToggle = document.getElementById('loginToggle');
const signupToggle = document.getElementById('signupToggle');

// Login form elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const loginSuccessMessage = document.getElementById('loginSuccessMessage');
const rememberCheckbox = document.getElementById('remember');

// Signup form elements
const signupNameInput = document.getElementById('signupName');
const signupEmailInput = document.getElementById('signupEmail');
const signupPasswordInput = document.getElementById('signupPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const toggleSignupPasswordBtn = document.getElementById('toggleSignupPassword');
const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
const nameError = document.getElementById('nameError');
const signupEmailError = document.getElementById('signupEmailError');
const signupPasswordError = document.getElementById('signupPasswordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const signupSuccessMessage = document.getElementById('signupSuccessMessage');
const termsCheckbox = document.getElementById('terms');

// Toggle between login and signup
function showLoginCard() {
    loginCard.classList.add('active');
    signupCard.classList.remove('active');
    loginToggle.classList.add('active');
    signupToggle.classList.remove('active');
}

function showSignupCard() {
    signupCard.classList.add('active');
    loginCard.classList.remove('active');
    signupToggle.classList.add('active');
    loginToggle.classList.remove('active');
}

loginToggle.addEventListener('click', showLoginCard);
signupToggle.addEventListener('click', showSignupCard);

// Quick toggle links
document.querySelectorAll('.switch-to-signup').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showSignupCard();
    });
});

document.querySelectorAll('.switch-to-login').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginCard();
    });
});

// Password visibility toggle functions
function setupPasswordToggle(inputElement, toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        const type = inputElement.getAttribute('type') === 'password' ? 'text' : 'password';
        inputElement.setAttribute('type', type);
        toggleBtn.querySelector('.eye-icon').textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });
}

setupPasswordToggle(passwordInput, togglePasswordBtn);
setupPasswordToggle(signupPasswordInput, toggleSignupPasswordBtn);
setupPasswordToggle(confirmPasswordInput, toggleConfirmPasswordBtn);

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Name validation
function validateName(name) {
    return name.trim().length >= 2;
}

// Password validation
function validatePassword(password) {
    return password.length >= 6;
}

// Real-time email validation
emailInput.addEventListener('blur', () => {
    if (emailInput.value.trim() === '') {
        emailError.textContent = 'Email is required';
    } else if (!validateEmail(emailInput.value)) {
        emailError.textContent = 'Please enter a valid email address';
    } else {
        emailError.textContent = '';
    }
});

// Real-time password validation
passwordInput.addEventListener('blur', () => {
    if (passwordInput.value.trim() === '') {
        passwordError.textContent = 'Password is required';
    } else if (passwordInput.value.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters';
    } else {
        passwordError.textContent = '';
    }
});

// Clear errors on input
emailInput.addEventListener('input', () => {
    if (emailError.textContent) {
        emailError.textContent = '';
    }
});

passwordInput.addEventListener('input', () => {
    if (passwordError.textContent) {
        passwordError.textContent = '';
    }
});

// Signup form real-time validation
signupNameInput.addEventListener('blur', () => {
    if (signupNameInput.value.trim() === '') {
        nameError.textContent = 'Name is required';
    } else if (!validateName(signupNameInput.value)) {
        nameError.textContent = 'Name must be at least 2 characters';
    } else {
        nameError.textContent = '';
    }
});

signupNameInput.addEventListener('input', () => {
    if (nameError.textContent) {
        nameError.textContent = '';
    }
});

signupEmailInput.addEventListener('blur', () => {
    if (signupEmailInput.value.trim() === '') {
        signupEmailError.textContent = 'Email is required';
    } else if (!validateEmail(signupEmailInput.value)) {
        signupEmailError.textContent = 'Please enter a valid email address';
    } else {
        signupEmailError.textContent = '';
    }
});

signupEmailInput.addEventListener('input', () => {
    if (signupEmailError.textContent) {
        signupEmailError.textContent = '';
    }
});

signupPasswordInput.addEventListener('blur', () => {
    if (signupPasswordInput.value.trim() === '') {
        signupPasswordError.textContent = 'Password is required';
    } else if (!validatePassword(signupPasswordInput.value)) {
        signupPasswordError.textContent = 'Password must be at least 6 characters';
    } else {
        signupPasswordError.textContent = '';
    }
});

signupPasswordInput.addEventListener('input', () => {
    if (signupPasswordError.textContent) {
        signupPasswordError.textContent = '';
    }
});

confirmPasswordInput.addEventListener('blur', () => {
    if (confirmPasswordInput.value.trim() === '') {
        confirmPasswordError.textContent = 'Please confirm your password';
    } else if (signupPasswordInput.value !== confirmPasswordInput.value) {
        confirmPasswordError.textContent = 'Passwords do not match';
    } else {
        confirmPasswordError.textContent = '';
    }
});

confirmPasswordInput.addEventListener('input', () => {
    if (confirmPasswordError.textContent) {
        confirmPasswordError.textContent = '';
    }
});

// Form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear previous messages
    loginSuccessMessage.textContent = '';
    loginSuccessMessage.classList.remove('show');
    emailError.textContent = '';
    passwordError.textContent = '';

    // Validate fields
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    let isValid = true;

    if (email === '') {
        emailError.textContent = 'Email is required';
        isValid = false;
    } else if (!validateEmail(email)) {
        emailError.textContent = 'Please enter a valid email address';
        isValid = false;
    }

    if (password === '') {
        passwordError.textContent = 'Password is required';
        isValid = false;
    } else if (password.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters';
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    // Disable submit button
    const submitButton = loginForm.querySelector('.login-button');
    submitButton.disabled = true;
    submitButton.textContent = 'Signing in...';

    // Send login request via AJAX
    fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Save user info to localStorage
            localStorage.setItem('user', JSON.stringify(data.data));
            if (rememberCheckbox.checked) {
                localStorage.setItem('rememberedEmail', email);
            }

            // Show success message
            loginSuccessMessage.textContent = `Welcome back, ${data.data.name}! Redirecting...`;
            loginSuccessMessage.classList.add('show');

            // Redirect to blog home after 2 seconds
            setTimeout(() => {
                window.location.href = '../blog/blogHome.html';
            }, 1500);
        } else {
            // Show error message
            emailError.textContent = data.message || 'Login failed';
            submitButton.disabled = false;
            submitButton.textContent = 'Sign In';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        emailError.textContent = 'Error connecting to server: ' + error.message;
        submitButton.disabled = false;
        submitButton.textContent = 'Sign In';
    });
});

// Signup form submission
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear previous messages
    signupSuccessMessage.textContent = '';
    signupSuccessMessage.classList.remove('show');
    nameError.textContent = '';
    signupEmailError.textContent = '';
    signupPasswordError.textContent = '';
    confirmPasswordError.textContent = '';

    // Validate fields
    const name = signupNameInput.value.trim();
    const email = signupEmailInput.value.trim();
    const password = signupPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    let isValid = true;

    if (name === '') {
        nameError.textContent = 'Name is required';
        isValid = false;
    } else if (!validateName(name)) {
        nameError.textContent = 'Name must be at least 2 characters';
        isValid = false;
    }

    if (email === '') {
        signupEmailError.textContent = 'Email is required';
        isValid = false;
    } else if (!validateEmail(email)) {
        signupEmailError.textContent = 'Please enter a valid email address';
        isValid = false;
    }

    if (password === '') {
        signupPasswordError.textContent = 'Password is required';
        isValid = false;
    } else if (!validatePassword(password)) {
        signupPasswordError.textContent = 'Password must be at least 6 characters';
        isValid = false;
    }

    if (confirmPassword === '') {
        confirmPasswordError.textContent = 'Please confirm your password';
        isValid = false;
    } else if (password !== confirmPassword) {
        confirmPasswordError.textContent = 'Passwords do not match';
        isValid = false;
    }

    if (!termsCheckbox.checked) {
        alert('You must accept the terms and conditions');
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    // Disable submit button
    const submitButton = signupForm.querySelector('.login-button');
    submitButton.disabled = true;
    submitButton.textContent = 'Creating account...';

    // Send signup request via AJAX
    fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Save user info to localStorage
            localStorage.setItem('user', JSON.stringify(data.data));

            // Show success message
            signupSuccessMessage.textContent = `Account created successfully, ${name}! Redirecting to your blog...`;
            signupSuccessMessage.classList.add('show');

            // Redirect to blog home after 1.5 seconds
            setTimeout(() => {
                window.location.href = '../blog/blogHome.html';
            }, 1500);
        } else {
            // Show error message
            if (data.message.includes('Email')) {
                signupEmailError.textContent = data.message;
            } else {
                nameError.textContent = data.message || 'Signup failed';
            }
            submitButton.disabled = false;
            submitButton.textContent = 'Create Account';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        nameError.textContent = 'Error connecting to server: ' + error.message;
        submitButton.disabled = false;
        submitButton.textContent = 'Create Account';
    });
});

// Load remembered email on page load
document.addEventListener('DOMContentLoaded', () => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberCheckbox.checked = true;
    }

    // Handle forgot password link
    document.querySelectorAll('.forgot-password').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Password reset functionality would be implemented here');
            // In a real application, redirect to password reset page
            // window.location.href = '/forgot-password';
        });
    });
});
