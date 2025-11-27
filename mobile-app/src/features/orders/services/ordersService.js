import axios from 'axios';
import { getAuthToken } from '../../dashboard/services/dashboardService';

const API_URL = 'http://192.168.10.51:3000/api';

const getOrders = async (filters = {}) => {
    try {
        const token = getAuthToken();
        const response = await axios.get(`${API_URL}/orders`, {
            params: filters,
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    } catch (error) {
        console.error('Get orders error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar órdenes' };
    }
};

const getOrderById = async (id) => {
    try {
        const token = getAuthToken();
        const response = await axios.get(`${API_URL}/orders/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    } catch (error) {
        console.error('Get order error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar orden' };
    }
};

const createOrder = async (orderData) => {
    try {
        const token = getAuthToken();
        const response = await axios.post(`${API_URL}/orders`, orderData, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    } catch (error) {
        console.error('Create order error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al crear orden' };
    }
};

const updateOrderStatus = async (id, status) => {
    try {
        const token = getAuthToken();
        const response = await axios.patch(`${API_URL}/orders/${id}`, { status }, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    } catch (error) {
        console.error('Update order status error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al actualizar orden' };
    }
};

export default {
    getOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
};
