class SidebarManager {
    constructor() {
        this.sidebar = null;
        this.init();
    }
    
    async init() {
        await this.loadSidebar();
        this.setupActiveLink();
        this.addEventListeners();
        this.adjustMainContent();
    }
    
    async loadSidebar() {
        try {
            const response = await fetch('sidebar.html');
            const html = await response.text();
            
            // Create container and insert sidebar
            const container = document.createElement('div');
            container.innerHTML = html;
            this.sidebar = container.querySelector('.sidebar');
            
            if (!this.sidebar) {
                throw new Error('Sidebar element not found');
            }
            
            // Insert at the beginning of body
            document.body.insertBefore(this.sidebar, document.body.firstChild);
            
            // Load sidebar CSS
            this.loadSidebarCSS();
            
        } catch (error) {
            console.error('Failed to load sidebar:', error);
            this.createFallbackSidebar();
        }
    }
    
    loadSidebarCSS() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'sidebar.css';
        document.head.appendChild(link);
    }
    
    createFallbackSidebar() {
        console.log('Creating fallback sidebar...');
        const fallbackHTML = `
            <aside class="sidebar" style="width:250px;background:#4f46e5;color:white;height:100vh;position:fixed;padding:20px;">
                <div class="logo">PetWatch</div>
                <nav>
                    <ul style="list-style:none;">
                        <li><a href="AdminDashboard.html" style="color:white;display:block;padding:10px;">Dashboard</a></li>
                        <li><a href="AdminAppointments.html" style="color:white;display:block;padding:10px;">Appointments</a></li>
                        <li><a href="health-tips-view.html" style="color:white;display:block;padding:10px;">Health Tips</a></li>
                        <li><a href="Update locations.html" style="color:white;display:block;padding:10px;">Locations</a></li>
                        <li><a href="vets.html" style="color:white;display:block;padding:10px;">Vets</a></li>
                        <li><a href="Settings.html" style="color:white;display:block;padding:10px;">Settings</a></li>
                        
                    </ul>
                </nav>
                <a href="#" style="color:white;display:block;padding:10px;background:#dc2626;margin-top:20px;">Logout</a>
            </aside>
        `;
        
        const temp = document.createElement('div');
        temp.innerHTML = fallbackHTML;
        this.sidebar = temp.querySelector('.sidebar');
        document.body.insertBefore(this.sidebar, document.body.firstChild);
    }
    
    setupActiveLink() {
        const currentPage = this.getCurrentPage();
        const links = document.querySelectorAll('.sidebar-nav a');
        
        links.forEach(link => {
            const linkPage = link.getAttribute('href')?.replace('.html', '').toLowerCase();
            const dataPage = link.getAttribute('data-page');
            
            if (linkPage === currentPage || dataPage === currentPage) {
                link.classList.add('active');
                link.parentElement.classList.add('active');
            }
        });
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '').toLowerCase();
        return page || 'dashboard';
    }
    
    addEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
        
        // Navigation clicks
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }
    
    adjustMainContent() {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.marginLeft = '250px';
            mainContent.style.width = 'calc(100% - 250px)';
        }
        
        // Handle responsive adjustment
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768 && mainContent) {
                mainContent.style.marginLeft = '70px';
                mainContent.style.width = 'calc(100% - 70px)';
            } else if (mainContent) {
                mainContent.style.marginLeft = '250px';
                mainContent.style.width = 'calc(100% - 250px)';
            }
        });
    }
    
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // In real app: Clear session/token, redirect to login
            console.log('Logging out...');
            window.location.href = 'login.html';
        }
    }
}

// Initialize sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SidebarManager();
});