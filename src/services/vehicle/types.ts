import type { Vehicle, VehicleDetail, CreateVehicleRequest, UpdateVehicleRequest, VehicleType, VehicleMaintenance, CreateVehicleMaintenanceRequest, UpdateVehicleMaintenanceRequest, VehicleMaintenanceDetail } from '../../models';

export interface VehicleListResponse {
    success: boolean;
    message: string;
    statusCode: number;
    data: Vehicle[];
}

export interface VehicleDetailResponse {
    success: boolean;
    message: string;
    statusCode: number;
    data: VehicleDetail;
}

export interface CreateVehicleResponse {
    success: boolean;
    message: string;
    statusCode: number;
    data: Vehicle;
}

export interface UpdateVehicleResponse {
    success: boolean;
    message: string;
    statusCode: number;
    data: VehicleDetail;
}

export interface VehicleTypeListResponse {
    success: boolean;
    message: string;
    statusCode: number;
    data: VehicleType[];
}

export interface CreateVehicleTypeRequest {
    vehicleTypeName: string;
    description: string;
}

export interface UpdateVehicleTypeRequest {
    vehicleTypeName: string;
    description: string;
}

export interface VehicleMaintenanceListResponse {
    success: boolean;
    message: string;
    statusCode: number;
    data: VehicleMaintenance[];
}

export interface VehicleMaintenanceDetailResponse {
    success: boolean;
    message: string;
    statusCode: number;
    data: VehicleMaintenanceDetail;
}

export interface CreateVehicleMaintenanceResponse {
    success: boolean;
    message: string;
    statusCode: number;
    data: VehicleMaintenance;
}

export interface UpdateVehicleMaintenanceResponse {
    success: boolean;
    message: string;
    statusCode: number;
    data: VehicleMaintenance;
} 