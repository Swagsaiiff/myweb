// Page management and rendering
class Pages {
    
    // Render landing page for logged-out users
    static renderLanding() {
        return `
            <div class="hero">
                <div class="container">
                    <h1 class="hero-title">
                        Top-up Your <span style="color: var(--gaming-success);">Gaming</span> Experience
                    </h1>
                    <p class="hero-subtitle">
                        Fast, secure, and reliable game currency top-ups for all your favorite games. 
                        Join thousands of gamers who trust GameTopup+ for their gaming needs.
                    </p>
                    <button class="btn btn-primary" onclick="auth.login()" style="font-size: 1.125rem; padding: 1rem 2rem;">
                        <i class="fas fa-sign-in-alt"></i>
                        Get Started Now
                    </button>
                </div>
            </div>

            <section class="section" style="background: var(--gaming-blue);">
                <div class="container">
                    <h2 class="text-center mb-8" style="font-size: 2rem; font-weight: bold;">Why Choose GameTopup+?</h2>
                    <div class="grid grid-3">
                        <div class="card">
                            <div class="card-body text-center">
                                <i class="fas fa-bolt" style="font-size: 3rem; color: var(--gaming-warning); margin-bottom: 1rem;"></i>
                                <h3 class="mb-2" style="font-size: 1.25rem; font-weight: bold;">Instant Delivery</h3>
                                <p class="text-secondary">Get your game currency delivered instantly after payment confirmation</p>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-body text-center">
                                <i class="fas fa-shield-alt" style="font-size: 3rem; color: var(--gaming-success); margin-bottom: 1rem;"></i>
                                <h3 class="mb-2" style="font-size: 1.25rem; font-weight: bold;">100% Secure</h3>
                                <p class="text-secondary">Advanced security measures to protect your account and transactions</p>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-body text-center">
                                <i class="fas fa-headset" style="font-size: 3rem; color: var(--gaming-bright); margin-bottom: 1rem;"></i>
                                <h3 class="mb-2" style="font-size: 1.25rem; font-weight: bold;">24/7 Support</h3>
                                <p class="text-secondary">Round-the-clock customer support to help you with any issues</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="section">
                <div class="container">
                    <h2 class="text-center mb-8" style="font-size: 2rem; font-weight: bold;">Supported Games</h2>
                    <div class="grid grid-3">
                        ${this.getSupportedGamesPreview()}
                    </div>
                </div>
            </section>

            <footer style="background: var(--gaming-blue); border-top: 1px solid var(--gaming-accent); padding: 2rem 0;">
                <div class="container text-center">
                    <div class="flex items-center justify-center mb-4">
                        <i class="fas fa-gamepad" style="color: var(--gaming-bright); font-size: 2rem; margin-right: 0.5rem;"></i>
                        <span style="font-size: 1.5rem; font-weight: bold;">GameTopup+</span>
                    </div>
                    <p class="text-secondary">&copy; 2024 GameTopup+. All rights reserved.</p>
                </div>
            </footer>
        `;
    }

    // Render main dashboard for logged-in users
    static async renderDashboard() {
        try {
            const [games, recentOrders] = await Promise.all([
                api.getGames(),
                api.getRecentOrders()
            ]);

            const user = auth.getUser();
            
            return `
                <div class="hero" style="padding: 3rem 0;">
                    <div class="container">
                        <h1 class="hero-title" style="font-size: 2.5rem;">
                            Top-up Your <span style="color: var(--gaming-success);">Gaming</span> Experience
                        </h1>
                        <p class="hero-subtitle">Fast, secure, and reliable game currency top-ups for all your favorite games</p>
                        <div class="flex justify-center mt-6">
                            <div class="card" style="background: rgba(0,0,0,0.3); backdrop-filter: blur(10px);">
                                <div class="card-body flex items-center gap-4">
                                    <i class="fas fa-wallet text-success" style="font-size: 1.5rem;"></i>
                                    <span class="text-secondary">Balance:</span>
                                    <span class="font-bold text-success" style="font-size: 1.25rem;">৳${user?.balance || "0"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <section class="section">
                    <div class="container">
                        <h2 class="text-center mb-8" style="font-size: 2rem; font-weight: bold;">Choose Your Game</h2>
                        <div class="grid grid-3" id="games-grid">
                            ${await this.renderGamesGrid(games)}
                        </div>
                    </div>
                </section>

                ${this.renderRecentOrders(recentOrders)}
                ${this.renderWalletSection()}
                ${this.renderAccountManagement()}
                ${await this.renderOrderHistory()}
                ${this.renderFooter()}
            `;
        } catch (error) {
            Components.handleError(error, false);
            return `
                <div class="container" style="padding: 4rem 0;">
                    <div class="text-center">
                        <h2>Welcome to GameTopup+</h2>
                        <p class="text-secondary">Loading your dashboard...</p>
                    </div>
                </div>
            `;
        }
    }

