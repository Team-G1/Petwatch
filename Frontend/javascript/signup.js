// Frontend/javascript/signup.js

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const errorMsg = document.getElementById('errorMsg');
    
    // API Base URL - make sure this matches your backend port
    const API_BASE_URL = 'http://localhost:5001'; // Updated to match your server port
    
    // Test backend connection on page load
    testBackendConnection();
    
    // Toggle password visibility
    const toggleButtons = document.querySelectorAll('.toggle-pwd');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            }
        });
    });

    // Test backend connection function
    async function testBackendConnection() {
        try {
            // Try to fetch a simple endpoint to check if server is running
            const response = await fetch(`${API_BASE_URL}/api/health-tips`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('✅ Backend connection successful');
            } else {
                console.log('⚠️ Backend responded with status:', response.status);
            }
        } catch (error) {
            console.error('❌ Backend connection failed:', error);
            showError('Cannot connect to server. Please make sure the backend is running on port 5001');
        }
    }

    // Handle form submission
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (!username || !email || !mobile || !password || !confirmPassword) {
            showError('All fields are required');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return;
        }
        
        // Mobile validation - accepts various formats
        const mobileDigits = mobile.replace(/\D/g, '');
        if (mobileDigits.length < 10 || mobileDigits.length > 15) {
            showError('Please enter a valid mobile number (10-15 digits)');
            return;
        }
        
        // Password validation (minimum 6 characters)
        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }
        
        // Check if passwords match
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        // Disable submit button and show loading state
        const submitBtn = document.querySelector('.btn-signup');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;
        hideError();
        
        try {
            console.log('Sending signup request to:', `${API_BASE_URL}/api/auth/signup`);
            console.log('Request payload:', { username, email, mobile, password: '***' });
            
            // API call to backend
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    mobile: mobile,
                    password: password
                })
            });
            
            // First, get the response text
            const responseText = await response.text();
            console.log('Raw server response:', responseText);
            
            // Try to parse as JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                console.log('Response was:', responseText);
                
                // Check if response is HTML (possibly a 404 page)
                if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html>')) {
                    showError('Server returned an HTML page. The API endpoint might be wrong or the server is not configured correctly.');
                } else {
                    showError('Server returned an invalid response. Please check the console for details.');
                }
                
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            if (response.ok) {
                // Success - show success message and redirect
                showSuccess('Account created successfully! Redirecting to sign in...');
                
                // Store success message in session storage for signin page
                sessionStorage.setItem('signupSuccess', 'true');
                sessionStorage.setItem('signupEmail', email); // Store email for convenience
                
                // Redirect to signin page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'signin.html';
                }, 2000);
            } else {
                // Error from server
                let errorMessage = data.message || 'Failed to create account. Please try again.';
                
                // Handle specific MongoDB errors
                if (data.code === 11000) {
                    errorMessage = 'This email is already registered. Please use a different email or sign in.';
                }
                
                showError(errorMessage);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Signup error details:', error);
            
            // More specific error messages based on error type
            if (error.message.includes('Failed to fetch')) {
                showError('Cannot connect to server. Please ensure:\n1. Backend server is running on port 5001\n2. MongoDB is connected\n3. No firewall blocking the connection');
            } else {
                showError('Network error. Please check your connection and try again.');
            }
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Helper function to show error message
    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
        errorMsg.style.color = '#e74c3c';
        errorMsg.style.whiteSpace = 'pre-line'; // Allows line breaks in error messages
        errorMsg.style.backgroundColor = '#fde8e8';
        errorMsg.style.padding = '10px';
        errorMsg.style.borderRadius = '5px';
        errorMsg.style.margin = '10px 0';
    }
    
    // Helper function to hide error message
    function hideError() {
        errorMsg.style.display = 'none';
        errorMsg.style.backgroundColor = 'transparent';
        errorMsg.style.padding = '0';
    }
    
    // Helper function to show success message
    function showSuccess(message) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
        errorMsg.style.color = '#27ae60';
        errorMsg.style.backgroundColor = '#e8f8e8';
        errorMsg.style.padding = '10px';
        errorMsg.style.borderRadius = '5px';
        errorMsg.style.margin = '10px 0';
    }
    
    // Real-time validation for confirm password
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmInput) {
        confirmInput.addEventListener('input', function() {
            if (this.value && passwordInput.value !== this.value) {
                this.style.borderColor = '#e74c3c';
                this.style.borderWidth = '2px';
            } else if (this.value && passwordInput.value === this.value) {
                this.style.borderColor = '#27ae60';
                this.style.borderWidth = '2px';
            } else {
                this.style.borderColor = '#ddd';
                this.style.borderWidth = '1px';
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            if (confirmInput && confirmInput.value && this.value !== confirmInput.value) {
                confirmInput.style.borderColor = '#e74c3c';
                confirmInput.style.borderWidth = '2px';
            } else if (confirmInput && confirmInput.value && this.value === confirmInput.value) {
                confirmInput.style.borderColor = '#27ae60';
                confirmInput.style.borderWidth = '2px';
            }
            
            // Show password strength
            updatePasswordStrength(this.value);
        });
    }
    
    // Password strength indicator
    function updatePasswordStrength(password) {
        // Remove existing indicator if any
        const existingIndicator = document.querySelector('.password-strength');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        if (!password) return;
        
        const strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength';
        strengthIndicator.style.marginTop = '5px';
        strengthIndicator.style.fontSize = '12px';
        strengthIndicator.style.padding = '3px 8px';
        strengthIndicator.style.borderRadius = '3px';
        
        let strength = 0;
        let message = '';
        let color = '';
        
        // Check password criteria
        if (password.length >= 6) strength += 1;
        if (password.match(/[a-z]+/)) strength += 1;
        if (password.match(/[A-Z]+/)) strength += 1;
        if (password.match(/[0-9]+/)) strength += 1;
        if (password.match(/[$@#&!%*?]+/)) strength += 1;
        
        switch(strength) {
            case 0:
            case 1:
                message = 'Weak password';
                color = '#e74c3c';
                break;
            case 2:
            case 3:
                message = 'Medium password';
                color = '#f39c12';
                break;
            case 4:
            case 5:
                message = 'Strong password';
                color = '#27ae60';
                break;
        }
        
        strengthIndicator.textContent = message;
        strengthIndicator.style.backgroundColor = color + '20';
        strengthIndicator.style.color = color;
        strengthIndicator.style.border = `1px solid ${color}`;
        
        // Insert after password field
        if (passwordInput && passwordInput.parentNode) {
            passwordInput.parentNode.appendChild(strengthIndicator);
        }
    }
    
    // Auto-format mobile number input
    const mobileInput = document.getElementById('mobile');
    if (mobileInput) {
        mobileInput.addEventListener('input', function(e) {
            // Remove non-digits
            let value = this.value.replace(/\D/g, '');
            
            // Limit to 10 digits
            if (value.length > 10) {
                value = value.substr(0, 10);
            }
            
            this.value = value;
        });
    }
    
    // Check if user came from signin page with error
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error')) {
        showError('Please sign up first');
    }
    
    // Clear any existing session storage flags
    sessionStorage.removeItem('signupSuccess');
    
    // Add input event listeners to clear error when user starts typing
    const inputIds = ['username', 'email', 'mobile', 'password', 'confirmPassword'];
    inputIds.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', function() {
                if (errorMsg.style.display === 'block' && !errorMsg.textContent.includes('success')) {
                    hideError();
                }
            });
        }
    });
});

// Test function to check your backend endpoint
async function testSignupEndpoint() {
    try {
        const response = await fetch('http://localhost:5001/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'test',
                email: 'test@example.com',
                mobile: '1234567890',
                password: 'password123'
            })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const text = await response.text();
        console.log('Response body:', text);
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

