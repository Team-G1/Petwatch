const testimonials = [
    { name: "Dinusha Gamage", img: "https://via.placeholder.com/200x250?text=Person1" },
    { name: "Adrian Perera", img: "https://via.placeholder.com/200x250?text=Person2" },
    { name: "Amali Dias", img: "https://via.placeholder.com/200x250?text=Person3" },
    { name: "Pawan Kaushalya", img: "https://via.placeholder.com/200x250?text=Person4" },
    { name: "Anandi Wikramanayaka", img: "https://via.placeholder.com/200x250?text=Person5" },
    { name: "Avishka Bandara", img: "https://via.placeholder.com/200x250?text=Person6" }
];

const container = document.getElementById('testimonial-container');

testimonials.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    
    card.innerHTML = `
        <div class="image-container">
            <img src="${item.img}" alt="${item.name}">
        </div>
        <div class="card-content">
            <div class="stars">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
            </div>
            <p class="name">${item.name}</p>
            <p class="testimonial-text">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                <a href="#" class="see-more">see more ></a>
            </p>
        </div>
    `;
    
    container.appendChild(card);
});