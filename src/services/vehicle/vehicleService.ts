import httpClient from '../api/httpClient';
import type {
    VehicleListResponse,
    VehicleDetailResponse,
    CreateVehicleResponse,
    UpdateVehicleResponse,
    VehicleTypeListResponse,
    CreateVehicleTypeRequest,
    UpdateVehicleTypeRequest,
    VehicleMaintenanceListResponse,
    VehicleMaintenanceDetailResponse,
    CreateVehicleMaintenanceResponse,
    UpdateVehicleMaintenanceResponse
} from './types';
import type {
    CreateVehicleRequest,
    UpdateVehicleRequest,
    CreateVehicleMaintenanceRequest,
    UpdateVehicleMaintenanceRequest
} from '../../models';
import axios from 'axios';

const vehicleService = {
    /**
     * Get all vehicles
     */
    getVehicles: async () => {
        try {
            const response = await httpClient.get<VehicleListResponse>('/vehicles');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                // 404 không phải lỗi mà là không có dữ liệu
                return {
                    success: true,
                    message: 'Không có phương tiện nào',
                    statusCode: 200,
                    data: []
                };
            }
            console.error('Error fetching vehicles:', error);
            throw error;
        }
    },

    /**
     * Get vehicle by ID
     */
    getVehicleById: async (id: string) => {
        try {
            const response = await httpClient.get<VehicleDetailResponse>(`/vehicles/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                // 404 không phải lỗi mà là không tìm thấy phương tiện
                return {
                    success: false,
                    message: 'Không tìm thấy phương tiện',
                    statusCode: 404,
                    data: null
                };
            }
            console.error(`Error fetching vehicle with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Create a new vehicle
     */
    createVehicle: async (vehicleData: CreateVehicleRequest) => {
        try {
            const response = await httpClient.post<CreateVehicleResponse>('/vehicles', vehicleData);
            return response.data;
        } catch (error) {
            console.error('Error creating vehicle:', error);
            throw error;
        }
    },

    /**
     * Update an existing vehicle
     */
    updateVehicle: async (id: string, vehicleData: Omit<UpdateVehicleRequest, 'id'>) => {
        try {
            // Không bao gồm id trong body request vì id đã có trong URL
            const response = await httpClient.put<UpdateVehicleResponse>(`/vehicles/${id}`, vehicleData);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                // 404 không phải lỗi mà là không tìm thấy phương tiện để cập nhật
                return {
                    success: false,
                    message: 'Không tìm thấy phương tiện để cập nhật',
                    statusCode: 404,
                    data: null
                };
            }
            console.error(`Error updating vehicle with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete a vehicle
     */
    deleteVehicle: async (id: string) => {
        try {
            const response = await httpClient.delete(`/vehicles/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                // 404 không phải lỗi mà là không tìm thấy phương tiện để xóa
                return {
                    success: false,
                    message: 'Không tìm thấy phương tiện để xóa',
                    statusCode: 404
                };
            }
            console.error(`Error deleting vehicle with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Get all vehicle types
     */
    getVehicleTypes: async () => {
        try {
            const response = await httpClient.get<VehicleTypeListResponse>('/vehicle-types');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                // 404 không phải lỗi mà là không có dữ liệu
                return {
                    success: true,
                    message: 'Không có loại phương tiện nào',
                    statusCode: 200,
                    data: []
                };
            }
            console.error('Error fetching vehicle types:', error);
            throw error;
        }
    },

    /**
     * Create a new vehicle type
     */
    createVehicleType: async (vehicleTypeData: CreateVehicleTypeRequest) => {
        try {
            const response = await httpClient.post('/vehicle-types', vehicleTypeData);
            return response.data;
        } catch (error) {
            console.error('Error creating vehicle type:', error);
            throw error;
        }
    },

    /**
     * Update an existing vehicle type
     */
    updateVehicleType: async (id: string, vehicleTypeData: UpdateVehicleTypeRequest) => {
        try {
            const response = await httpClient.put(`/vehicle-types/${id}`, vehicleTypeData);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                // 404 không phải lỗi mà là không tìm thấy loại phương tiện để cập nhật
                return {
                    success: false,
                    message: 'Không tìm thấy loại phương tiện để cập nhật',
                    statusCode: 404,
                    data: null
                };
            }
            console.error(`Error updating vehicle type with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete a vehicle type
     */
    deleteVehicleType: async (id: string) => {
        try {
            const response = await httpClient.delete(`/vehicle-types/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                // 404 không phải lỗi mà là không tìm thấy loại phương tiện để xóa
                return {
                    success: false,
                    message: 'Không tìm thấy loại phương tiện để xóa',
                    statusCode: 404
                };
            }
            console.error(`Error deleting vehicle type with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Get all vehicle maintenances
     */
    getVehicleMaintenances: async () => {
        try {
            const response = await httpClient.get<VehicleMaintenanceListResponse>('/vehicle-maintenances');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                // 404 không phải lỗi mà là không có dữ liệu
                return {
                    success: true,
                    message: 'Không có lịch bảo trì nào',
                    statusCode: 200,
                    data: []
                };
            }
            console.error('Error fetching vehicle maintenances:', error);
            throw error;
        }
    },

    /**
     * Get vehicle maintenance by ID
     */
    getVehicleMaintenanceById: async (id: string) => {
        try {
            const response = await httpClient.get<VehicleMaintenanceDetailResponse>(`/vehicle-maintenances/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                // 404 không phải lỗi mà là không tìm thấy lịch bảo trì
                return {
                    success: false,
                    message: 'Không tìm thấy lịch bảo trì',
                    statusCode: 404,
                    data: null
                };
            }
            console.error(`Error fetching vehicle maintenance with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Create a new vehicle maintenance
     */
    createVehicleMaintenance: async (maintenanceData: CreateVehicleMaintenanceRequest) => {
        try {
            const response = await httpClient.post<CreateVehicleMaintenanceResponse>('/vehicle-maintenances', maintenanceData);
            return response.data;
        } catch (error) {
            console.error('Error creating vehicle maintenance:', error);
            throw error;
        }
    },

    /**
     * Update an existing vehicle maintenance
     */
    updateVehicleMaintenance: async (id: string, maintenanceData: UpdateVehicleMaintenanceRequest) => {
        try {
            const response = await httpClient.put<UpdateVehicleMaintenanceResponse>(`/vehicle-maintenances/${id}`, maintenanceData);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                // 404 không phải lỗi mà là không tìm thấy lịch bảo trì để cập nhật
                return {
                    success: false,
                    message: 'Không tìm thấy lịch bảo trì để cập nhật',
                    statusCode: 404,
                    data: null
                };
            }
            console.error(`Error updating vehicle maintenance with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete a vehicle maintenance
     */
    deleteVehicleMaintenance: async (id: string) => {
        try {
            const response = await httpClient.delete(`/vehicle-maintenances/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                // 404 không phải lỗi mà là không tìm thấy lịch bảo trì để xóa
                return {
                    success: false,
                    message: 'Không tìm thấy lịch bảo trì để xóa',
                    statusCode: 404
                };
            }
            console.error(`Error deleting vehicle maintenance with ID ${id}:`, error);
            throw error;
        }
    }
};

export default vehicleService; 