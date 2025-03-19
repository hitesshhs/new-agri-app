document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const registerSuccess = document.getElementById('register-success');
    
    // Check if user is already logged in
    checkAuthStatus();
    
    // Add event listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    function checkAuthStatus() {
        fetch('/api/auth/user', {
            credentials: 'include'
        })
        .then(response => {
            if (response.ok) {
                // User is logged in, redirect to dashboard
                window.location.href = '/dashboard';
            }
        })
        .catch(error => console.error('Error checking auth status:', error));
    }
    
    function handleLogin(e) {
        e.preventDefault();
        
        // Get form values
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        
        // Validate
        if (!email || !password) {
            showError(loginError, 'Email and password are required');
            return;
        }
        
        // Hide previous errors
        hideError(loginError);
        
        // Send login request
        fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to dashboard
                window.location.href = '/dashboard';
            } else {
                showError(loginError, data.error || 'Login failed. Please check your credentials.');
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            showError(loginError, 'Something went wrong. Please try again.');
        });
    }
    
    function handleRegister(e) {
        e.preventDefault();
        
        // Get form values
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        // Validate
        if (!username || !email || !password || !confirmPassword) {
            showError(registerError, 'All fields are required');
            return;
        }
        
        if (password !== confirmPassword) {
            showError(registerError, 'Passwords do not match');
            return;
        }
        
        if (password.length < 8) {
            showError(registerError, 'Password must be at least 8 characters long');
            return;
        }
        
        // Hide previous errors and success messages
        hideError(registerError);
        hideSuccess(registerSuccess);
        
        // Send registration request
        fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password }),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                showSuccess(registerSuccess, data.message || 'Registration successful! Please check your email for verification.');
                
                // Clear form
                registerForm.reset();
                
                // Switch to login tab after a delay
                setTimeout(() => {
                    const loginTab = document.getElementById('login-tab');
                    if (loginTab) {
                        loginTab.click();
                    }
                }, 3000);
            } else {
                showError(registerError, data.error || 'Registration failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            showError(registerError, 'Something went wrong. Please try again.');
        });
    }
    
    function showError(element, message) {
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }
    
    function hideError(element) {
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    }
    
    function showSuccess(element, message) {
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }
    
    function hideSuccess(element) {
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    }
}); 