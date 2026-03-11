// help.js

document.addEventListener('DOMContentLoaded', function() {
    const inquiryForm = document.getElementById('inquiryForm');
    
    if (inquiryForm) {
        // Remove the method and action attributes to prevent default form submission
        inquiryForm.removeAttribute('method');
        inquiryForm.removeAttribute('action');
        
        inquiryForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const branch = document.querySelector('input[name="branch"]').value.trim();
            const name = document.querySelector('input[name="name"]').value.trim();
            const email = document.querySelector('input[name="email"]').value.trim();
            const message = document.querySelector('textarea[name="message"]').value.trim();
            
            // Validation
            if (!branch || !name || !email || !message) {
                showAlert('Please fill in all fields', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showAlert('Please enter a valid email address', 'error');
                return;
            }
            
            // Disable submit button to prevent double submission
            const submitBtn = inquiryForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            try {
                const response = await fetch('http://localhost:5001/api/inquiries', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        branch: branch,
                        name: name,
                        email: email,
                        message: message
                    })
                });
                
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.message || 'Failed to send inquiry');
                }
                
                // Success
                showAlert('Thank you! Your inquiry has been sent to our support team.', 'success');
                inquiryForm.reset();
                
            } catch (error) {
                console.error('Error:', error);
                showAlert(error.message || 'Error sending inquiry. Please try again.', 'error');
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});

// Alert/Notification function
function showAlert(message, type) {
    // Remove any existing alert
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `custom-alert ${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Style the alert
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.padding = '15px 25px';
    alert.style.borderRadius = '8px';
    alert.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
    alert.style.color = 'white';
    alert.style.fontWeight = '500';
    alert.style.zIndex = '1000';
    alert.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    alert.style.animation = 'slideIn 0.3s ease';
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add to document
    document.body.appendChild(alert);
    
    // Remove after 5 seconds
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        alert.style.transform = 'translateX(100%)';
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// Alternative approach: If you prefer to keep the commented alert in HTML
// You can remove the commented script at the bottom of your HTML file