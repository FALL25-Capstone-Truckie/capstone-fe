import httpClient from '../api/httpClient';
import type { Penalty } from '@/models/Penalty';
import type {
    GetPenaltiesResponse,
    GetPenaltyResponse
} from './types';
import { handleApiError } from '../api/errorHandler';

/**
 * Service for handling traffic violation API calls
 */
const penaltyService = {
    /**
     * Get all traffic violations
     * @returns Promise with penalties response
     */
    getPenalties: async (): Promise<GetPenaltiesResponse> => {
        try {
            const response = await httpClient.get<GetPenaltiesResponse>('/penalties');
            return response.data;
        } catch (error) {
            console.error('Get penalties error:', error);
            throw handleApiError(error, 'Không thể lấy danh sách vi phạm giao thông');
        }
    },

    /**
     * Get traffic violation by ID
     * @param id Traffic violation ID
     * @returns Promise with penalty response
     */
    getPenaltyById: async (id: string): Promise<GetPenaltyResponse> => {
        try {
            const response = await httpClient.get<GetPenaltyResponse>(`/penalties/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get penalty error:', error);
            throw handleApiError(error, 'Không thể lấy thông tin vi phạm giao thông');
        }
    },

    /**
     * Get traffic violations by driver
     * @param driverId Driver ID
     * @returns Promise with penalties response
     */
    getPenaltiesByDriver: async (driverId: string): Promise<GetPenaltiesResponse> => {
        try {
            const response = await httpClient.get<GetPenaltiesResponse>(`/penalties/driver/${driverId}`);
            return response.data;
        } catch (error) {
            console.error('Get penalties by driver error:', error);
            throw handleApiError(error, 'Không thể lấy danh sách vi phạm của tài xế');
        }
    },

    /**
     * Get traffic violations by vehicle assignment
     * @param vehicleAssignmentId Vehicle assignment ID
     * @returns Promise with penalties response
     */
    getPenaltiesByVehicleAssignment: async (vehicleAssignmentId: string): Promise<GetPenaltiesResponse> => {
        try {
            const response = await httpClient.get<GetPenaltiesResponse>(`/admin/penalties/vehicle-assignment/${vehicleAssignmentId}`);
            return response.data;
        } catch (error) {
            console.error('Get penalties by vehicle assignment error:', error);
            throw handleApiError(error, 'Không thể lấy danh sách vi phạm của chuyến xe');
        }
    },
};

export default penaltyService;