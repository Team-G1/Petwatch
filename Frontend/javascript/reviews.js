const testimonials = [
    { 
        name: "Dinusha Gamage", 
        img: "../../Resources/review1.png",
        review: "The team at PetWatch took such great care of my golden retriever while I was away. I felt so relieved!" 
    },
    { 
        name: "Adrian Perera", 
        img: "../../Resources/review2.png",
        review: "Very professional and easy to book. My cat usually hates strangers, but she warmed up to them instantly." 
    },
    { 
        name: "Amali Dias", 
        img: "../../Resources/review3.png",
        review: "I love the daily updates and photos they send. It gives me such peace of mind knowing my puppy is happy." 
    },
    { 
        name: "Pawan Kaushalya", 
        img: "../../Resources/review4.png",
        review: "Reliable and punctual. They handled my energetic husky with ease. Best pet service I've used so far!" 
    },
    { 
        name: "Anandi Wikramanayaka", 
        img: "../../Resources/review5.png",
        review: "The grooming service left my poodle looking like a star. Excellent customer support and very friendly staff." 
    },
    { 
        name: "Avishka Bandara", 
        img: "../../Resources/review6.png",
        review: "Affordable and trustworthy. I've used PetWatch for months now and couldn't be happier with the care." 
    }
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
                ${item.review} 
                <a href="#" class="see-more">see more ></a>
            </p>
        </div>
    `;
    
    container.appendChild(card);
});