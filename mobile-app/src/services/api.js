import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// CAMBIAR ESTO POR TU IP LOCAL SI USAS DISPOSITIVO FISICO (ej: 192.168.1.5)
// Para emulador Android usa 10.0.2.2
// Para iOS simulador usa localhost
const API_URL = 'http://192.168.10.51:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to inject the token

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
