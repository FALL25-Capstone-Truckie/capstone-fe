import httpClient from "../api/httpClient";
import { handleApiError } from "../api/errorHandler";
import type {
  ContractSettingsResponse,
  StipulationSettingsResponse,
  UpdateStipulationSettingsRequest,
} from "@/models/Contract";

const contractSettingService = () => ({
  getContractSettings: async (): Promise<ContractSettingsResponse> => {
    try {
      const response = await httpClient.get<ContractSettingsResponse>(
        `/contract-settings`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching contract settings:", error);
      throw handleApiError(error, "Không thể tải cài đặt hợp đồng");
    }
  },

  updateContractSettings: async (
    settingsData: Partial<ContractSettingsResponse>
  ): Promise<ContractSettingsResponse> => {
    try {
      const response = await httpClient.put<ContractSettingsResponse>(
        `/contract-settings`,
        settingsData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating contract settings:", error);
      throw handleApiError(error, "Không thể cập nhật cài đặt hợp đồng");
    }
  },

  getStipulationSettings: async (): Promise<StipulationSettingsResponse> => {
    try {
      const response = await httpClient.get<StipulationSettingsResponse>(
        `/stipulation-settings`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching stipulation settings:", error);
      throw handleApiError(error, "Không thể tải điều khoản hợp đồng");
    }
  },

  updateStipulationSettings: async (
    settingsData: UpdateStipulationSettingsRequest
  ): Promise<StipulationSettingsResponse> => {
    try {
      const response = await httpClient.put<StipulationSettingsResponse>(
        `/stipulation-settings`,
        settingsData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating stipulation settings:", error);
      throw handleApiError(error, "Không thể cập nhật điều khoản hợp đồng");
    }
  },
});

export default contractSettingService;
