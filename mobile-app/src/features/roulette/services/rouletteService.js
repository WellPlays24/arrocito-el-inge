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

export default {
    getSpinStatus,
    spin,
    grantSpin,
};
