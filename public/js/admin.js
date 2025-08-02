// Admin pages and functionality
class AdminPages {
    
    // Render admin dashboard
    static async renderAdmin() {
        const user = auth.getUser();
        if (!user) {
            Components.showToast('Please login to access admin panel', 'warning');
            setTimeout(() => auth.login(), 1000);
            return '<div class="container"><p class="text-center">Redirecting to login...</p></div>';
        }
        
        if (user.role !== 'admin') {
            Components.showToast('Admin access required', 'error');
            setTimeout(() => window.location.href = '/', 1000);
            return '<div class="container"><p class="text-center">Access denied. Redirecting to dashboard...</p></div>';
        }

        return `
            <div class="admin-layout">
                ${this.renderAdminSidebar()}
                <div class="admin-content">
                    <div id="admin-content">
                        ${await this.renderAdminDashboard()}
                    </div>
                </div>
            </div>
        `;
    }

    // Render admin sidebar
    static renderAdminSidebar() {
        const menuItems = [
            { id: "dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
            { id: "orders", icon: "fas fa-shopping-cart", label: "Orders" },
            { id: "money-requests", icon: "fas fa-money-bill-wave", label: "Add Money Requests" },
            { id: "analytics", icon: "fas fa-chart-bar", label: "Analytics" },
            { id: "packages", icon: "fas fa-box", label: "Manage Packages" },
            { id: "games", icon: "fas fa-gamepad", label: "Manage Games" },
            { id: "settings", icon: "fas fa-cog", label: "Settings" },
        ];

        return `
            <div class="admin-sidebar">
                <div class="sidebar-menu">
                    ${menuItems.map(item => `
                        <div class="sidebar-item ${item.id === 'dashboard' ? 'active' : ''}" 
                             onclick="AdminPages.switchTab('${item.id}')" 
                             data-tab="${item.id}">
                            <i class="${item.icon}"></i>
                            <span>${item.label}</span>
                        </div>
                    `).join('')}
                    
                    <div class="sidebar-divider"></div>
                    
                    <div class="sidebar-item" onclick="auth.logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Switch admin tab
    static async switchTab(tabId) {
        // Update active sidebar item
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Load content
        const contentDiv = document.getElementById('admin-content');
        Components.showLoading(contentDiv);

        try {
            let content;
            switch (tabId) {
                case 'dashboard':
                    content = await this.renderAdminDashboard();
                    break;
                case 'orders':
                    content = await this.renderAdminOrders();
                    break;
                case 'money-requests':
                    content = await this.renderAdminMoneyRequests();
                    break;
                case 'analytics':
                    content = this.renderAdminAnalytics();
                    break;
                case 'packages':
                    content = this.renderManagePackages();
                    break;
                case 'games':
                    content = this.renderManageGames();
                    break;
                case 'settings':
                    content = this.renderAdminSettings();
                    break;
                default:
                    content = '<div class="text-center">Page not found</div>';
            }
            contentDiv.innerHTML = content;
        } catch (error) {
            Components.handleError(error, false);
            contentDiv.innerHTML = '<div class="text-center text-error">Failed to load content</div>';
        }
    }

    // Render admin dashboard
    static async renderAdminDashboard() {
        try {
            const stats = await api.getAdminStats();
            
            return `
                <div>
                    <h1 class="mb-8" style="font-size: 2rem; font-weight: bold;">Dashboard</h1>
                    
                    <div class="grid grid-4 mb-8">
                        <div class="card">
                            <div class="card-body flex justify-between items-center">
                                <div>
                                    <p class="text-secondary" style="font-size: 0.875rem;">Total Orders</p>
                                    <p class="font-bold" style="font-size: 2rem;">${stats.totalOrders || 0}</p>
                                </div>
                                <i class="fas fa-shopping-cart" style="color: var(--gaming-bright); font-size: 2rem;"></i>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-body flex justify-between items-center">
                                <div>
                                    <p class="text-secondary" style="font-size: 0.875rem;">Revenue</p>
                                    <p class="font-bold" style="font-size: 2rem;">৳${stats.totalRevenue || "0"}</p>
                                </div>
                                <i class="fas fa-dollar-sign" style="color: var(--gaming-success); font-size: 2rem;"></i>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-body flex justify-between items-center">
                                <div>
                                    <p class="text-secondary" style="font-size: 0.875rem;">Active Users</p>
                                    <p class="font-bold" style="font-size: 2rem;">${stats.activeUsers || 0}</p>
                                </div>
                                <i class="fas fa-users" style="color: var(--gaming-warning); font-size: 2rem;"></i>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-body flex justify-between items-center">
                                <div>
                                    <p class="text-secondary" style="font-size: 0.875rem;">Pending Orders</p>
                                    <p class="font-bold" style="font-size: 2rem;">${stats.pendingOrders || 0}</p>
                                </div>
                                <i class="fas fa-clock" style="color: var(--gaming-error); font-size: 2rem;"></i>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-body">
                            <h2 class="mb-4" style="font-size: 1.5rem; font-weight: bold;">Welcome to Admin Dashboard</h2>
                            <p class="text-secondary">
                                Use the sidebar to navigate through different sections. You can manage orders, 
                                approve add money requests, view analytics, and configure games and packages.
                            </p>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            Components.handleError(error, false);
            return '<div class="text-center text-error">Failed to load dashboard</div>';
        }
    }

