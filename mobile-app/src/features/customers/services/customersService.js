import api from '../../../services/api';

const customersService = {
    // Get all customers (users with role='client')
    getCustomers: async () => {
        try {
            const response = await api.get('/users');
            // Filter only clients
            const customers = response.data.filter(user => user.role === 'client');
            return customers;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al cargar clientes');
        }
    },

    // Get customer by ID
    getCustomerById: async (id) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al cargar cliente');
        }
    },

    // Create new customer
    createCustomer: async (customerData) => {
        try {
            const response = await api.post('/users', {
                ...customerData,
                role: 'client', // Force role to client
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al crear cliente');
        }
    },

    // Update customer
    updateCustomer: async (id, customerData) => {
        try {
            const response = await api.put(`/users/${id}`, customerData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al actualizar cliente');
        }
    },

    // Delete customer
    deleteCustomer: async (id) => {
        try {
            await api.delete(`/users/${id}`);
            return { success: true };
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al eliminar cliente');
        }
    },

    // Get loyal customers (top 10)
    getLoyalCustomers: async () => {
        try {
            const response = await api.get('/users/loyal-customers');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Error al cargar clientes fieles');
        }
    },
};

export default customersService;
