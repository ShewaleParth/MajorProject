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

    getForecasts: async () => {
        const response = await nodeApi.get('/forecasts');
        return response.data;
    },

    getForecastInsights: async () => {
        const response = await nodeApi.get('/forecasts/analytics/insights');
        return response.data;
    },

    getTransactions: async () => {
        const response = await nodeApi.get('/transactions');
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
