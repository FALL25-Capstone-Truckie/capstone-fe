import httpClient from '../api/httpClient';
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
    RefreshTokenRequest,
    RefreshTokenResponse
} from './types';
import { handleApiError } from '../api/errorHandler';

/**
 * Service for handling authentication API calls
 */
const authService = {
    /**
     * Login with username and password
     * @param username User's username
     * @param password User's password
     * @returns Promise with login response
     */
    login: async (username: string, password: string): Promise<LoginResponse> => {
        try {
            const loginData: LoginRequest = { username, password };
            const response = await httpClient.post<LoginResponse>('/auths', loginData);

            // Check if the API returned success: false
            if (!response.data.success) {
                console.warn('Login API returned success: false with message:', response.data.message);
                throw new Error(response.data.message || 'Đăng nhập thất bại');
            }

            // Lưu token vào localStorage
            localStorage.setItem('authToken', response.data.data.authToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);

            // Lưu thông tin người dùng vào localStorage
            const user = response.data.data.user;
            const roleName = user.role?.roleName;

            localStorage.setItem('user_role', roleName.toLowerCase());
            localStorage.setItem('userId', user.id);
            localStorage.setItem('username', user.username);
            localStorage.setItem('email', user.email);

            // Thêm dòng hello username
            response.data.message = `Hello ${user.username}! ${response.data.message}`;

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            // Make sure to pass the error directly to preserve all error information
            throw error;
        }
    },

    /**
     * Register a new user
     * @param userData User registration data
     * @returns Promise with registration response
     */
    register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
        try {
            const response = await httpClient.post<RegisterResponse>('/auths/customer/register', userData);

            // Check if the API returned success: false
            if (!response.data.success) {
                console.warn('Register API returned success: false with message:', response.data.message);
                throw new Error(response.data.message || 'Đăng ký thất bại');
            }

            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            // Pass the error directly to preserve all error information
            throw error;
        }
    },

    /**
     * Refresh the authentication token
     * @returns Promise with refresh token response
     */
    refreshToken: async (): Promise<void> => {
        try {
            console.log("Starting token refresh process...");

            // Get refresh token from localStorage
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                throw new Error('Không tìm thấy refresh token');
            }

            // Send refresh token in request body
            const refreshData: RefreshTokenRequest = { refreshToken };
            const response = await httpClient.post<RefreshTokenResponse>('/auths/token/refresh', refreshData);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Làm mới token thất bại');
            }

            // Update tokens in localStorage
            localStorage.setItem('authToken', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);

            console.log("Token refresh successful, new tokens stored");
            return;
        } catch (error: any) {
            console.error('Token refresh error:', error);
            // Xử lý trường hợp refresh token hết hạn hoặc không hợp lệ
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                // Đăng xuất người dùng
                authService.logout();
            }
            throw handleApiError(error, 'Làm mới token thất bại');
        }
    },

    /**
     * Logout the current user
     */
    logout: async (): Promise<void> => {
        try {
            // Gọi API logout để vô hiệu hóa token ở phía server
            await httpClient.post('/auths/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Xóa token và thông tin người dùng khỏi localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user_role');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            localStorage.removeItem('email');
        }
    },

    /**
     * Check if user is logged in
     * @returns Boolean indicating if user is logged in
     */
    isLoggedIn: (): boolean => {
        // Kiểm tra dựa trên token trong localStorage
        return !!localStorage.getItem('authToken');
    },

    /**
     * Get the current user's role
     * @returns User role or null if not logged in
     */
    getUserRole: (): string | null => {
        return localStorage.getItem('user_role');
    },

    /**
     * Change user password
     * @param data Password change data
     * @returns Promise with change password response
     */
    changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
        try {
            console.log('Sending change password request:', {
                ...data,
                oldPassword: '***',
                newPassword: '***',
                confirmNewPassword: '***'
            });

            const response = await httpClient.put<ChangePasswordResponse>('/auths/change-password', data);

            console.log('Change password response:', response.data);

            if (!response.data.success) {
                console.error('Change password failed with message:', response.data.message);
                throw new Error(response.data.message || 'Đổi mật khẩu thất bại');
            }

            return response.data;
        } catch (error: any) {
            console.error('Change password error:', error);

            // Xử lý lỗi cụ thể từ API
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                if (errorData.message) {
                    throw new Error(errorData.message);
                }
            }

            throw handleApiError(error, 'Đổi mật khẩu thất bại');
        }
    }
};

export default authService; 