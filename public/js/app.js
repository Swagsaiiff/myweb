// Main application controller
class App {
    constructor() {
        this.currentPage = 'loading';
        this.init();
    }

    async init() {
        // Initialize navigation
        this.updateNavigation();
        
        // Listen for auth state changes
        auth.addListener((user, isLoading) => {
            this.handleAuthStateChange(user, isLoading);
        });

        // Check authentication status
        await auth.checkAuth();
        
        // Handle URL routing
        this.handleRouting();
        
        // Start real-time updates
        this.startRealTimeUpdates();
    }

    // Handle authentication state changes
    async handleAuthStateChange(user, isLoading) {
        this.updateNavigation();
        
        if (isLoading) {
            this.showLoadingPage();
            return;
        }

        // Route to appropriate page based on auth status
        const urlPath = window.location.pathname;
        const isAdminPath = urlPath.includes('/admin');
        
        if (!user) {
            // User not authenticated
            if (isAdminPath) {
                window.history.replaceState(null, '', '/');
            }
            this.showLandingPage();
        } else {
            // User authenticated
            if (isAdminPath && user.role === 'admin') {
                this.showAdminPage();
            } else if (isAdminPath && user.role !== 'admin') {
                // Non-admin trying to access admin
                Components.showToast('Admin access required', 'error');
                window.history.replaceState(null, '', '/');
                this.showDashboardPage();
            } else {
                this.showDashboardPage();
            }
        }
    }

    // Update navigation based on auth state
    updateNavigation() {
        const navLinks = document.getElementById('nav-links');
        const user = auth.getUser();
        
        if (!user) {
            // Not authenticated
            navLinks.innerHTML = `
                <a href="#" class="nav-link" onclick="auth.login()">
                    <i class="fas fa-sign-in-alt"></i>
                    Login
                </a>
            `;
        } else {
            // Authenticated
            const adminLink = user.role === 'admin' ? `
                <a href="/admin" class="nav-link" onclick="app.showAdminPage(); return false;">
                    <i class="fas fa-cog"></i>
                    Admin
                </a>
            ` : '';
            
            navLinks.innerHTML = `
                <a href="/" class="nav-link ${this.currentPage === 'dashboard' ? 'active' : ''}" onclick="app.showDashboardPage(); return false;">
                    <i class="fas fa-home"></i>
                    Dashboard
                </a>
                <a href="#account" class="nav-link" onclick="app.scrollToSection('account'); return false;">
                    <i class="fas fa-user"></i>
                    Account
                </a>
                ${adminLink}
                <div class="user-profile">
                    ${user.profileImageUrl ? `
                        <img src="${user.profileImageUrl}" alt="Profile" class="user-avatar">
                    ` : `
                        <i class="fas fa-user-circle" style="font-size: 2rem; color: var(--gaming-bright);"></i>
                    `}
                    <span>${user.firstName || user.email}</span>
                    <a href="#" class="nav-link" onclick="auth.logout()" style="margin-left: 0.5rem;">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </a>
                </div>
            `;
        }
    }

    // Handle URL routing
    handleRouting() {
        const path = window.location.pathname;
        
        // Update URL without reloading when navigating
        window.addEventListener('popstate', () => {
            this.handleAuthStateChange(auth.getUser(), auth.isLoading);
        });
    }

    // Show loading page
    showLoadingPage() {
        this.currentPage = 'loading';
        const mainContent = document.getElementById('main-content');
        Components.showLoading(mainContent);
    }

    // Show landing page
    async showLandingPage() {
        this.currentPage = 'landing';
        window.history.replaceState(null, '', '/');
        
        const mainContent = document.getElementById('main-content');
        Components.showLoading(mainContent);
        
        try {
            const content = Pages.renderLanding();
            mainContent.innerHTML = content;
            this.updateNavigation();
        } catch (error) {
            Components.handleError(error, false);
            mainContent.innerHTML = '<div class="container"><p class="text-center text-error">Failed to load page</p></div>';
        }
    }

    // Show dashboard page
    async showDashboardPage() {
        if (!auth.isAuthenticated()) {
            this.showLandingPage();
            return;
        }
        
        this.currentPage = 'dashboard';
        window.history.replaceState(null, '', '/');
        
        const mainContent = document.getElementById('main-content');
        Components.showLoading(mainContent);
        
        try {
            const content = await Pages.renderDashboard();
            mainContent.innerHTML = content;
            this.updateNavigation();
        } catch (error) {
            Components.handleError(error, false);
            mainContent.innerHTML = '<div class="container"><p class="text-center text-error">Failed to load dashboard</p></div>';
        }
    }

    // Show admin page
    async showAdminPage() {
        if (!auth.isAuthenticated()) {
            Components.showToast('Please login to access admin panel', 'warning');
            auth.login();
            return;
        }
        
        const user = auth.getUser();
        if (!user || user.role !== 'admin') {
            Components.showToast('Admin access required', 'error');
            this.showDashboardPage();
            return;
        }
        
        this.currentPage = 'admin';
        window.history.replaceState(null, '', '/admin');
        
        const mainContent = document.getElementById('main-content');
        Components.showLoading(mainContent);
        
        try {
            // Make sure AdminPages is available
            if (typeof AdminPages === 'undefined') {
                throw new Error('AdminPages module not loaded');
            }
            
            const content = await AdminPages.renderAdmin();
            mainContent.innerHTML = content;
            this.updateNavigation();
        } catch (error) {
            console.error('Admin page error:', error);
            Components.handleError(error, false);
            mainContent.innerHTML = '<div class="container" style="padding: 4rem 0;"><div class="card"><div class="card-body text-center"><i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--gaming-error); margin-bottom: 1rem;"></i><h3 class="mb-4">Failed to Load Admin Panel</h3><p class="text-secondary mb-4">There was an error loading the admin interface.</p><button class="btn btn-primary" onclick="app.showDashboardPage()">Return to Dashboard</button></div></div></div>';
        }
    }

    // Start real-time updates (placeholder for future WebSocket implementation)
    startRealTimeUpdates() {
        // For now, we'll use polling for updates
        setInterval(() => {
            if (auth.isAuthenticated()) {
                console.log('Real-time updates would be implemented here');
                // Future: WebSocket connection for real-time order updates
            }
        }, 30000); // Check every 30 seconds
    }

    // Scroll to a specific section
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Handle navigation clicks
    navigate(page) {
        switch(page) {
            case 'dashboard':
                this.showDashboardPage();
                break;
            case 'admin':
                this.showAdminPage();
                break;
            default:
                this.showLandingPage();
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Make classes available globally for onclick handlers
window.Pages = Pages;
window.Components = Components;