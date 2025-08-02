// Authentication management
class Auth {
    constructor() {
        this.user = null;
        this.isLoading = true;
        this.listeners = [];
    }

    // Add listener for auth state changes
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Remove listener
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    // Notify all listeners of auth state change
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.user, this.isLoading));
    }

    // Check authentication status
    async checkAuth() {
        try {
            const response = await fetch('/api/auth/user');
            if (response.ok) {
                this.user = await response.json();
                this.isLoading = false;
                this.notifyListeners();
                return this.user;
            } else {
                this.user = null;
                this.isLoading = false;
                this.notifyListeners();
                return null;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.user = null;
            this.isLoading = false;
            this.notifyListeners();
            return null;
        }
    }

    // Login
    login() {
        window.location.href = '/api/login';
    }

    // Logout
    logout() {
        window.location.href = '/api/logout';
    }

    // Get current user
    getUser() {
        return this.user;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.user;
    }

    // Check if user is admin
    isAdmin() {
        return this.user && this.user.role === 'admin';
    }
}

// Global auth instance
window.auth = new Auth();