document.addEventListener('DOMContentLoaded', () => {
    // 1. SELECTORS
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || 'null');
    const mobileField = document.getElementById('mobileInput');
    const newPwdField = document.getElementById('newPassword');
    const confirmPwdField = document.getElementById('confirmPassword');
    const resetForm = document.querySelector('.ResetPassword-form');
    const otpModal = document.getElementById('otpModal');
    const submitBtn = document.querySelector('.btn-ResetPassword');

    // 2. AUTOFILL LOGIC
    if (user && user.mobile) {
        mobileField.value = user.mobile;
        mobileField.readOnly = true; 
        mobileField.style.backgroundColor = "#f0f0f0";
    }

    // 3. HANDLE FORM SUBMISSION (Request OTP)
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentMobile = mobileField.value.trim();
        const pwd = newPwdField.value;
        const confirmPwd = confirmPwdField.value;

        if (pwd !== confirmPwd) {
            alert("❌ Passwords do not match!");
            return;
        }

        // Change button state to show loading
        submitBtn.innerText = "Sending Code...";
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('http://localhost:5001/api/auth/send-otp', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ mobile: currentMobile })
            });

            if (response.ok) {
                // Show modal and update text
                document.getElementById('targetMobile').innerText = currentMobile;
                otpModal.style.display = 'flex';
                console.log("✅ OTP Email sent successfully.");
            } else {
                const errorText = await response.text();
                alert("❌ Error: " + errorText);
            }
        } catch (error) {
            console.error("Network Error:", error);
            alert("❌ Connection failed. Ensure the backend is running on port 5001.");
        } finally {
            submitBtn.innerText = "Get Reset Code";
            submitBtn.disabled = false;
        }
    });

    // 4. VERIFY OTP AND SAVE NEW PASSWORD
    document.getElementById('verifyOtpBtn').addEventListener('click', async () => {
        const otp = document.getElementById('otpCode').value;
        const newPassword = newPwdField.value;
        const currentMobile = mobileField.value.trim();

        if (otp.length !== 6) {
            alert("Please enter the 6-digit code.");
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/auth/verify-reset', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    mobile: currentMobile, 
                    otp: otp, 
                    newPassword: newPassword 
                })
            });

            if (response.ok) {
                alert("✅ Password reset successfully! You can now log in.");
                window.location.href = 'signin.html';
            } else {
                const errorData = await response.json();
                alert("❌ " + (errorData.message || "Invalid OTP code. Please try again."));
            }
        } catch (err) {
            alert("❌ Connection to server failed.");
        }
    });

    // 5. MODAL CLOSE LOGIC
    document.getElementById('closeOtpBtn').addEventListener('click', () => {
        otpModal.style.display = 'none';
    });

    // 6. PASSWORD VISIBILITY TOGGLE
    document.querySelectorAll('.toggle-pwd').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            if (input.type === "password") {
                input.type = "text";
                this.classList.replace('fa-eye-slash', 'fa-eye');
            } else {
                input.type = "password";
                this.classList.replace('fa-eye', 'fa-eye-slash');
            }
        });
    });
});