    // Render admin orders
    static async renderAdminOrders() {
        try {
            const orders = await api.getAdminOrders();
            
            return `
                <div>
                    <h1 class="mb-8" style="font-size: 2rem; font-weight: bold;">Orders Management</h1>
                    
                    <div class="card">
                        <div class="card-body">
                            <div class="overflow-x-auto">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>User</th>
                                            <th>Game</th>
                                            <th>Package</th>
                                            <th>UID</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${orders && orders.length > 0 
                                            ? orders.map(order => Components.createOrderRow(order, true)).join('')
                                            : '<tr><td colspan="9" class="text-center text-secondary">No orders found</td></tr>'
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            Components.handleError(error, false);
            return '<div class="text-center text-error">Failed to load orders</div>';
        }
    }

    // Render admin money requests
    static async renderAdminMoneyRequests() {
        try {
            const requests = await api.getAdminAddMoneyRequests();
            
            return `
                <div>
                    <h1 class="mb-8" style="font-size: 2rem; font-weight: bold;">Add Money Requests</h1>
                    
                    <div class="card">
                        <div class="card-body">
                            <div class="overflow-x-auto">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Request ID</th>
                                            <th>User</th>
                                            <th>Amount</th>
                                            <th>Sender Number</th>
                                            <th>Transaction ID</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${requests && requests.length > 0 
                                            ? requests.map(request => Components.createAddMoneyRequestRow(request, true)).join('')
                                            : '<tr><td colspan="8" class="text-center text-secondary">No add money requests found</td></tr>'
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            Components.handleError(error, false);
            return '<div class="text-center text-error">Failed to load add money requests</div>';
        }
    }

    // Update order status
    static async updateOrderStatus(orderId, status) {
        try {
            await api.updateOrderStatus(orderId, status);
            Components.showToast(`Order ${status} successfully`, 'success');
            // Refresh orders list
            this.switchTab('orders');
        } catch (error) {
            Components.handleError(error);
        }
    }

    // Update add money request status
    static async updateAddMoneyRequestStatus(requestId, status) {
        try {
            await api.updateAddMoneyRequestStatus(requestId, status);
            Components.showToast(`Request ${status} successfully`, 'success');
            // Refresh requests list
            this.switchTab('money-requests');
        } catch (error) {
            Components.handleError(error);
        }
    }

    // Render analytics placeholder
    static renderAdminAnalytics() {
        return `
            <div>
                <h1 class="mb-8" style="font-size: 2rem; font-weight: bold;">Analytics</h1>
                <div class="card">
                    <div class="card-body text-center">
                        <i class="fas fa-chart-bar" style="font-size: 4rem; color: var(--gaming-bright); margin-bottom: 1rem;"></i>
                        <h3 class="mb-4">Analytics Dashboard</h3>
                        <p class="text-secondary">Detailed analytics and reporting features will be available here.</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Render manage packages placeholder
    static renderManagePackages() {
        return `
            <div>
                <h1 class="mb-8" style="font-size: 2rem; font-weight: bold;">Manage Packages</h1>
                <div class="card">
                    <div class="card-body text-center">
                        <i class="fas fa-box" style="font-size: 4rem; color: var(--gaming-warning); margin-bottom: 1rem;"></i>
                        <h3 class="mb-4">Package Management</h3>
                        <p class="text-secondary">Package editing and management features will be available here.</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Render manage games placeholder
    static renderManageGames() {
        return `
            <div>
                <h1 class="mb-8" style="font-size: 2rem; font-weight: bold;">Manage Games</h1>
                <div class="card">
                    <div class="card-body text-center">
                        <i class="fas fa-gamepad" style="font-size: 4rem; color: var(--gaming-success); margin-bottom: 1rem;"></i>
                        <h3 class="mb-4">Game Management</h3>
                        <p class="text-secondary">Game configuration and management features will be available here.</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Render admin settings placeholder
    static renderAdminSettings() {
        const user = auth.getUser();
        
        return `
            <div>
                <h1 class="mb-8" style="font-size: 2rem; font-weight: bold;">Settings</h1>
                <div class="grid grid-2">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Admin Profile</h3>
                        </div>
                        <div class="card-body">
                            ${user?.profileImageUrl ? `
                                <div class="text-center mb-4">
                                    <img src="${user.profileImageUrl}" alt="Admin Profile" class="user-avatar" style="width: 4rem; height: 4rem; margin: 0 auto;">
                                </div>
                            ` : ''}
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-input" value="${user?.email || ''}" readonly>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Role</label>
                                <input type="text" class="form-input" value="Administrator" readonly>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">System Settings</h3>
                        </div>
                        <div class="card-body text-center">
                            <i class="fas fa-cog" style="font-size: 4rem; color: var(--gaming-accent); margin-bottom: 1rem;"></i>
                            <p class="text-secondary">System configuration options will be available here.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Make AdminPages available globally
window.AdminPages = AdminPages;