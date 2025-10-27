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
  staffId?: string; // Optional because service will add it from sessionStorage
  attachFileUrl?: string; // Optional because service will add default value
}

export interface CreateContractResponse {
  success: boolean;
  message: string;
  data?: Contract;
}

// Vehicle assignment suggestion types
export interface SuggestAssignVehicle {
  vehicleIndex: number;
  vehicleRuleId: string;
  vehicleRuleName: string;
  currentLoad: number;
  currentLoadUnit: string;
  assignedDetails: string[];
}

export interface SuggestAssignVehiclesResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: SuggestAssignVehicle[];
}

export interface GeneratePdfResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    pdfUrl: string;
    contractId: string;
    message: string;
  };
}
