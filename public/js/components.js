// Reusable UI components
class Components {
    
    // Show toast notification
    static showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add CSS for toast if not already present
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: var(--radius);
                    color: white;
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                }
                .toast-info { background: var(--gaming-bright); }
                .toast-success { background: var(--gaming-success); }
                .toast-warning { background: var(--gaming-warning); }
                .toast-error { background: var(--gaming-error); }
                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    static getToastIcon(type) {
        const icons = {
            info: 'info-circle',
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle'
        };
        return icons[type] || icons.info;
    }

    // Create modal
    static createModal(title, content, actions = []) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${actions.length > 0 ? `
                    <div class="modal-footer" style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: flex-end;">
                        ${actions.map(action => `<button class="btn ${action.class || 'btn-primary'}" onclick="${action.onclick}">${action.text}</button>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        
        document.getElementById('modal-container').appendChild(overlay);
        return overlay;
    }

    // Create game card
    static createGameCard(game, packages) {
        const gameIcons = {
            freefire: 'fas fa-fire color-orange',
            pubg: 'fas fa-crosshairs color-yellow',
            mobilelegends: 'fas fa-shield-alt color-blue',
            minecraft: 'fas fa-cube color-green',
            valorant: 'fas fa-bullseye color-red',
            roblox: 'fas fa-shapes color-purple'
        };

        const icon = gameIcons[game.name] || 'fas fa-gamepad';

        return `
            <div class="game-card" onclick="Pages.showGamePackages('${game.id}', '${game.displayName}', ${JSON.stringify(packages).replace(/"/g, '&quot;')})">
                <div class="game-icon">
                    <i class="${icon}"></i>
                </div>
                <h3 class="game-name">${game.displayName}</h3>
                <p class="game-currency">${game.currency}</p>
                <div class="package-list">
                    ${packages.slice(0, 3).map(pkg => `
                        <div class="package-item">
                            <span>${pkg.name}</span>
                            <span class="package-price">৳${pkg.price}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Create order table row
    static createOrderRow(order, isAdmin = false) {
        const statusBadges = {
            pending: 'badge-warning',
            completed: 'badge-success',
            cancelled: 'badge-error'
        };

        const adminActions = isAdmin && order.status === 'pending' ? `
            <div class="flex gap-2">
                <button class="btn btn-success" onclick="AdminPages.updateOrderStatus('${order.id}', 'completed')">
                    Complete
                </button>
                <button class="btn btn-error" onclick="AdminPages.updateOrderStatus('${order.id}', 'cancelled')">
                    Cancel
                </button>
            </div>
        ` : '';

        return `
            <tr>
                <td class="font-mono">#${order.id.slice(-8)}</td>
                ${isAdmin ? `<td>${order.userEmail}</td>` : ''}
                <td>${order.gameName}</td>
                <td>${order.packageName}</td>
                <td>${order.gameUid}</td>
                <td class="text-success font-bold">৳${order.amount}</td>
                <td><span class="badge ${statusBadges[order.status]}">${order.status}</span></td>
                <td class="text-secondary">${this.formatDate(order.createdAt)}</td>
                ${isAdmin ? `<td>${adminActions}</td>` : ''}
            </tr>
        `;
    }

    // Create add money request row
    static createAddMoneyRequestRow(request, isAdmin = false) {
        const statusBadges = {
            pending: 'badge-warning',
            approved: 'badge-success',
            rejected: 'badge-error'
        };

        const adminActions = isAdmin && request.status === 'pending' ? `
            <div class="flex gap-2">
                <button class="btn btn-success" onclick="AdminPages.updateAddMoneyRequestStatus('${request.id}', 'approved')">
                    Approve
                </button>
                <button class="btn btn-error" onclick="AdminPages.updateAddMoneyRequestStatus('${request.id}', 'rejected')">
                    Reject
                </button>
            </div>
        ` : '';

        return `
            <tr>
                <td class="font-mono">#${request.id.slice(-8)}</td>
                ${isAdmin ? `<td>${request.userEmail}</td>` : ''}
                <td class="text-success font-bold">৳${request.amount}</td>
                <td>${request.senderNumber}</td>
                <td class="font-mono">${request.transactionId}</td>
                <td><span class="badge ${statusBadges[request.status]}">${request.status}</span></td>
                <td class="text-secondary">${this.formatDate(request.createdAt)}</td>
                ${isAdmin ? `<td>${adminActions}</td>` : ''}
            </tr>
        `;
    }

    // Format date
    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Format time ago
    static formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr ago`;
        return `${Math.floor(diffInMinutes / 1440)} day ago`;
    }

    // Mask email for privacy
    static maskEmail(email) {
        if (!email) return "Anonymous";
        const [name, domain] = email.split('@');
        return `${name.slice(0, 3)}***@${domain}`;
    }

    // Show loading spinner
    static showLoading(container) {
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <span style="margin-left: 1rem;">Loading...</span>
            </div>
        `;
    }

    // Handle errors
    static handleError(error, showToast = true) {
        console.error('Error:', error);
        
        if (error.message.includes('401: Unauthorized')) {
            if (showToast) {
                this.showToast('You are logged out. Redirecting to login...', 'warning');
            }
            setTimeout(() => {
                window.location.href = '/api/login';
            }, 1000);
            return;
        }
        
        if (showToast) {
            this.showToast(error.message || 'An error occurred', 'error');
        }
    }
}