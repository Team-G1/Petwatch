// Frontend/javascript/signin.js
document.addEventListener('DOMContentLoaded', function() {
    const signinForm = document.querySelector('.signin-form');
    const errorMsg = document.createElement('div');
    errorMsg.id = 'errorMsg';
    errorMsg.style.display = 'none';
    
    if (signinForm) {
        signinForm.parentNode.insertBefore(errorMsg, signinForm);
    }
    
    const API_BASE_URL = 'http://localhost:5001';
    
    // Toggle password visibility
    const togglePassword = document.querySelector('.toggle-pwd');
    const passwordInput = document.querySelector('.input-group input[type="password"]');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            } else {
                passwordInput.type = 'password';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            }
        });
    }
    
    // Check if user just signed up
    const signupSuccess = sessionStorage.getItem('signupSuccess');
    const signupEmail = sessionStorage.getItem('signupEmail');
    
    if (signupSuccess === 'true' && signupEmail) {
        showSuccess('Account created successfully! Please sign in.');
        const emailInput = document.querySelector('.input-group input[type="text"]');
        if (emailInput) {
            emailInput.value = signupEmail;
        }
        sessionStorage.removeItem('signupSuccess');
        sessionStorage.removeItem('signupEmail');
    }
    
    // Handle form submission
    if (signinForm) {
        signinForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const usernameEmailInput = document.querySelector('.input-group input[type="text"]');
            const passwordInput = document.querySelector('.input-group input[type="password"]');
            
            if (!usernameEmailInput || !passwordInput) {
                showError('Form inputs not found');
                return;
            }
            
            const usernameOrEmail = usernameEmailInput.value.trim();
            const password = passwordInput.value;
            
            // Since your HTML doesn't have a remember me checkbox, set rememberMe to false
            const rememberMe = false; // FIX: Declare rememberMe variable here
            
            // Validation
            if (!usernameOrEmail || !password) {
                showError('Please enter both username/email and password');
                return;
            }
            
            // Determine if input is email or username
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail);
            
            // Disable submit button
            const submitBtn = document.querySelector('.btn-signin');
            if (!submitBtn) {
                console.error('Submit button not found');
                return;
            }
            
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Signing In...';
            submitBtn.disabled = true;
            hideError();
            
            try {
                console.log('Attempting signin with:', { usernameOrEmail, isEmail });
                
                const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        [isEmail ? 'email' : 'username']: usernameOrEmail, 
                        password 
                    })
                });
                
                const data = await response.json();
                console.log('Signin response:', data);
                
                if (response.ok) {
                    // Store user data
                    const userData = {
        id: data.user?.id || data.user?._id,
        username: data.user?.username || data.user?.name || usernameOrEmail.split('@')[0],
        email: data.user?.email || (isEmail ? usernameOrEmail : ''),
        mobile: data.user?.mobile || ''
    };
                    
                    // Since rememberMe is false, always use sessionStorage
                    sessionStorage.setItem('user', JSON.stringify(userData));
                    if (data.token) sessionStorage.setItem('token', data.token);
                    localStorage.setItem('token', data.token);
                    
                    showSuccess('Sign in successful! Redirecting...');
                    
                    // Redirect to home page
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 1500);
                } else {
                    showError(data.message || 'Invalid username/email or password');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Signin error:', error);
                showError('Network error. Please check your connection.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Helper functions
    function showError(message) {
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
            errorMsg.style.color = '#e74c3c';
            errorMsg.style.backgroundColor = '#fde8e8';
            errorMsg.style.padding = '10px';
            errorMsg.style.borderRadius = '5px';
            errorMsg.style.margin = '10px 0';
            errorMsg.style.border = '1px solid #e74c3c';
            errorMsg.style.textAlign = 'center';
        }
    }
    
    function hideError() {
        if (errorMsg) {
            errorMsg.style.display = 'none';
        }
    }
    
    function showSuccess(message) {
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
            errorMsg.style.color = '#27ae60';
            errorMsg.style.backgroundColor = '#e8f8e8';
            errorMsg.style.padding = '10px';
            errorMsg.style.borderRadius = '5px';
            errorMsg.style.margin = '10px 0';
            errorMsg.style.border = '1px solid #27ae60';
            errorMsg.style.textAlign = 'center';
        }
    }
});