import { useQuery } from '@tanstack/react-query';
import carrierSettingService from '../services/carrier/carrierSettingService';
import type { CarrierSettingsResponse } from '../models/Carrier';

/**
 * Hook để lấy thông tin carrier settings
 * Sử dụng thay vì hardcode hoặc lấy từ .env
 */
export const useCarrierSettings = () => {
  const { data: carrierSettings, isLoading, isError } = useQuery<CarrierSettingsResponse | null>({
    queryKey: ['carrierSettings'],
    queryFn: () => carrierSettingService.getCarrierSettings(),
    staleTime: 1000 * 60 * 30, // Cache 30 phút
    gcTime: 1000 * 60 * 60, // Garbage collection sau 1 giờ
  });

  return {
    carrierSettings,
    isLoading,
    isError,
    // Helper getters
    phone: carrierSettings?.carrierPhone || '',
    email: carrierSettings?.carrierEmail || '',
    address: carrierSettings?.carrierAddressLine || '',
    taxCode: carrierSettings?.carrierTaxCode || '',
  };
};

export default useCarrierSettings;
