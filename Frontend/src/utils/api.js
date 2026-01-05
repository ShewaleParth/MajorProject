import axios from 'axios';

// Using Vite proxies defined in vite.config.js
const NODE_API_URL = '/api';
const PYTHON_API_URL = '/ml-api';

const nodeApi = axios.create({ baseURL: NODE_API_URL });
const pythonApi = axios.create({ baseURL: PYTHON_API_URL });

nodeApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const api = {
    // Node.js Backend
    getProducts: async (params) => {
        const response = await nodeApi.get('/products', { params });
        return response.data;
    },

    createProduct: async (productData) => {
        const response = await nodeApi.post('/products', productData);
        return response.data;
    },

    bulkUpload: async (data) => {
        const response = await nodeApi.post('/products/bulk', data);
        return response.data;
    },

    getForecasts: async () => {
        const response = await nodeApi.get('/forecasts');
        return response.data;
    },

    getForecastInsights: async () => {
        const response = await nodeApi.get('/forecasts/analytics/insights');
        return response.data;
    },

    getTransactions: async (params) => {
        const response = await nodeApi.get('/transactions', { params });
        return response.data;
    },

    getDashboardStats: async () => {
        const response = await nodeApi.get('/dashboard/stats');
        return response.data;
    },

    getTopSKUs: async () => {
        const response = await nodeApi.get('/dashboard/top-skus');
        return response.data;
    },

    getDepots: async () => {
        const response = await nodeApi.get('/depots');
        return response.data;
    },

    createDepot: async (depotData) => {
        const response = await nodeApi.post('/depots', depotData);
        return response.data;
    },

    getDepotDetails: async (depotId) => {
        const response = await nodeApi.get(`/depots/${depotId}/details`);
        return response.data;
    },

    getNetworkMetrics: async () => {
        const response = await nodeApi.get('/depots/network/metrics');
        return response.data;
    },

    getSalesTrend: async (params) => {
        const response = await nodeApi.get('/dashboard/sales-trend', { params });
        return response.data;
    },

    updateProduct: async (id, productData) => {
        const response = await nodeApi.put(`/products/${id}`, productData);
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await nodeApi.delete(`/products/${id}`);
        return response.data;
    },

    // Python AI Backend
    predictCustom: async (data) => {
        const response = await pythonApi.post('/predict/custom', data);
        return response.data;
    },

    runScenario: async (data) => {
        const response = await pythonApi.post('/scenario-planning', data);
        return response.data;
    },

    getAIStatus: async () => {
        const response = await pythonApi.get('/status');
        return response.data;
    }
};
