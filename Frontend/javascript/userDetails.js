document.addEventListener('DOMContentLoaded', function() {
        // 1. Get Booking ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const bookingId = urlParams.get('bookingId');

        if (!bookingId) {
            alert("Error: No booking ID found. Please start over.");
            window.location.href = "services.html";
            return;
        }

        // 2. Auto-fill user details from local storage
        const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            
            // Capitalize the first letter of the name if it exists
            let userName = user.username || user.name || '';
            if (userName) {
                userName = userName.charAt(0).toUpperCase() + userName.slice(1);
            }

            // Auto-fill the inputs
            document.getElementById('userName').value = userName;
            document.getElementById('userEmail').value = user.email || '';
            // Checking both 'mobile' and 'phone' just to be safe
            document.getElementById('userPhone').value = user.mobile || user.phone || '';
            
            // Address is intentionally left blank for the user to fill out
        }

        // 3. Handle Form Submission
        document.getElementById('confirmBookingBtn').addEventListener('click', function(e) {
            e.preventDefault();

            // Read all fields
            const userData = {
                userName: document.getElementById('userName').value.trim(),
                userPhone: document.getElementById('userPhone').value.trim(),
                userEmail: document.getElementById('userEmail').value.trim(),
                userAddress: document.getElementById('userAddress').value.trim()
            };

            // STRICT VALIDATION: Check if ANY field is empty
            if (!userData.userName || !userData.userPhone || !userData.userEmail || !userData.userAddress) {
                alert("Please fill in all the details, including your address, before confirming.");
                return;
            }

            // Disable button to prevent double-clicking
            const btn = document.getElementById('confirmBookingBtn');
            btn.disabled = true;
            btn.textContent = 'Processing...';

            // Get token for secure request
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');

            // Send PUT Request to update the booking
            fetch(`http://127.0.0.1:5001/api/book/${bookingId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'Step 2 Complete' || data.success) {
                    // Redirect to the FINAL Confirmation Page
                    window.location.href = `confirmation.html?bookingId=${bookingId}`;
                } else {
                    alert("Error saving details: " + (data.message || data.error));
                    btn.disabled = false;
                    btn.textContent = 'Confirm Booking';
                }
            })
            .catch(err => {
                console.error(err);
                alert("Failed to connect to the server.");
                btn.disabled = false;
                btn.textContent = 'Confirm Booking';
            });
        });
    });