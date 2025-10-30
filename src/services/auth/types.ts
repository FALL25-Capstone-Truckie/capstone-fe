import type { ApiResponse } from '../api/types';
import type { 
    LoginRequest,
    RegisterRequest,
    UserApiResponse,
    LoginResponseData,
    RefreshTokenResponseData,
    RegisterResponseData,
    ChangePasswordRequest,
    AuthState
} from '@/models/User';

export type { 
    LoginRequest,
    RegisterRequest,
    UserApiResponse,
    LoginResponseData,
    RefreshTokenResponseData,
    RegisterResponseData,
    ChangePasswordRequest,
    AuthState
};

export type LoginResponse = ApiResponse<LoginResponseData>;
export type RefreshTokenResponse = ApiResponse<RefreshTokenResponseData>;
export type RegisterResponse = ApiResponse<RegisterResponseData>;

export interface ChangePasswordResponse {
    success: boolean;
    message: string;
    statusCode: number;
    data: null;
}