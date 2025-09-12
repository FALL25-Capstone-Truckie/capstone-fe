import type { Vehicle } from './Vehicle';

export interface MaintenanceType {
    id: string;
    name: string;
    description?: string;
}

export interface VehicleMaintenance {
    id: string;
    maintenanceDate: string;
    description: string;
    cost: number;
    nextMaintenanceDate?: string;
    odometerReading?: number;
    serviceCenter: string;
    vehicleId: string;
    maintenanceTypeId: string;
    vehicle?: Vehicle;
    maintenanceType?: MaintenanceType;
}

export interface VehicleMaintenanceDetail extends VehicleMaintenance {
    vehicle: Vehicle;
    maintenanceType: MaintenanceType;
}

export interface CreateVehicleMaintenanceRequest {
    maintenanceDate: string;
    description: string;
    cost: number;
    nextMaintenanceDate?: string;
    odometerReading?: number;
    serviceCenter: string;
    vehicleId: string;
    maintenanceTypeId: string;
}

export interface UpdateVehicleMaintenanceRequest {
    maintenanceDate: string;
    description: string;
    cost: number;
    nextMaintenanceDate?: string;
    odometerReading?: number;
    serviceCenter: string;
    vehicleId: string;
    maintenanceTypeId: string;
} 