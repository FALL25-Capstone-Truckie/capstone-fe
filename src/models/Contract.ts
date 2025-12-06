export interface Contract {
  id: string;
  contractName: string;
  effectiveDate: string;
  expirationDate: string;
  adjustedValue: number;
  description: string;
  orderId: string;
  staffId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContractRequest {
  contractName: string;
  effectiveDate: string;
  expirationDate: string;
  adjustedValue: number;
  description: string;
  orderId: string;
  staffId: string;
}

export interface CreateContractResponse {
  success: boolean;
  message: string;
  data?: Contract;
}

export interface ContractSettings {
  id: string;
  depositPercent: number;
  expiredDepositDate: number;
  // Legacy flat insurance rate (deprecated, use insuranceRateNormal/insuranceRateFragile instead if available)
  insuranceRate?: number;
  // New detailed insurance & timing fields
  insuranceRateNormal?: number;    // Tỷ lệ BH hàng thường (0.08%)
  insuranceRateFragile?: number;   // Tỷ lệ BH hàng dễ vỡ (0.15%)
  vatRate?: number;                // Tỷ lệ VAT (10%)
  depositDeadlineHours?: number;   // Hạn thanh toán cọc (số giờ)
  signingDeadlineHours?: number;   // Hạn ký hợp đồng (số giờ)
}

export interface ContractSettingsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: ContractSettings[];
}

export interface StipulationSettings {
  id?: string;
  contents: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface StipulationSettingsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: StipulationSettings;
}

export interface UpdateStipulationSettingsRequest {
  contents: Record<string, string>;
}
