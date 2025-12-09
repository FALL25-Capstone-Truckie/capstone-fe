import type { UserResponse } from './User';
import type { Penalty } from './Penalty';

export interface DriverRoleResponse {
    id: string;
    roleName: string;
    description: string;
    isActive: boolean;
}

export interface DriverUserResponse {
    id: string;
    username: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    gender: boolean;
    dateOfBirth: string;
    imageUrl: string;
    status: string;
    role: DriverRoleResponse;
}

export interface DriverModel {
    id: string;
    identityNumber: string;
    driverLicenseNumber: string;
    cardSerialNumber: string;
    placeOfIssue: string;
    dateOfIssue: string;
    dateOfExpiry: string;
    licenseClass: string;
    dateOfPassing: string;
    status: string;
    userResponse: DriverUserResponse;
    penaltyHistories?: Penalty[];
}

/**
 * Request for admin to create a new driver.
 * Password is NOT required - BE will generate a random temporary password.
 */
export interface AdminCreateDriverRequest {
    username: string;
    email: string;
    gender: boolean;
    dateOfBirth: string;
    fullName: string;
    phoneNumber: string;
    identityNumber: string;
    driverLicenseNumber: string;
    cardSerialNumber: string;
    placeOfIssue: string;
    dateOfIssue: string;
    dateOfExpiry: string;
    licenseClass: string;
    dateOfPassing: string;
}

/**
 * Response when admin creates a new driver.
 * Contains driver info and temporary password.
 */
export interface DriverCreatedResponse {
    driver: DriverModel;
    temporaryPassword: string;
    loginInstructions: string;
}

export interface DriverStatusUpdateRequest {
    status: string;
}