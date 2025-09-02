import httpClient from '../api/httpClient';
import { AUTH_TOKEN_KEY, AUTH_REFRESH_TOKEN_KEY } from '../../config';
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    RefreshTokenResponse
} from './types';
import { mapUserResponseToModel } from '@/models/User';

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
            const response = await httpClient.post<LoginResponse>('/auth/login', loginData);

            // Lưu token vào localStorage (tạm thời, sau này sẽ dùng HTTP-only cookie)
            if (response.data.success) {
                localStorage.setItem(AUTH_TOKEN_KEY, response.data.data.authToken);
                localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, response.data.data.refreshToken);
                localStorage.setItem('user_role', response.data.data.user.role.roleName.toLowerCase());
            }

            return response.data;
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
        }
    },

    /**
     * Register a new user
     * @param userData User registration data
     * @returns Promise with registration response
     */
    register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
        try {
            const response = await httpClient.post<RegisterResponse>('/auth/register', userData);
            return response.data;
        } catch (error: any) {
            console.error('Registration error:', error);
            throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
        }
    },

    /**
     * Refresh the authentication token
     * @returns Promise with refresh token response
     */
    refreshToken: async (): Promise<RefreshTokenResponse> => {
        try {
            const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);

            if (!refreshToken) {
                throw new Error('Không tìm thấy refresh token');
            }

            const response = await httpClient.post<RefreshTokenResponse>('/auth/refresh-token', {
                refreshToken
            });

            if (response.data.success) {
                localStorage.setItem(AUTH_TOKEN_KEY, response.data.data.authToken);
                localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, response.data.data.refreshToken);
            }

            return response.data;
        } catch (error: any) {
            console.error('Token refresh error:', error);
            throw new Error(error.response?.data?.message || 'Làm mới token thất bại');
        }
    },

    /**
     * Logout the current user
     */
    logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
        localStorage.removeItem('user_role');
    },

    /**
     * Check if user is logged in
     * @returns Boolean indicating if user is logged in
     */
    isLoggedIn: (): boolean => {
        return !!localStorage.getItem(AUTH_TOKEN_KEY);
    },

    /**
     * Get the current user's role
     * @returns User role or null if not logged in
     */
    getUserRole: (): string | null => {
        return localStorage.getItem('user_role');
    }
};

export default authService; 