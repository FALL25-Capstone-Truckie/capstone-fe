import type { MaintenanceTypeEntity, MaintenanceTypeRequest } from '../../models';
import type { ApiResponse } from '../api/types';

// Simplified response types
export type GetMaintenanceTypesResponse = ApiResponse<MaintenanceTypeEntity[]>;
export type GetMaintenanceTypeResponse = ApiResponse<MaintenanceTypeEntity | null>;
export type CreateMaintenanceTypeRequest = MaintenanceTypeRequest;
export type UpdateMaintenanceTypeRequest = MaintenanceTypeRequest;