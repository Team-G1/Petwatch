function loadnavbar() {
  fetch('../../Frontend/html/navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar').innerHTML = data;
      initializeScrollHandling(); // Initialize scroll handling after loading navbar
    })
    .catch(error => console.error('Error loading navbar:', error));
}

// Function to handle navbar scroll behavior
function initializeScrollHandling() {
  const navbar = document.querySelector('.navbar_container');
  let lastScrollY = window.scrollY;
  let isScrollingDown = false;

  // Ensure the navbar is visible by default
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
      // If scrolling up, show the navbar
      isScrollingDown = false;
      navbar.style.opacity = 1;
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

// Call the function to load the navbar
loadnavbar();

/* Frontend/javascript/navbar.js */

document.addEventListener("DOMContentLoaded", function () {
    const navbarContainer = document.getElementById("navbar");
    
    if (navbarContainer) {
        navbarContainer.innerHTML = `
            <div class="navbar_container">
                <div class="navbar_left">
                    <a href="home.html" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 10px;">
                        <div class="logo">
                            <img src="../../Resources/pwlogo.png" alt="Logo" width="24" height="24">
                            PetWatch
                        </div>
                    </a>
                </div>
                <div class="navbar_right">
                    <div class="nav_links">
                        <a href="home.html">Home</a>
                        <a href="services.html">Our services</a>
                        <a href="doctors.html">About us</a>
                        <a href="help.html">Help</a>
                    </div>
                    <div class="nav_buttons">
                        <a href="signup.html" class="signup_button">Sign Up</a>
                        <a href="signin.html" class="signin_button">Sign In</a>
                    </div>
                </div>
            </div>
        `;
    }
});