import api from '../../../services/api';

const getDailySummary = async (date) => {
    try {
        const dateParam = date || new Date().toISOString().split('T')[0];
        // The api instance already handles the token via interceptor
        const response = await api.get('/daily-summary', {
            params: { date: dateParam }
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
        const response = await api.get('/daily-expenses', {
            params: { date: dateParam }
        });
        return response.data;
    } catch (error) {
        console.error('Get daily expenses error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar gastos diarios' };
    }
};

const getTotalSales = async () => {
    try {
        const response = await api.get('/daily-summary/total-sales');
        return response.data;
    } catch (error) {
        console.error('Get total sales error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar ventas totales' };
    }
};

const getSummaryByRange = async (from, to) => {
    try {
        const response = await api.get('/daily-summary/range', {
            params: { from, to }
        });
        return response.data;
    } catch (error) {
        console.error('Get range summary error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar resumen por rango' };
    }
};

export default {
    getDailySummary,
    getDailyExpenses,
    getTotalSales,
    getSummaryByRange,
};