    // Render games grid
    static async renderGamesGrid(games) {
        if (!games || games.length === 0) {
            return '<div class="text-center text-secondary">No games available</div>';
        }

        const gamesWithPackages = await Promise.all(
            games.map(async (game) => {
                try {
                    const packages = await api.getPackages(game.id);
                    return { ...game, packages };
                } catch (error) {
                    console.error(`Failed to load packages for ${game.name}:`, error);
                    return { ...game, packages: [] };
                }
            })
        );

        return gamesWithPackages.map(game => 
            Components.createGameCard(game, game.packages)
        ).join('');
    }

    // Show game packages modal
    static showGamePackages(gameId, gameName, packages) {
        if (!auth.isAuthenticated()) {
            Components.showToast('Please login to make a purchase', 'warning');
            return;
        }

        const content = `
            <div class="mb-4">
                <h4 style="font-size: 1.25rem; margin-bottom: 1rem;">${gameName} Packages</h4>
                <div class="grid grid-1 gap-4">
                    ${packages.map(pkg => `
                        <div class="card" style="cursor: pointer;" onclick="Pages.showOrderModal('${gameId}', '${gameName}', '${pkg.id}', '${pkg.name}', '${pkg.price}')">
                            <div class="card-body flex justify-between items-center">
                                <div>
                                    <h5 style="font-weight: bold;">${pkg.name}</h5>
                                    <p class="text-secondary" style="font-size: 0.875rem;">${pkg.amount} items</p>
                                </div>
                                <span class="text-success font-bold" style="font-size: 1.25rem;">৳${pkg.price}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        Components.createModal(`${gameName} Packages`, content);
    }

    // Show order confirmation modal
    static showOrderModal(gameId, gameName, packageId, packageName, price) {
        const content = `
            <form id="order-form" onsubmit="Pages.submitOrder(event, '${gameId}', '${packageId}')">
                <div class="form-group">
                    <label class="form-label">Game</label>
                    <input type="text" class="form-input" value="${gameName}" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label">Package</label>
                    <input type="text" class="form-input" value="${packageName} - ৳${price}" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label">Game UID *</label>
                    <input type="text" id="game-uid" class="form-input" placeholder="Enter your game UID" required>
                </div>
                <div class="card" style="background: var(--gaming-dark); margin: 1rem 0;">
                    <div class="card-body flex justify-between items-center">
                        <span>Total Amount:</span>
                        <span class="text-success font-bold" style="font-size: 1.25rem;">৳${price}</span>
                    </div>
                </div>
                <button type="submit" class="btn btn-success" style="width: 100%; padding: 0.75rem;">
                    <i class="fas fa-shopping-cart"></i>
                    Place Order
                </button>
            </form>
        `;

        Components.createModal('Place Order', content);
    }

    // Submit order
    static async submitOrder(event, gameId, packageId) {
        event.preventDefault();
        
        const gameUid = document.getElementById('game-uid').value.trim();
        if (!gameUid) {
            Components.showToast('Please enter your game UID', 'warning');
            return;
        }

        try {
            const submitButton = event.target.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...';

            await api.createOrder({
                gameId,
                packageId,
                gameUid
            });

            Components.showToast('Order placed successfully!', 'success');
            document.querySelector('.modal-overlay').remove();
            
            // Refresh page to update balance and order history
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            Components.handleError(error);
            const submitButton = event.target.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-shopping-cart"></i> Place Order';
        }
    }

