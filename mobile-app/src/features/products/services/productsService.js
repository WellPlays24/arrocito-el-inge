import axios from 'axios';

const API_URL = 'http://192.168.10.51:3000/api';

const getProducts = async () => {
    try {
        const response = await axios.get(`${API_URL}/products`);
        return response.data;
    } catch (error) {
        console.error('Get products error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar productos' };
    }
};

const getComplements = async () => {
    try {
        const response = await axios.get(`${API_URL}/complements`);
        return response.data;
    } catch (error) {
        console.error('Get complements error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar complementos' };
    }
};

export default {
    getProducts,
    getComplements,
};
