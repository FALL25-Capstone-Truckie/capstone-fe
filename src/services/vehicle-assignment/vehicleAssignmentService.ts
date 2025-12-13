import httpClient from "../api";
import type {
    VehicleAssignmentResponse,
    VehicleAssignmentDetailResponse,
    CreateVehicleAssignmentRequest,
    UpdateVehicleAssignmentRequest,
    VehicleAssignmentSuggestionResponse,
    CreateVehicleAssignmentForDetailsRequest,
    CreateVehicleAssignmentForDetailsResponse,
    GroupedVehicleAssignmentSuggestionData,
    CreateGroupedVehicleAssignmentsRequest
} from "./types";
import type { ApiResponse } from "../api/types";

const BASE_URL = "/vehicle-assignments";

export const vehicleAssignmentService = {
    getAll: async (): Promise<VehicleAssignmentResponse> => {
        try {
            const response = await httpClient.get<VehicleAssignmentResponse>(BASE_URL);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getById: async (id: string): Promise<VehicleAssignmentDetailResponse> => {
        try {
            const response = await httpClient.get<VehicleAssignmentDetailResponse>(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get full vehicle assignment details for staff view
     * Includes: vehicle, drivers, penalties, fuel consumption, seals, journey histories, photo completions, issues, order details, order info
     */
    getFullById: async (id: string): Promise<ApiResponse<any>> => {
        try {
            console.log("🔍 DEBUG: API Service - Calling getFullById for ID:", id);
            const response = await httpClient.get<ApiResponse<any>>(`${BASE_URL}/${id}/full`);
            console.log("🔍 DEBUG: API Service - Raw response:", response);
            console.log("🔍 DEBUG: API Service - Response data:", response.data);
            return response.data;
        } catch (error) {
            console.error("🔍 DEBUG: API Service - Error in getFullById:", error);
            throw error;
        }
    },

    create: async (data: CreateVehicleAssignmentRequest): Promise<VehicleAssignmentDetailResponse> => {
        try {
            console.log("🔍 DEBUG: API Service - Calling create for data:", data);
            const response = await httpClient.post<VehicleAssignmentDetailResponse>(BASE_URL, data);
            console.log("🔍 DEBUG: API Service - Raw response:", response);
            console.log("🔍 DEBUG: API Service - Response data:", response.data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    update: async (id: string, data: UpdateVehicleAssignmentRequest): Promise<VehicleAssignmentDetailResponse> => {
        try {
            const response = await httpClient.put<VehicleAssignmentDetailResponse>(`${BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete: async (id: string): Promise<VehicleAssignmentDetailResponse> => {
        try {
            const response = await httpClient.delete<VehicleAssignmentDetailResponse>(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getGroupedSuggestionsForOrderDetails: async (orderId: string) => {
        try {

            const response = await httpClient.get<ApiResponse<GroupedVehicleAssignmentSuggestionData>>(
                `/vehicle-assignments/${orderId}/grouped-suggestions`
            );
            return response.data;
        } catch (error) {
            console.error("Error getting grouped vehicle assignment suggestions:", error);
            throw error;
        }
    },

    createGroupedAssignments: async (data: CreateGroupedVehicleAssignmentsRequest): Promise<ApiResponse<any>> => {
        try {
            const response = await httpClient.post<ApiResponse<any>>(`${BASE_URL}/create-grouped-assignments`, data);
            return response.data;
        } catch (error) {
            console.error("Error creating grouped vehicle assignments:", error);
            throw error;
        }
    }
}; 