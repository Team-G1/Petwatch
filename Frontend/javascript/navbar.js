/* Frontend/javascript/navbar.js */

// Single function to load navbar on all pages
function loadNavbar() {
    const navbarContainer = document.getElementById("navbar");
    
    if (navbarContainer) {
        // Check if user is logged in
        const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || 'null');
        const isLoggedIn = !!user;
        
        // Get display name
        let displayName = 'User';
        if (user) {
            displayName = user.username || user.name || user.email || 'User';
            if (displayName.includes('@')) {
                displayName = displayName.split('@')[0];
            }
            displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        }
        
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
                        <a href="aboutUs.html">About us</a>
                        <a href="help.html">Help</a>
                    </div>
                    <div class="nav_buttons">
                        ${isLoggedIn ? 
                            `<div class="profile_container">
                                <a href="profile.html" class="profile_link">
                                    <i class="fa-regular fa-circle-user profile_icon"></i>
                                    <span class="profile_name">${displayName}</span>
                                </a>
                                <button onclick="logout()" class="logout_btn" title="Logout">
                                    <i class="fa-solid fa-right-from-bracket"></i>
                                </button>
                            </div>` : 
                            `<a href="signup.html" class="signup_button">Sign Up</a>
                             <a href="signin.html" class="signin_button">Sign In</a>`
                        }
                    </div>
                </div>
            </div>
        `;
        
        // Initialize scroll handling after navbar is loaded
        initializeScrollHandling();
    }
}

// Function to handle navbar scroll behavior
function initializeScrollHandling() {
    const navbar = document.querySelector('.navbar_container');
    if (!navbar) return;
    
    let lastScrollY = window.scrollY;
    let isScrollingDown = false;

    navbar.style.opacity = 1;

    function handleScroll() {
        if (window.scrollY === 0) {
            navbar.style.opacity = 1;
            isScrollingDown = false;
        } else if (window.scrollY > lastScrollY) {
            isScrollingDown = true;
            navbar.style.opacity = 0;
        } else {
            isScrollingDown = false;
            navbar.style.opacity = 1;
        }
        lastScrollY = window.scrollY;
    }

    window.addEventListener('scroll', handleScroll);

    window.addEventListener('mousemove', (event) => {
        if (event.clientY <= 100) {
            navbar.style.opacity = 1;
        } else if (isScrollingDown) {
            navbar.style.opacity = 0;
        }
    });
}

// Logout function
window.logout = function() {
    sessionStorage.clear();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    loadNavbar(); // Reload navbar immediately
    window.location.href = 'home.html';
}

// Load navbar when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    loadNavbar();
});

// Also reload navbar when page becomes visible (for back/forward navigation)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        loadNavbar();
    }
});