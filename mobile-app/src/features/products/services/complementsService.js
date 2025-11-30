import api from '../../../services/api';

const complementsService = {
    async getComplements() {
        try {
            console.log('Fetching complements from API...');
            const response = await api.get('/complements');
            console.log('Complements API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in complementsService:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener complementos');
        }
    },

    async getComplementById(id) {
        try {
            const response = await api.get(`/complements/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al obtener complemento');
        }
    },
};

export default complementsService;
