// API client for making requests
class ApiClient {
    constructor() {
        this.baseURL = '';
    }

    // Generic request method
    async request(method, endpoint, data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, options);
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('401: Unauthorized');
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API ${method} ${endpoint} failed:`, error);
            throw error;
        }
    }

    // GET request
    async get(endpoint) {
        return this.request('GET', endpoint);
    }

    // POST request
    async post(endpoint, data) {
        return this.request('POST', endpoint, data);
    }

    // PATCH request
    async patch(endpoint, data) {
        return this.request('PATCH', endpoint, data);
    }

    // DELETE request
    async delete(endpoint) {
        return this.request('DELETE', endpoint);
    }

    // Game-related API calls
    async getGames() {
        return this.get('/api/games');
    }

    async getPackages(gameId) {
        return this.get(`/api/games/${gameId}/packages`);
    }

    // Order-related API calls
    async createOrder(orderData) {
        return this.post('/api/orders', orderData);
    }

    async getOrders() {
        return this.get('/api/orders');
    }

    async getRecentOrders() {
        return this.get('/api/orders/recent');
    }

    // Add money request API calls
    async createAddMoneyRequest(requestData) {
        return this.post('/api/add-money-requests', requestData);
    }

    async getAddMoneyRequests() {
        return this.get('/api/add-money-requests');
    }

    // Admin API calls
    async getAdminOrders() {
        return this.get('/api/admin/orders');
    }

    async updateOrderStatus(orderId, status) {
        return this.patch(`/api/admin/orders/${orderId}`, { status });
    }

    async getAdminAddMoneyRequests() {
        return this.get('/api/admin/add-money-requests');
    }

    async updateAddMoneyRequestStatus(requestId, status) {
        return this.patch(`/api/admin/add-money-requests/${requestId}`, { status });
    }

    async getAdminStats() {
        return this.get('/api/admin/stats');
    }
}

// Global API client instance
window.api = new ApiClient();