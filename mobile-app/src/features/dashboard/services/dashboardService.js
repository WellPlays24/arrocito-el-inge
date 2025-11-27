import axios from 'axios';

const API_URL = 'http://192.168.10.51:3000/api';

// Helper to get token from storage (will be improved with AsyncStorage later)
let authToken = null;

export const setAuthToken = (token) => {
    authToken = token;
};

export const getAuthToken = () => {
    return authToken;
};

const getDailySummary = async (date) => {
    try {
        const dateParam = date || new Date().toISOString().split('T')[0];
        const token = getAuthToken();
        const response = await axios.get(`${API_URL}/daily-summary`, {
            params: { date: dateParam },
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    } catch (error) {
        console.error('Get daily summary error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar resumen diario' };
    }
};

const getDailyExpenses = async (date) => {
    try {
        const dateParam = date || new Date().toISOString().split('T')[0];
        const token = getAuthToken();
        const response = await axios.get(`${API_URL}/daily-expenses`, {
            params: { date: dateParam },
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    } catch (error) {
        console.error('Get daily expenses error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar gastos diarios' };
    }
};

export default {
    getDailySummary,
    getDailyExpenses,
};
