import type { UserResponse } from './User';

export interface Customer {
    id: string;
    companyName: string;
    representativeName: string;
    representativePhone: string;
    businessLicenseNumber: string;
    businessAddress: string;
    status: string;
    userResponse: UserResponse; // Đổi từ user thành userResponse
}

export interface CustomerCreateDto {
    companyName: string;
    representativeName: string;
    representativePhone: string;
    businessLicenseNumber: string;
    businessAddress: string;
}

export interface CustomerUpdateDto {
    companyName?: string;
    representativeName?: string;
    representativePhone?: string;
    businessLicenseNumber?: string;
    businessAddress?: string;
}

// Alias for consistency with service layer
export type CustomerUpdateRequest = CustomerUpdateDto;