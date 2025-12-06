import httpClient from '../api/httpClient';
import type { CarrierSettingsResponse } from '../../models/Carrier';

// Lấy thông tin carrier settings (public API)
const getCarrierSettings = async (): Promise<CarrierSettingsResponse | null> => {
    try {
        const response = await httpClient.get('/carrier-settings');
        const data = response.data;
        // API trả về array, lấy phần tử đầu tiên
        if (Array.isArray(data) && data.length > 0) {
            return data[0];
        }
        return null;
    } catch (error) {
        console.error('Error fetching carrier settings:', error);
        return null;
    }
};

const carrierSettingService = {
    getCarrierSettings
};

export default carrierSettingService;
