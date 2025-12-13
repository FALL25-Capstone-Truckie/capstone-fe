import type { UserModel, RegisterEmployeeRequest } from '../../models/User';
import type { ApiResponse } from '../api/types';

export interface UserUpdateRequest {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    gender?: boolean;
    dateOfBirth?: string;
    imageUrl?: string;
}

export type UserResponse = ApiResponse<UserModel>;

export type UsersResponse = ApiResponse<UserModel[]>;

export type { UserModel, RegisterEmployeeRequest };