    // Render recent orders section
    static renderRecentOrders(orders) {
        return `
            <section class="section" style="background: var(--gaming-blue);">
                <div class="container">
                    <h2 class="text-center mb-8" style="font-size: 2rem; font-weight: bold;">Recent Orders</h2>
                    <div class="card">
                        <div class="card-body">
                            <div class="overflow-x-auto">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Game</th>
                                            <th>Package</th>
                                            <th>Status</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${orders && orders.length > 0 
                                            ? orders.map(order => `
                                                <tr>
                                                    <td>${Components.maskEmail(order.userEmail)}</td>
                                                    <td>${order.gameName}</td>
                                                    <td>${order.packageName}</td>
                                                    <td><span class="badge badge-${order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'error'}">${order.status}</span></td>
                                                    <td class="text-secondary">${Components.formatTimeAgo(order.createdAt)}</td>
                                                </tr>
                                            `).join('')
                                            : '<tr><td colspan="5" class="text-center text-secondary">No recent orders found</td></tr>'
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    // Render account management section
    static renderAccountManagement() {
        const user = auth.getUser();
        
        return `
            <section id="account" class="section">
                <div class="container">
                    <h2 class="text-center mb-8" style="font-size: 2rem; font-weight: bold;">Account Management</h2>
                    <div class="grid grid-2">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title flex items-center">
                                    <i class="fas fa-user text-bright" style="margin-right: 0.5rem;"></i>
                                    Profile Information
                                </h3>
                            </div>
                            <div class="card-body">
                                <form id="profile-form" onsubmit="Pages.updateProfile(event)">
                                    <div class="form-group">
                                        <label class="form-label">Profile Picture</label>
                                        <div class="flex items-center gap-4 mb-4">
                                            ${user?.profileImageUrl ? `
                                                <img src="${user.profileImageUrl}" alt="Profile" class="user-avatar" style="width: 4rem; height: 4rem;">
                                            ` : `
                                                <div style="width: 4rem; height: 4rem; background: var(--gaming-accent); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                                    <i class="fas fa-user" style="font-size: 2rem; color: var(--text-secondary);"></i>
                                                </div>
                                            `}
                                            <div>
                                                <p class="text-secondary" style="font-size: 0.875rem;">Profile picture is managed by your login provider</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Email Address</label>
                                        <input type="email" class="form-input" value="${user?.email || ''}" readonly>
                                        <p class="text-secondary" style="font-size: 0.875rem; margin-top: 0.25rem;">Email cannot be changed</p>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">First Name</label>
                                        <input type="text" id="first-name" class="form-input" value="${user?.firstName || ''}" placeholder="Enter first name">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Last Name</label>
                                        <input type="text" id="last-name" class="form-input" value="${user?.lastName || ''}" placeholder="Enter last name">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Account Role</label>
                                        <input type="text" class="form-input" value="${user?.role === 'admin' ? 'Administrator' : 'User'}" readonly>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Member Since</label>
                                        <input type="text" class="form-input" value="${user?.createdAt ? Components.formatDate(user.createdAt) : 'Unknown'}" readonly>
                                    </div>
                                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                                        <i class="fas fa-save"></i>
                                        Update Profile
                                    </button>
                                </form>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title flex items-center">
                                    <i class="fas fa-chart-line text-success" style="margin-right: 0.5rem;"></i>
                                    Account Statistics
                                </h3>
                            </div>
                            <div class="card-body">
                                <div id="account-stats">
                                    ${this.renderAccountStats()}
                                </div>
                                
                                <div class="mt-6">
                                    <h4 class="font-bold mb-4">Quick Actions</h4>
                                    <div class="grid grid-1 gap-3">
                                        <button class="btn btn-ghost" onclick="document.getElementById('wallet').scrollIntoView({behavior: 'smooth'})">
                                            <i class="fas fa-plus"></i>
                                            Add Money to Wallet
                                        </button>
                                        <button class="btn btn-ghost" onclick="document.getElementById('orders').scrollIntoView({behavior: 'smooth'})">
                                            <i class="fas fa-history"></i>
                                            View Order History
                                        </button>
                                        <button class="btn btn-ghost" onclick="Pages.downloadAccountData()">
                                            <i class="fas fa-download"></i>
                                            Download Account Data
                                        </button>
                                        <button class="btn btn-error" onclick="Pages.confirmDeleteAccount()">
                                            <i class="fas fa-trash"></i>
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    // Render account statistics
    static renderAccountStats() {
        return `
            <div id="stats-loading" class="loading">
                <div class="spinner"></div>
            </div>
            <script>
                // Load account stats asynchronously
                (async function() {
                    try {
                        const orders = await api.getOrders();
                        const totalOrders = orders.length;
                        const completedOrders = orders.filter(o => o.status === 'completed').length;
                        const totalSpent = orders.filter(o => o.status === 'completed')
                            .reduce((sum, o) => sum + parseFloat(o.amount), 0);
                        
                        document.getElementById('stats-loading').innerHTML = \`
                            <div class="grid grid-2 gap-4">
                                <div style="text-align: center; padding: 1rem; background: var(--gaming-dark); border-radius: var(--radius);">
                                    <div style="font-size: 2rem; font-weight: bold; color: var(--gaming-bright);">\${totalOrders}</div>
                                    <div style="color: var(--text-secondary); font-size: 0.875rem;">Total Orders</div>
                                </div>
                                <div style="text-align: center; padding: 1rem; background: var(--gaming-dark); border-radius: var(--radius);">
                                    <div style="font-size: 2rem; font-weight: bold; color: var(--gaming-success);">৳\${totalSpent.toFixed(2)}</div>
                                    <div style="color: var(--text-secondary); font-size: 0.875rem;">Total Spent</div>
                                </div>
                                <div style="text-align: center; padding: 1rem; background: var(--gaming-dark); border-radius: var(--radius);">
                                    <div style="font-size: 2rem; font-weight: bold; color: var(--gaming-warning);">\${completedOrders}</div>
                                    <div style="color: var(--text-secondary); font-size: 0.875rem;">Completed</div>
                                </div>
                                <div style="text-align: center; padding: 1rem; background: var(--gaming-dark); border-radius: var(--radius);">
                                    <div style="font-size: 2rem; font-weight: bold; color: var(--gaming-bright);">৳\${auth.getUser()?.balance || '0'}</div>
                                    <div style="color: var(--text-secondary); font-size: 0.875rem;">Current Balance</div>
                                </div>
                            </div>
                        \`;
                    } catch (error) {
                        document.getElementById('stats-loading').innerHTML = '<p class="text-center text-secondary">Unable to load statistics</p>';
                    }
                })();
            </script>
        `;
    }

    // Update user profile
    static async updateProfile(event) {
        event.preventDefault();
        
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();

        if (!firstName && !lastName) {
            Components.showToast('Please enter at least your first name', 'warning');
            return;
        }

        try {
            const submitButton = event.target.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

            await api.patch('/api/auth/profile', {
                firstName,
                lastName
            });

            Components.showToast('Profile updated successfully!', 'success');
            
            // Refresh auth to get updated user data
            await auth.checkAuth();

        } catch (error) {
            Components.handleError(error);
        } finally {
            const submitButton = event.target.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-save"></i> Update Profile';
        }
    }

    // Download account data
    static async downloadAccountData() {
        try {
            const user = auth.getUser();
            const orders = await api.getOrders();
            const addMoneyRequests = await api.get('/api/add-money-requests');
            
            const accountData = {
                profile: {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    balance: user.balance,
                    role: user.role,
                    createdAt: user.createdAt
                },
                orders: orders,
                addMoneyRequests: addMoneyRequests,
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(accountData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gametopup-account-${user.email}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            Components.showToast('Account data downloaded successfully!', 'success');
            
        } catch (error) {
            Components.handleError(error);
        }
    }

    // Confirm account deletion
    static confirmDeleteAccount() {
        const content = `
            <div class="text-center">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--gaming-error); margin-bottom: 1rem;"></i>
                <h3 class="mb-4" style="color: var(--gaming-error);">Delete Account</h3>
                <p class="text-secondary mb-4">
                    This action cannot be undone. All your data including order history, 
                    account balance, and profile information will be permanently deleted.
                </p>
                <p class="mb-6" style="font-weight: bold;">
                    Current Balance: ৳${auth.getUser()?.balance || '0'}
                </p>
                <div class="form-group">
                    <label class="form-label">Type "DELETE" to confirm:</label>
                    <input type="text" id="delete-confirmation" class="form-input" placeholder="DELETE">
                </div>
            </div>
        `;

        const actions = [
            {
                text: 'Cancel',
                class: 'btn-ghost',
                onclick: 'this.closest(".modal-overlay").remove()'
            },
            {
                text: 'Delete Account',
                class: 'btn-error',
                onclick: 'Pages.executeAccountDeletion()'
            }
        ];

        Components.createModal('Confirm Account Deletion', content, actions);
    }

    // Execute account deletion
    static async executeAccountDeletion() {
        const confirmation = document.getElementById('delete-confirmation').value;
        
        if (confirmation !== 'DELETE') {
            Components.showToast('Please type "DELETE" to confirm', 'warning');
            return;
        }

        try {
            await api.delete('/api/auth/profile');
            Components.showToast('Account deleted successfully', 'success');
            
            // Close modal and logout
            document.querySelector('.modal-overlay').remove();
            setTimeout(() => {
                auth.logout();
            }, 2000);
            
        } catch (error) {
            Components.handleError(error);
        }
    }

    // Render wallet section
    static renderWalletSection() {
        const user = auth.getUser();
        
        return `
            <section id="wallet" class="section">
                <div class="container">
                    <h2 class="text-center mb-8" style="font-size: 2rem; font-weight: bold;">Wallet Management</h2>
                    <div class="grid grid-2">
                        <div class="card">
                            <div class="card-body">
                                <h3 class="mb-4 flex items-center">
                                    <i class="fas fa-wallet text-success" style="margin-right: 0.5rem;"></i>
                                    Current Balance
                                </h3>
                                <div class="text-center">
                                    <div class="text-success font-bold mb-2" style="font-size: 2.5rem;">৳${user?.balance || "0"}</div>
                                    <p class="text-secondary">Available for top-ups</p>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-body">
                                <h3 class="mb-4 flex items-center">
                                    <i class="fas fa-plus" style="color: var(--gaming-bright); margin-right: 0.5rem;"></i>
                                    Add Money
                                </h3>
                                <form id="add-money-form" onsubmit="Pages.submitAddMoneyRequest(event)">
                                    <div class="form-group">
                                        <label class="form-label">Amount</label>
                                        <input type="number" id="amount" class="form-input" placeholder="Enter amount" min="10" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Sender Number</label>
                                        <input type="tel" id="sender-number" class="form-input" placeholder="01xxxxxxxxx" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Transaction ID</label>
                                        <input type="text" id="transaction-id" class="form-input" placeholder="Enter transaction ID" required>
                                    </div>
                                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                                        <i class="fas fa-paper-plane"></i>
                                        Submit Request
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    // Submit add money request
    static async submitAddMoneyRequest(event) {
        event.preventDefault();
        
        const amount = document.getElementById('amount').value;
        const senderNumber = document.getElementById('sender-number').value;
        const transactionId = document.getElementById('transaction-id').value;

        if (parseFloat(amount) < 10) {
            Components.showToast('Minimum amount is ৳10', 'warning');
            return;
        }

        try {
            const submitButton = event.target.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            await api.createAddMoneyRequest({
                amount,
                senderNumber,
                transactionId
            });

            Components.showToast('Add money request submitted successfully!', 'success');
            event.target.reset();

        } catch (error) {
            Components.handleError(error);
        } finally {
            const submitButton = event.target.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Request';
        }
    }

    // Render order history
    static async renderOrderHistory() {
        try {
            const orders = await api.getOrders();
            
            return `
                <section id="orders" class="section" style="background: var(--gaming-blue);">
                    <div class="container">
                        <h2 class="text-center mb-8" style="font-size: 2rem; font-weight: bold;">Order History</h2>
                        <div class="card">
                            <div class="card-body">
                                <div class="overflow-x-auto">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Game</th>
                                                <th>Package</th>
                                                <th>UID</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${orders && orders.length > 0 
                                                ? orders.map(order => Components.createOrderRow(order)).join('')
                                                : '<tr><td colspan="7" class="text-center text-secondary">No orders found</td></tr>'
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            `;
        } catch (error) {
            Components.handleError(error, false);
            return `
                <section id="orders" class="section" style="background: var(--gaming-blue);">
                    <div class="container">
                        <h2 class="text-center mb-8" style="font-size: 2rem; font-weight: bold;">Order History</h2>
                        <div class="card">
                            <div class="card-body text-center text-secondary">
                                <p>Unable to load order history</p>
                            </div>
                        </div>
                    </div>
                </section>
            `;
        }
    }

    // Render footer
    static renderFooter() {
        return `
            <footer style="background: var(--gaming-blue); border-top: 1px solid var(--gaming-accent); padding: 2rem 0;">
                <div class="container">
                    <div class="grid grid-4">
                        <div>
                            <div class="flex items-center mb-4">
                                <i class="fas fa-gamepad" style="color: var(--gaming-bright); font-size: 2rem; margin-right: 0.5rem;"></i>
                                <span style="font-size: 1.5rem; font-weight: bold;">GameTopup+</span>
                            </div>
                            <p class="text-secondary">Fast, secure, and reliable game currency top-ups for all your favorite games.</p>
                        </div>
                        <div>
                            <h4 class="font-bold mb-4">Quick Links</h4>
                            <ul style="list-style: none; padding: 0;">
                                <li style="margin-bottom: 0.5rem;"><a href="#" class="text-secondary hover:text-primary">Dashboard</a></li>
                                <li style="margin-bottom: 0.5rem;"><a href="#orders" class="text-secondary hover:text-primary">Order History</a></li>
                                <li style="margin-bottom: 0.5rem;"><a href="#wallet" class="text-secondary hover:text-primary">Wallet</a></li>
                                <li style="margin-bottom: 0.5rem;"><a href="#" class="text-secondary hover:text-primary">Profile</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 class="font-bold mb-4">Support</h4>
                            <ul style="list-style: none; padding: 0;">
                                <li style="margin-bottom: 0.5rem;"><a href="#" class="text-secondary hover:text-primary">Help Center</a></li>
                                <li style="margin-bottom: 0.5rem;"><a href="#" class="text-secondary hover:text-primary">FAQs</a></li>
                                <li style="margin-bottom: 0.5rem;"><a href="#" class="text-secondary hover:text-primary">Contact Us</a></li>
                                <li style="margin-bottom: 0.5rem;"><a href="#" class="text-secondary hover:text-primary">Terms of Service</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 class="font-bold mb-4">Connect</h4>
                            <div class="flex gap-4">
                                <a href="#" class="text-secondary hover:text-primary"><i class="fab fa-facebook" style="font-size: 1.5rem;"></i></a>
                                <a href="#" class="text-secondary hover:text-primary"><i class="fab fa-twitter" style="font-size: 1.5rem;"></i></a>
                                <a href="#" class="text-secondary hover:text-primary"><i class="fab fa-discord" style="font-size: 1.5rem;"></i></a>
                            </div>
                        </div>
                    </div>
                    <div style="border-top: 1px solid var(--gaming-accent); margin-top: 2rem; padding-top: 2rem; text-align: center;">
                        <p class="text-secondary">&copy; 2024 GameTopup+. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        `;
    }

    // Get supported games preview for landing page
    static getSupportedGamesPreview() {
        const games = [
            { name: "Free Fire", icon: "🔥" },
            { name: "PUBG Mobile", icon: "🎯" },
            { name: "Mobile Legends", icon: "🛡️" },
            { name: "Minecraft", icon: "🧊" },
            { name: "Valorant", icon: "🎯" },
            { name: "Roblox", icon: "🎮" },
        ];

        return games.map(game => `
            <div class="card text-center">
                <div class="card-body">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">${game.icon}</div>
                    <h3 class="font-bold">${game.name}</h3>
                </div>
            </div>
        `).join('');
    }
}