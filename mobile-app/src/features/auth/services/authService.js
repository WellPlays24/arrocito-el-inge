import axios from 'axios';

// CAMBIAR ESTO POR TU IP LOCAL SI USAS DISPOSITIVO FISICO (ej: 192.168.1.5)
// Para emulador Android usa 10.0.2.2
// Para iOS simulador usa localhost
const API_URL = 'http://192.168.10.51:3000/api/auth';

const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error de conexión' };
    }
};

const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        console.error('Register error:', error.response?.data || error.message);
        throw error.response?.data || { message: 'Error de conexión' };
    }
};

export default {
    login,
    register,
};
