import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AUTH_TOKEN_KEY } from '../../config';

// Tạm thời import từ authService cũ, sau này sẽ cập nhật
import authService from '../auth/authService';

// Create an axios instance with default config
const httpClient = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    // Quan trọng: cho phép gửi cookie với các request
    withCredentials: true,
});

// Biến để theo dõi nếu đang refresh token
let isRefreshing = false;
// Hàng đợi các request đang chờ token mới
let failedQueue: any[] = [];

// Xử lý hàng đợi các request
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Request interceptor for adding auth token
httpClient.interceptors.request.use(
    (config) => {
        // Không cần thêm token vào header nếu đã sử dụng HTTP-only cookie
        // Tuy nhiên, giữ lại code này cho đến khi backend được cập nhật để hỗ trợ cookie
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
httpClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Nếu đang refresh, thêm request vào hàng đợi
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return httpClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            // Đánh dấu đang refresh token
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Thử refresh token
                const response = await authService.refreshToken();

                // Nếu refresh thành công, cập nhật token cho các request trong hàng đợi
                const newToken = response.data.authToken;
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }

                // Xử lý hàng đợi các request
                processQueue(null, newToken);

                // Thực hiện lại request ban đầu với token mới
                return httpClient(originalRequest);
            } catch (refreshError) {
                // Nếu refresh thất bại, xử lý lỗi và đăng xuất
                processQueue(refreshError, null);

                // Đăng xuất người dùng
                authService.logout();

                // Chuyển hướng đến trang đăng nhập
                window.location.href = '/auth/login';

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Xử lý các lỗi khác
        return Promise.reject(error);
    }
);

export default httpClient; 