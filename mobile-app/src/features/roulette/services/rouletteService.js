import api from '../../../services/api';

const getSpinStatus = async () => {
    try {
        const response = await api.get('/roulette/status');
        return response.data;
    } catch (error) {
        console.error('Get spin status error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al obtener estado de ruleta' };
    }
};

const spin = async () => {
    try {
        const response = await api.post('/roulette/spin');
        return response.data;
    } catch (error) {
        console.error('Spin error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al girar la ruleta' };
    }
};

const grantSpin = async (userId, amount = 1) => {
    try {
        const response = await api.post('/roulette/grant', { userId, amount });
        return response.data;
    } catch (error) {
        console.error('Grant spin error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al conceder giros' };
    }
};

const getPrizes = async () => {
    try {
        const response = await api.get('/roulette/prizes');
        return response.data;
    } catch (error) {
        console.error('Get prizes error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al obtener premios' };
    }
};

const createPrize = async (prizeData) => {
    try {
        const response = await api.post('/roulette/prizes', prizeData);
        return response.data;
    } catch (error) {
        console.error('Create prize error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al crear premio' };
    }
};

const updatePrize = async (id, prizeData) => {
    try {
        const response = await api.put(`/roulette/prizes/${id}`, prizeData);
        return response.data;
    } catch (error) {
        console.error('Update prize error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al actualizar premio' };
    }
};

const deletePrize = async (id) => {
    try {
        const response = await api.delete(`/roulette/prizes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Delete prize error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al eliminar premio' };
    }
};

const getGrantHistory = async () => {
    try {
        const response = await api.get('/roulette/grants/history');
        return response.data;
    } catch (error) {
        console.error('Get grant history error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al obtener historial' };
    }
};

const getGrantHistoryByUser = async (userId) => {
    try {
        const response = await api.get(`/roulette/grants/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Get user grant history error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al obtener historial del usuario' };
    }
};

const getSpinLogs = async () => {
    try {
        const response = await api.get('/roulette/logs');
        return response.data;
    } catch (error) {
        console.error('Get spin logs error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al obtener logs de giros' };
    }
};

const getSpinLogsByUser = async (userId) => {
    try {
        const response = await api.get(`/roulette/logs/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Get user spin logs error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al obtener logs del usuario' };
    }
};

export default {
    getSpinStatus,
    spin,
    grantSpin,
    getPrizes,
    createPrize,
    updatePrize,
    deletePrize,
    getGrantHistory,
    getGrantHistoryByUser,
    getSpinLogs,
    getSpinLogsByUser,
};
