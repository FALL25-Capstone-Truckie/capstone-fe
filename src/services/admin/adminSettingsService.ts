import httpClient from '../api/httpClient';
import { handleApiError } from '../api/errorHandler';

// Contract Settings Types
export interface ContractSettingResponse {
  id: string;
  depositPercent: number;
  depositDeadlineHours: number;
  signingDeadlineHours: number;
  fullPaymentDaysBeforePickup: number;
  insuranceRateNormal: number;
  insuranceRateFragile: number;
  vatRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContractSettingRequest {
  depositPercent: number;
  depositDeadlineHours: number;
  signingDeadlineHours: number;
  fullPaymentDaysBeforePickup: number;
  insuranceRateNormal: number;
  insuranceRateFragile: number;
  vatRate: number;
}

export interface UpdateContractSettingRequest {
  depositPercent?: number;
  depositDeadlineHours?: number;
  signingDeadlineHours?: number;
  fullPaymentDaysBeforePickup?: number;
  insuranceRateNormal?: number;
  insuranceRateFragile?: number;
  vatRate?: number;
}

// Carrier Settings Types
export interface CarrierSettingResponse {
  id: string;
  carrierName: string;
  representativeName: string;
  carrierAddressLine: string;
  carrierEmail: string;
  carrierPhone: string;
  carrierTaxCode: string;
  carrierLatitude: number;
  carrierLongitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface CarrierSettingRequest {
  carrierName: string;
  representativeName: string;
  carrierAddressLine: string;
  carrierEmail: string;
  carrierPhone: string;
  carrierTaxCode: string;
  carrierLatitude: number;
  carrierLongitude: number;
}

// Stipulation Settings Types
export interface StipulationSettingResponse {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface StipulationSettingRequest {
  content: string;
}

const adminSettingsService = {
  // Contract Settings
  contractSettings: {
    getAll: async (): Promise<ContractSettingResponse[]> => {
      try {
        const response = await httpClient.get('/contract-settings');
        return response.data.data || [];
      } catch (error) {
        console.error('Error fetching contract settings:', error);
        throw handleApiError(error, 'Không thể tải cài đặt hợp đồng');
      }
    },

    getById: async (id: string): Promise<ContractSettingResponse> => {
      try {
        const response = await httpClient.get(`/contract-settings/${id}`);
        return response.data.data;
      } catch (error) {
        console.error('Error fetching contract setting:', error);
        throw handleApiError(error, 'Không thể tải cài đặt hợp đồng');
      }
    },

    create: async (data: ContractSettingRequest): Promise<ContractSettingResponse> => {
      try {
        const response = await httpClient.post('/contract-settings', data);
        return response.data.data;
      } catch (error) {
        console.error('Error creating contract setting:', error);
        throw handleApiError(error, 'Không thể tạo cài đặt hợp đồng');
      }
    },

    update: async (id: string, data: UpdateContractSettingRequest): Promise<ContractSettingResponse> => {
      try {
        const response = await httpClient.put(`/contract-settings/${id}`, data);
        return response.data.data;
      } catch (error) {
        console.error('Error updating contract setting:', error);
        throw handleApiError(error, 'Không thể cập nhật cài đặt hợp đồng');
      }
    },
  },

  // Carrier Settings
  carrierSettings: {
    getAll: async (): Promise<CarrierSettingResponse[]> => {
      try {
        const response = await httpClient.get('/carrier-settings');
        return response.data || [];
      } catch (error) {
        console.error('Error fetching carrier settings:', error);
        throw handleApiError(error, 'Không thể tải thông tin công ty');
      }
    },

    getById: async (id: number): Promise<CarrierSettingResponse> => {
      try {
        const response = await httpClient.get(`/carrier-settings/${id}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching carrier setting:', error);
        throw handleApiError(error, 'Không thể tải thông tin công ty');
      }
    },

    create: async (data: CarrierSettingRequest): Promise<CarrierSettingResponse> => {
      try {
        const response = await httpClient.post('/carrier-settings', data);
        return response.data;
      } catch (error) {
        console.error('Error creating carrier setting:', error);
        throw handleApiError(error, 'Không thể tạo thông tin công ty');
      }
    },

    update: async (id: string, data: CarrierSettingRequest): Promise<CarrierSettingResponse> => {
      try {
        const response = await httpClient.put(`/carrier-settings/${id}`, data);
        return response.data;
      } catch (error) {
        console.error('Error updating carrier setting:', error);
        throw handleApiError(error, 'Không thể cập nhật thông tin công ty');
      }
    },

    delete: async (id: string): Promise<void> => {
      try {
        await httpClient.delete(`/carrier-settings/${id}`);
      } catch (error) {
        console.error('Error deleting carrier setting:', error);
        throw handleApiError(error, 'Không thể xóa thông tin công ty');
      }
    },
  },

  // Stipulation Settings
  stipulationSettings: {
    get: async (): Promise<StipulationSettingResponse> => {
      try {
        const response = await httpClient.get('/stipulation-settings');
        return response.data.data;
      } catch (error) {
        console.error('Error fetching stipulation settings:', error);
        throw handleApiError(error, 'Không thể tải điều khoản hợp đồng');
      }
    },

    createOrUpdate: async (data: StipulationSettingRequest): Promise<StipulationSettingResponse> => {
      try {
        const response = await httpClient.put('/stipulation-settings', data);
        return response.data.data;
      } catch (error) {
        console.error('Error updating stipulation settings:', error);
        throw handleApiError(error, 'Không thể cập nhật điều khoản hợp đồng');
      }
    },
  },
};

export default adminSettingsService;
