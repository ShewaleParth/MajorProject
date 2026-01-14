import axios from 'axios';

// Ensure this matches your Python backend URL
const API_BASE_URL = 'http://localhost:5001/api/supplier';

export const riskApi = {
    getRiskOverview: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/risk-overview`);
            return response.data;
        } catch (error) {
            console.error("Error fetching risk overview:", error);
            throw error;
        }
    },
    predictRisk: async (orderData) => {
        try {
            // Mapping frontend names to backend expected keys if necessary
            const response = await axios.post(`${API_BASE_URL}/predict-risk`, orderData);
            return response.data;
        } catch (error) {
            console.error("Error predicting risk:", error);
            throw error;
        }
    },
    getSupplierHistory: async (supplierName) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/history/${supplierName}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching supplier history:", error);
            throw error;
        }
    }
};
