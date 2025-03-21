import axios from 'axios';

// Se estiver usando Vite, você pode configurar a URL base via variável de ambiente.
// Caso contrário, você pode definir diretamente a URL base.
const baseURL = import.meta.env.VITE_BASE_URL_API || 'http://127.0.0.1:5000/api';

console.log('Base URL:', baseURL);

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para incluir o token de autenticação (caso exista) em todas as requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // ou "sessionToken" conforme o que você armazenar
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
