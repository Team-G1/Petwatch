document.addEventListener('DOMContentLoaded', function () {
    const topVetsContainer = document.getElementById('top-vets-grid');
    const otherVetsContainer = document.getElementById('other-vets-grid');

    async function loadVetsForUser() {
        try {
            const response = await fetch('http://localhost:5001/api/vets');
            const allVets = await response.json();

            //eparate the data
            const topThree = allVets.slice(0, 3);
            const theRest = allVets.slice(3);

            //Top 3
            if (topVetsContainer) {
                renderVetList(topThree, topVetsContainer, true);
            }

            //others
            if (otherVetsContainer) {
                renderVetList(theRest, otherVetsContainer, false);
            }
        } catch (err) {
            console.error("Error loading vets:", err);
        }
    }

    function renderVetList(vets, container, isTopSection) {
        container.innerHTML = '';
        vets.forEach(vet => {
            const card = document.createElement('div');
            
            card.className = isTopSection ? 'vet-card featured' : 'vet-card'; 
            
            card.innerHTML = `
                <div class="vet-avatar">
                    <img src="${vet.image ? 'http://localhost:5001' + vet.image : 'https://via.placeholder.com/100'}" alt="${vet.name}">
                    <span class="status-dot ${vet.status === 'on-duty' ? 'online' : 'offline'}"></span>
                </div>
                <div class="vet-details">
                    <h3>${vet.name}</h3>
                    <p class="designation">${vet.designation}</p>
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${vet.location}</p>
                    <button class="view-profile-btn">Book Appointment</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    loadVetsForUser();
});

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
    isScrollingDown = false; 
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





