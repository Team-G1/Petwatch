const navbar = document.querySelector('.navbar_container');
let lastScrollY = window.scrollY;
let isScrollingDown = false;

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
