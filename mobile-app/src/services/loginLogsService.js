import api from '../../../services/api';

const getLoginLogs = async () => {
    try {
        const response = await api.get('/login-logs');
        return response.data;
    } catch (error) {
        console.error('Get login logs error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al obtener logs de login' };
    }
};

const getLoginLogsByUser = async (userId) => {
    try {
        const response = await api.get(`/login-logs/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Get user login logs error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al obtener logs del usuario' };
    }
};

export default {
    getLoginLogs,
    getLoginLogsByUser,
};
