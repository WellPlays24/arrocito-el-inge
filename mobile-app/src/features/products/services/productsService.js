import api from '../../../services/api';

const getProducts = async () => {
    try {
        const response = await api.get('/products');
        return response.data;
    } catch (error) {
        console.error('Get products error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar productos' };
    }
};

const getComplements = async () => {
    try {
        const response = await api.get('/complements');
        return response.data;
    } catch (error) {
        console.error('Get complements error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar complementos' };
    }
};

const deleteProduct = async (id) => {
    try {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Delete product error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al eliminar producto' };
    }
};

export default {
    getProducts,
    getComplements,
    deleteProduct,
};
