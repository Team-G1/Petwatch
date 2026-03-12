
let tipsGrid;
document.addEventListener('DOMContentLoaded', async function () {
    tipsGrid = document.getElementById('tipsGrid');

    loadHealthTips();

    tipsGrid.addEventListener('click', handleEdit);
    tipsGrid.addEventListener('click', handleDelete);
});


document.addEventListener('DOMContentLoaded', async function () {

    async function loadHealthTips() {
        try {
            const res = await fetch('http://localhost:5001/api/health-tips');
            const tips = await res.json();

            tipsGrid.innerHTML = '';

            tips.forEach(tip => {
                const card = document.createElement('div');
                card.className = 'tip-card';

                card.innerHTML = `
                    <div class="tip-header">
                        <span class="category-badge ${tip.category}">
                            ${tip.category}
                        </span>
                        <div class="tip-actions">
                            <button class="btn-action edit" data-id="${tip._id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action delete" data-id="${tip._id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="tip-image">
                        <img src="${tip.image ? 'http://localhost:5001' + tip.image : 'https://via.placeholder.com/400'}">
                    </div>

                    <div class="tip-content">
                        <h3>${tip.title}</h3>
                        <p>${tip.description}</p>
                        <div class="tip-meta">
                            <span class="date">
                                <i class="far fa-calendar"></i>
                                ${new Date(tip.createdAt).toLocaleDateString()}
                            </span>
                            <span class="status ${tip.status}">
                                ${tip.status}
                            </span>
                        </div>
                    </div>
                `;

                tipsGrid.appendChild(card);
            });

            updateStats(tips);




        } catch (err) {
            console.error('Failed to load tips', err);
        }
    }

    function updateStats(tips) {
        const total = tips.length;
        const published = tips.filter(t => t.status === 'published').length;

        document.querySelector('.total-tips h3').textContent = total;
        document.querySelector('.published-tips h3').textContent = published;
    }

    loadHealthTips();
});

document.addEventListener('DOMContentLoaded', function () {
    // Filter functionality
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function () {
            console.log(`Filter changed: ${this.id} = ${this.value}`);
            // Filter tips based on selection
            filterTips();
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase();
        filterTips(searchTerm);
    });

    // Refresh button
    const refreshBtn = document.querySelector('.btn-refresh');
    refreshBtn.addEventListener('click', function () {
        this.classList.add('refreshing');
        setTimeout(() => {
            this.classList.remove('refreshing');
            console.log('Tips refreshed');
        }, 1000);
    });



    // Add new tip button
    document.getElementById('add-tip-btn').addEventListener('click', function () {
        console.log('Opening new tip form...');
        // Open modal or redirect to add page
        window.location.href = 'health-tips-add.html';
    });

    // Tip action buttons
    tipsGrid.addEventListener('click', function (e) {
        const editBtn = e.target.closest('.btn-action.edit');
        if (!editBtn) return;

        const id = editBtn.dataset.id;
        window.location.href = `health-tips-edit.html?id=${id}`;
    });


    tipsGrid.addEventListener('click', async function (e) {
        const deleteBtn = e.target.closest('.btn-action.delete');
        if (!deleteBtn) return;

        const tipCard = deleteBtn.closest('.tip-card');
        const tipTitle = tipCard.querySelector('h3').textContent;
        const id = deleteBtn.dataset.id;

        if (!confirm(`Are you sure you want to delete "${tipTitle}"?`)) return;

        try {
            const res = await fetch(`http://localhost:5001/api/health-tips/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error();

            tipCard.remove();
            updateStatsAfterDelete();

        } catch {
            alert('Delete failed');
        }
    });

    // Pagination
    document.querySelectorAll('.page-number').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelectorAll('.page-number').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            console.log(`Page ${this.textContent} selected`);
        });
    });

    // Function to filter tips
    function filterTips(searchTerm = '') {
        const categoryFilter = document.getElementById('category-filter').value;
        const statusFilter = document.getElementById('status-filter').value;

        document.querySelectorAll('.tip-card').forEach(card => {
            const category = card.querySelector('.category-badge').textContent.toLowerCase();
            const status = card.querySelector('.status').textContent.toLowerCase();
            const title = card.querySelector('h3').textContent.toLowerCase();
            const content = card.querySelector('p').textContent.toLowerCase();

            const matchesCategory = categoryFilter === 'all' || category.includes(categoryFilter);
            const matchesStatus = statusFilter === 'all' || status === statusFilter;
            const matchesSearch = searchTerm === '' ||
                title.includes(searchTerm) ||
                content.includes(searchTerm);

            if (matchesCategory && matchesStatus && matchesSearch) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    // Function to update stats after changes
    function updateStatsAfterDelete() {
        const totalTips = document.querySelectorAll('.tip-card').length;
        const publishedTips = document.querySelectorAll('.status.published').length;

        document.querySelector('.total-tips h3').textContent = totalTips;
        document.querySelector('.published-tips h3').textContent = publishedTips;
    }
});