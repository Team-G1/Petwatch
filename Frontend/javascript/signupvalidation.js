/**
 * Frontend Validation and Simulated Backend Call for Sign Up Form
 */

function handleSignup(event) {
  // Prevent the default form submission (which reloads the page)
  event.preventDefault(); 

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const mobile = document.getElementById('mobile').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const messageElement = document.getElementById('validationMessage');
  
  // Clear previous messages
  messageElement.textContent = '';
  messageElement.classList.remove('success', 'error');

  // --- 1. Basic Field Validation ---
  if (!username || !email || !mobile || !password || !confirmPassword) {
      displayMessage('All fields are required.', 'error');
      return;
  }

  // --- 2. Password Length Validation ---
  const MIN_PASSWORD_LENGTH = 8;
  if (password.length < MIN_PASSWORD_LENGTH) {
      displayMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`, 'error');
      return;
  }

  // --- 3. Password Match Validation ---
  if (password !== confirmPassword) {
      displayMessage('Passwords do not match. Please check again.', 'error');
      return;
  }

  // --- 4. Simulated Backend Authentication (Replace with actual API call) ---
  
  // At this point, the frontend validation is complete. 
  // Now, you would normally send the data to your server/backend API.
  
  console.log("Frontend validation successful. Submitting to backend...");
  
  // --- ACTUAL BACKEND INTEGRATION STARTS HERE ---
  /*
  // Example using the Fetch API (You must set up your backend endpoint)
  fetch('/api/signup', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, mobile, password })
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          displayMessage('Sign up successful! Redirecting to sign in...', 'success');
          // setTimeout(() => window.location.href = 'Sign in.html', 2000); 
      } else {
          // Display error from the server (e.g., "Email already registered")
          displayMessage(data.message || 'Signup failed due to a server error.', 'error');
      }
  })
  .catch(error => {
      console.error('Network or system error:', error);
      displayMessage('A network error occurred. Please try again.', 'error');
  });
  */
  // --- ACTUAL BACKEND INTEGRATION ENDS HERE ---

  // --- SIMULATION (Delete this block when integrating a real backend) ---
  // Simulate successful submission for demonstration
  displayMessage('Sign up request sent! (Simulation successful).', 'success');
  document.getElementById('signupForm').reset();
  // ---------------------------------------------------------------------

}

/**
* Helper function to display messages to the user.
* @param {string} message - The text to display.
* @param {string} type - 'error' or 'success' for styling.
*/
function displayMessage(message, type) {
  const messageElement = document.getElementById('validationMessage');
  messageElement.textContent = message;
  messageElement.classList.add(type);
}