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

        // If no token and not a public endpoint, reject the request
        if (!token) {
            // Allow only public endpoints without token
            const publicEndpoints = ['/auth/login', '/auth/register'];
            const isPublicEndpoint = publicEndpoints.some(endpoint =>
                config.url.includes(endpoint)
            );

            if (!isPublicEndpoint) {
                // Cancel the request silently
                return Promise.reject({
                    message: 'No token available',
                    config,
                    __CANCEL__: true
                });
            }
        } else {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Silently ignore cancelled requests
        if (error.__CANCEL__) {
            return Promise.reject({ message: 'Request cancelled', silent: true });
        }
        return Promise.reject(error);
    }
);

export default api;
