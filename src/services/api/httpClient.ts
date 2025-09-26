import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleApiError } from './errorHandler';

// Create an axios instance with default config
const httpClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1', // Make sure this matches your backend URL
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Set withCredentials to true to send cookies with cross-origin requests
  withCredentials: true,
});

// Biến để theo dõi nếu đang refresh token
let isRefreshing = false;
// Hàng đợi các request đang chờ token mới
let failedQueue: any[] = [];
// Đếm số lần thử refresh token liên tiếp
let refreshAttempts = 0;
// Số lần thử tối đa
const MAX_REFRESH_ATTEMPTS = 2;
// Thời gian reset đếm số lần thử (ms)
const REFRESH_ATTEMPT_RESET_TIME = 60000; // 1 phút
// Timer để reset đếm số lần thử
let refreshAttemptsResetTimer: NodeJS.Timeout | null = null;

// Xử lý hàng đợi các request
const processQueue = (error: any) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// Request interceptor for adding auth token and logging
httpClient.interceptors.request.use(
  async (config) => {
    // Import authService here to avoid circular dependency
    const authService = await import('../auth/authService').then(module => module.default);

    // Get auth token from in-memory storage
    const authToken = authService.getAuthToken();

    // Add auth token to headers if available
    if (authToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
httpClient.interceptors.response.use(
  (response) => {
    // Check if the API returned success: false
    if (response.data && response.data.success === false) {
      // For auth endpoints, let the service handle the error
      const isAuthEndpoint = response.config.url && (
        response.config.url.includes('/auths')
      );

      if (!isAuthEndpoint) {
        // For non-auth endpoints, reject with the error
        return Promise.reject(new Error(response.data.message || 'Đã xảy ra lỗi'));
      }
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Kiểm tra nếu request đang gọi là refresh token
    const isRefreshTokenRequest = originalRequest.url && originalRequest.url.includes('/auths/token/refresh');

    // Nếu lỗi đến từ request refresh token, không thử refresh lại
    if (isRefreshTokenRequest) {
      const authService = await import('../auth/authService').then(module => module.default);
      authService.logout();

      if (!window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login';
      }

      return Promise.reject(handleApiError(error, 'Phiên đăng nhập hết hạn'));
    }

    // Don't attempt token refresh for auth endpoints (except refresh token)
    const isAuthEndpoint = originalRequest.url && (
      originalRequest.url.includes('/auths') &&
      !originalRequest.url.includes('/token/refresh')
    );

    // Skip token refresh for login/register endpoints
    if (isAuthEndpoint) {
      return Promise.reject(handleApiError(error));
    }

    // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token và không phải là endpoint auth
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Kiểm tra số lần thử refresh token
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        const authService = await import('../auth/authService').then(module => module.default);
        authService.logout();

        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }

        return Promise.reject(handleApiError(error, 'Phiên đăng nhập hết hạn sau nhiều lần thử'));
      }

      if (isRefreshing) {
        // Nếu đang refresh, thêm request vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return httpClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      // Đánh dấu đang refresh token
      originalRequest._retry = true;
      isRefreshing = true;

      // Tăng số lần thử refresh token
      refreshAttempts++;

      // Thiết lập timer để reset đếm số lần thử
      if (refreshAttemptsResetTimer) {
        clearTimeout(refreshAttemptsResetTimer);
      }

      refreshAttemptsResetTimer = setTimeout(() => {
        refreshAttempts = 0;
        refreshAttemptsResetTimer = null;
      }, REFRESH_ATTEMPT_RESET_TIME);

      try {
        // Import authService ở đây để tránh circular dependency
        const authService = await import('../auth/authService').then(module => module.default);

        // Lưu token cũ để so sánh sau khi refresh
        const oldToken = authService.getAuthToken();

        try {
          // Thử refresh token
          await authService.refreshToken();
        } catch (refreshTokenError: any) {
          // Kiểm tra nếu lỗi là do token không thay đổi
          if (refreshTokenError.message && refreshTokenError.message.includes('Token không thay đổi')) {
            authService.logout();

            if (!window.location.pathname.includes('/auth/login')) {
              window.location.href = '/auth/login';
            }

            throw new Error('Phiên đăng nhập hết hạn do token không thay đổi');
          }

          // Nếu là lỗi khác, ném lại lỗi
          throw refreshTokenError;
        }

        // Kiểm tra token mới
        const newToken = authService.getAuthToken();

        // Kiểm tra xem token có thực sự thay đổi không
        if (!newToken) {
          throw new Error("Không có token sau khi refresh");
        }

        // Kiểm tra thêm lần nữa xem token có thay đổi không
        if (oldToken === newToken) {
          authService.logout();

          if (!window.location.pathname.includes('/auth/login')) {
            window.location.href = '/auth/login';
          }

          throw new Error("Token không thay đổi sau khi refresh");
        }

        // Xử lý hàng đợi các request
        processQueue(null);

        // Đảm bảo header Authorization được cập nhật với token mới
        if (originalRequest.headers) {
          const newAuthToken = authService.getAuthToken();
          if (newAuthToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newAuthToken}`;
          }
        }

        // Thực hiện lại request ban đầu với token mới
        return httpClient(originalRequest);
      } catch (refreshError) {
        // Nếu refresh thất bại, xử lý lỗi và đăng xuất
        processQueue(refreshError);

        // Import authService ở đây để tránh circular dependency
        const authService = await import('../auth/authService').then(module => module.default);

        // Đăng xuất người dùng
        authService.logout();

        // Chuyển hướng đến trang đăng nhập chỉ khi không phải đang ở trang đăng nhập
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }

        return Promise.reject(handleApiError(refreshError, 'Phiên đăng nhập hết hạn'));
      } finally {
        isRefreshing = false;
      }
    }

    // Xử lý các lỗi khác
    return Promise.reject(handleApiError(error));
  }
);

// Hàm để reset biến đếm refresh token
export const resetRefreshAttempts = () => {
  refreshAttempts = 0;
  if (refreshAttemptsResetTimer) {
    clearTimeout(refreshAttemptsResetTimer);
    refreshAttemptsResetTimer = null;
  }
};

export default httpClient; 