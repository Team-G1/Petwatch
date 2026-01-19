// Sign Up Form Logic and API Connection
const signupForm = document.getElementById('signupForm');
const messageDisplay = document.getElementById('messageDisplay');

// IMPORTANT: Update this URL to match your running Node.js backend address
const REGISTER_URL = 'http://localhost:5000/api/auth/register'; 

function displayMessage(type, message) {
    if (messageDisplay) {
        messageDisplay.textContent = message;
        messageDisplay.className = `validation_error ${type}`; 
        messageDisplay.style.display = 'block';
    }
}

// Ensure the form element has the id="signupForm" and inputs have 'name' attributes
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
    
        const name = signupForm.elements['name'] ? signupForm.elements['name'].value : '';
        const email = signupForm.elements['email'] ? signupForm.elements['email'].value : '';
        const password = signupForm.elements['password'] ? signupForm.elements['password'].value : '';
        const confirmPassword = signupForm.elements['confirmPassword'] ? signupForm.elements['confirmPassword'].value : '';
        
        // 1. Client-Side Validation
        if (password !== confirmPassword) {
            return displayMessage('error', 'Passwords do not match.');
        }

        try {
            // 2. Send data to Node.js backend
            const response = await fetch(REGISTER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Send only the required fields for registration
                body: JSON.stringify({ name, email, password }) 
            });
    
            const data = await response.json();
    
            if (response.ok) {
                // Success: Registration successful
                displayMessage('success', 'Sign up successful! Redirecting to Sign In...');
                
                // Store the token (optional for sign up, but helpful for debugging)
                localStorage.setItem('token', data.token);
                
                // Redirect after a short delay
                setTimeout(() => {
                    // IMPORTANT: Adjust this path to your actual Sign In page path
                    window.location.href = 'Sign in.html'; 
                }, 1500);
    
            } else {
                // Failure: Server returned an error (e.g., email already exists)
                displayMessage('error', data.msg || 'Registration failed due to a server error.');
            }
    
        } catch (error) {
            // Network failure (server is down, CORS error, etc.)
            console.error('Network Error:', error);
            displayMessage('error', 'Network error. Could not connect to the server.');
        }
    });
}


// -------------------------------------------------------------
// NAVBAR VISIBILITY LOGIC (Your Code Integrated)
// -------------------------------------------------------------

const navbar = document.querySelector('.navbar_container');
let lastScrollY = window.scrollY;
let isScrollingDown = false;

if (navbar) {
    // Show the navbar by default
    navbar.style.opacity = 1;

    // Function to handle navbar visibility on scroll
    function handleScroll() {
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
      if (event.clientY <= 100) {
        // Show the navbar when the mouse is within 100px from the top
        navbar.style.opacity = 1;
      } else if (isScrollingDown) {
        // Only hide the navbar if we are scrolling down
        navbar.style.opacity = 0;
      }
    });
}