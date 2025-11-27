import axios from 'axios';
import { getAuthToken } from '../../dashboard/services/dashboardService';

const API_URL = 'http://192.168.10.51:3000/api';

const getUsers = async () => {
    try {
        const token = getAuthToken();
        const response = await axios.get(`${API_URL}/users`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    } catch (error) {
        console.error('Get users error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar usuarios' };
    }
};

const getUserById = async (id) => {
    try {
        const token = getAuthToken();
        const response = await axios.get(`${API_URL}/users/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return response.data;
    } catch (error) {
        console.error('Get user error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar usuario' };
    }
};

const getCustomers = async () => {
    try {
        const token = getAuthToken();
        const response = await axios.get(`${API_URL}/users`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        // Filter out admin users to get only customers
        const customers = response.data.filter(user => user.role !== 'admin');
        return customers;
    } catch (error) {
        console.error('Get customers error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error al cargar clientes' };
    }
};

export default {
    getUsers,
    getUserById,
    getCustomers,
};
