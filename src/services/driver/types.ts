import type { ApiResponse, PaginatedResponse } from '../api/types';
import type { DriverModel, AdminCreateDriverRequest, DriverCreatedResponse } from '../../models/Driver';

export type { DriverModel, AdminCreateDriverRequest, DriverCreatedResponse };

export type DriverResponse = ApiResponse<DriverModel>;
export type DriversResponse = ApiResponse<DriverModel[]>;
export type PaginatedDriversResponse = ApiResponse<PaginatedResponse<DriverModel>>;
export type DriverCreatedApiResponse = ApiResponse<DriverCreatedResponse>;

export interface LicenseRenewalRequest {
    dateOfPassing: string;
    dateOfIssue: string;
    dateOfExpiry: string;
}