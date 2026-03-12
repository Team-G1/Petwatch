// Frontend/javascript/reviews.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('Reviews page loaded');
    
    const reviewForm = document.getElementById('reviewForm');
    const reviewsGrid = document.getElementById('reviewsDisplayGrid');

    // Function to Load Reviews from MongoDB
    const loadReviews = async () => {
        try {
            console.log('Loading reviews...');
            const response = await fetch('http://localhost:5001/api/reviews');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const reviews = await response.json();
            console.log('Reviews loaded:', reviews);

            // Clear the grid
            reviewsGrid.innerHTML = '';

            if (reviews.length === 0) {
                reviewsGrid.innerHTML = '<p style="text-align: center; color: #666;">No reviews yet. Be the first to leave a review!</p>';
                return;
            }

            // Inside reviews.js -> loadReviews function
reviews.forEach(rev => {
    const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
    const isLong = rev.comment.length > 100;
    
    const card = document.createElement('div');
    card.className = 'reviews_card';
    card.innerHTML = `
        <img src="../../Resources/reviewsIconPets.png" alt="User">
        <div class="rating">${stars}</div>
        <h3>${rev.userName}</h3>
        <p class="comment-text">
            ${rev.comment.substring(0, 100)}${isLong ? '...' : ''}
        </p>
        ${isLong ? `<button class="see-more-btn" onclick="alert('${rev.comment.replace(/'/g, "\\'")}')">See more ></button>` : ''}
    `;
    reviewsGrid.appendChild(card);
});
        } catch (error) {
            console.error("❌ Error loading reviews:", error);
            reviewsGrid.innerHTML = '<p style="text-align: center; color: #ff4444;">Error loading reviews. Please try again later.</p>';
        }
    };

    // Function to Save Review to MongoDB
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get form values
            const userName = document.getElementById('revName').value.trim();
            const rating = parseInt(document.getElementById('revRating').value);
            const comment = document.getElementById('revComment').value.trim();

            // Validate
            if (!userName || !rating || !comment) {
                alert('Please fill in all fields');
                return;
            }

            const formData = {
                userName: userName,
                rating: rating,
                comment: comment
            };

            console.log("📤 Sending review data:", formData);

            try {
                const response = await fetch('http://localhost:5001/api/reviews', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                console.log('Server response:', result);

                if (response.ok) {
                    alert("✅ Thank you! Your review has been submitted.");
                    reviewForm.reset();
                    loadReviews(); // Refresh the display immediately
                } else {
                    alert("⚠️ Error: " + (result.message || 'Failed to submit review'));
                }
            } catch (error) {
                console.error("❌ Fetch Error:", error);
                alert("❌ Could not connect to server. Make sure the backend is running on port 5001.");
            }
        });
    }

    // Load reviews when page loads
    loadReviews();
});