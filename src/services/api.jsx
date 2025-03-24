import axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_URL_API || 'https://ab2e-206-84-60-250.ngrok-free.app/api';

console.log('Base URL:', baseURL);

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        // 'ngrok-skip-browser-warning': 'true', // Adicionado para ignorar aviso do Ngrok
    },
});

// Interceptor para incluir o token de autenticação em todas as requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
