// Sign In Form Logic and API Connection
const signinForm = document.getElementById('signinForm');
const loginMessageDisplay = document.getElementById('loginMessageDisplay');

// IMPORTANT: Update this URL to match your running Node.js backend address
const LOGIN_URL = 'http://localhost:5000/api/auth/login'; 

function displayLoginMessage(type, message) {
    // Ensures the message display area is correctly styled and visible
    if (loginMessageDisplay) {
        loginMessageDisplay.textContent = message;
        // The class names (.validation_error, .success, .error) should be defined in your CSS
        loginMessageDisplay.className = `validation_error ${type}`; 
        loginMessageDisplay.style.display = 'block';
    }
}

signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get email and password from the form elements
    const email = signinForm.elements['email'].value;
    const password = signinForm.elements['password'].value;

    try {
        const response = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Success: Login successful
            displayLoginMessage('success', 'Login successful! Redirecting...');
            
            // Store the received JWT token and user details
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user)); 

            // Redirect to the protected dashboard page
            setTimeout(() => {
                // IMPORTANT: Change this path to your actual protected area, e.g., 'dashboard.html'
                window.location.href = '../dashboard/dashboard.html'; 
            }, 1000);

        } else {
            // Failure: Invalid Credentials or other server error
            displayLoginMessage('error', data.msg || 'Sign in failed. Check your email and password.');
        }

    } catch (error) {
        console.error('Network Error:', error);
        displayLoginMessage('error', 'Network error. Could not connect to the server.');
    }
});


// -------------------------------------------------------------
// NAVBAR VISIBILITY LOGIC (Your Existing Code)
// -------------------------------------------------------------

const navbar = document.querySelector('.navbar_container');
let lastScrollY = window.scrollY;
let isScrollingDown = false;

// Show the navbar by default
if (navbar) {
    navbar.style.opacity = 1;
}

// Function to handle navbar visibility on scroll
function handleScroll() {
    if (!navbar) return; // Exit if navbar element is not found
    
    if (window.scrollY === 0) {
        // If at the top of the page, show the navbar
        navbar.style.opacity = 1;
        isScrollingDown = false; // Reset scroll direction
    } else if (window.scrollY > lastScrollY) {
        // If scrolling down, hide the navbar
        isScrollingDown = true;
        navbar.style.opacity = 0;
    } else {
        // If scrolling up, update flag but keep navbar hidden
        isScrollingDown = false;
    }
    lastScrollY = window.scrollY;
}

// Handle scroll events
window.addEventListener('scroll', handleScroll);

// Handle mouse hover near the top
window.addEventListener('mousemove', (event) => {
    if (!navbar) return; // Exit if navbar element is not found
    
    if (event.clientY <= 100) {
        // Show the navbar when the mouse is within 100px from the top
        navbar.style.opacity = 1;
    } else if (isScrollingDown) {
        // Only hide the navbar if we are scrolling down
        navbar.style.opacity = 0;
    }
});