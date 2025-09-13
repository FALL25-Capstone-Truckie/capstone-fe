import type { MaintenanceTypeEntity, MaintenanceTypeRequest } from '../../models';
import type { ApiResponse } from '../api/types';

// API trả về mảng trực tiếp, không có wrapper object
export type GetMaintenanceTypesResponse = MaintenanceTypeEntity[];
export interface GetMaintenanceTypeResponse extends Omit<ApiResponse<MaintenanceTypeEntity>, 'data'> {
    data: MaintenanceTypeEntity | null;
}
export type CreateMaintenanceTypeRequest = MaintenanceTypeRequest;
export type UpdateMaintenanceTypeRequest = MaintenanceTypeRequest; 