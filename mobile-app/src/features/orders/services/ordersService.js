import axios from 'axios';
import { getAuthToken } from '../../dashboard/services/dashboardService';
import api from '../../../services/api';

const getOrders = async (filters = {}) => {
    try {
        const token = getAuthToken();
        const response = await api.get('/orders', {
            params: filters,
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    } catch (error) {
        console.error('Get orders error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar órdenes' };
    }
};

const getMyOrders = async () => {
    try {
        const token = getAuthToken();
        const response = await api.get('/orders', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    } catch (error) {
        console.error('Get my orders error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar mis órdenes' };
    }
};

const getOrderById = async (id) => {
    try {
        const token = getAuthToken();
        const response = await api.get(`/orders/${id}`, {
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
        const response = await api.post('/orders', orderData, {
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
        const response = await api.patch(`/orders/${id}`, { status }, {
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
    getMyOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
};
