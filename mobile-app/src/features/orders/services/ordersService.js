import api from '../../../services/api';

const getOrders = async (filters = {}) => {
    try {
        const response = await api.get('/orders', {
            params: filters
        });
        return response.data;
    } catch (error) {
        // Silently ignore cancelled requests (no token)
        if (error.silent || error.__CANCEL__) {
            return [];
        }
        console.error('Get orders error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar órdenes' };
    }
};

const getMyOrders = async () => {
    try {
        const response = await api.get('/orders');
        return response.data;
    } catch (error) {
        // Silently ignore cancelled requests (no token)
        if (error.silent || error.__CANCEL__) {
            return [];
        }
        console.error('Get my orders error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar mis órdenes' };
    }
};

const getOrderById = async (id) => {
    try {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    } catch (error) {
        console.error('Get order error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar orden' };
    }
};

const createOrder = async (orderData) => {
    try {
        const response = await api.post('/orders', orderData);
        return response.data;
    } catch (error) {
        console.error('Create order error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al crear orden' };
    }
};

const updateOrderStatus = async (id, status) => {
    try {
        const response = await api.patch(`/orders/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Update order status error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al actualizar orden' };
    }
};

const deleteOrder = async (id) => {
    try {
        const response = await api.delete(`/orders/${id}`);
        return response.data;
    } catch (error) {
        console.error('Delete order error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al eliminar orden' };
    }
};

export default {
    getOrders,
    getMyOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    deleteOrder,
};
