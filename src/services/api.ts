import axios from 'axios';
import { API_URL, API_TIMEOUT, AUTH_TOKEN_KEY } from '../config';

// Create an axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
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
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
            // Clear local storage and redirect to login
            localStorage.removeItem(AUTH_TOKEN_KEY);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api; 