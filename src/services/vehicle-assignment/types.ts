import type {
    VehicleAssignment,
    VehicleAssignmentSuggestionData,
    CreateVehicleAssignmentRequest,
    UpdateVehicleAssignmentRequest,
    CreateVehicleAssignmentForDetailsRequest,
    GroupedVehicleAssignmentSuggestionData,
    CreateGroupedVehicleAssignmentsRequest
} from "../../models/VehicleAssignment";
import type { ApiResponse } from "../api/types";

// Simplified response types using ApiResponse<T> directly
export type VehicleAssignmentResponse = ApiResponse<VehicleAssignment[]>;
export type VehicleAssignmentDetailResponse = ApiResponse<VehicleAssignment>;
export type CreateVehicleAssignmentResponse = ApiResponse<VehicleAssignment>;
export type UpdateVehicleAssignmentResponse = ApiResponse<VehicleAssignment>;
export type DeleteVehicleAssignmentResponse = ApiResponse<void>;
export type VehicleAssignmentSuggestionResponse = ApiResponse<VehicleAssignmentSuggestionData>;
export type CreateVehicleAssignmentForDetailsResponse = ApiResponse<any>;

// Re-export model types
export type {
    VehicleAssignment,
    CreateVehicleAssignmentRequest,
    UpdateVehicleAssignmentRequest,
    VehicleAssignmentSuggestionData,
    CreateVehicleAssignmentForDetailsRequest,
    GroupedVehicleAssignmentSuggestionData,
    CreateGroupedVehicleAssignmentsRequest
};