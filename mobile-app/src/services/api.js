import axios from 'axios';

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

export default api;
