export interface AssignedDetail {
  id: string;
  weight: number;
  weightBaseUnit: number;
  unit: string;
  trackingCode: string;
}

export interface PackedDetail {
  orderDetailId: string;
  x: number;
  y: number;
  z: number;
  length: number;
  width: number;
  height: number;
  orientation: string;
}

export interface SuggestAssignVehicle {
  vehicleIndex: number;
  sizeRuleId: string;
  sizeRuleName: string;
  currentLoad: number;
  currentLoadUnit: string;
  assignedDetails: AssignedDetail[];
  packedDetailDetails?: PackedDetail[];
}

export interface SuggestAssignVehiclesResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: SuggestAssignVehicle[];
}

export interface CreateContractRequest {
  contractName: string;
  effectiveDate: string;
  expirationDate: string;
  description: string;
  attachFileUrl: string;
  orderId: string;
}

// Payment breakdown snapshot types
export interface CalculationStep {
  sizeRuleName: string;
  numOfVehicles: number;
  distanceRange: string;
  unitPrice: number;
  appliedKm: number;
  subtotal: number;
}

export interface VehicleAssignmentSnapshot {
  vehicleId?: string;
  vehicleTypeName: string;
  licensePlate?: string;
  sizeRuleName: string;
  pricePerKm: number;
  quantity: number;
}

export interface PaymentBreakdownSnapshot {
  totalPrice: number;
  totalBeforeAdjustment: number;
  categoryExtraFee: number;
  categoryMultiplier: number;
  promotionDiscount: number;
  finalTotal: number;
  totalTollFee: number;
  totalTollCount: number;
  vehicleType: string;
  totalDeclaredValue: number;
  insuranceFee: number;
  insuranceRate: number;
  vatRate: number;
  hasInsurance: boolean;
  grandTotal: number;
  steps: CalculationStep[];
  vehicleAssignments: VehicleAssignmentSnapshot[];
  distanceKm: number;
  depositPercent: number;
  depositAmount: number;
  remainingAmount: number;
  adjustedValue: number | null;
  effectiveTotal: number;
  snapshotDate: string;
  snapshotVersion: string;
}

export interface Contract {
  id: string;
  contractName: string;
  effectiveDate: string;
  expirationDate: string;
  totalValue: number;
  adjustedValue: number | null;
  description: string;
  attachFileUrl: string;
  status: string;
  orderId: string;
  staffId: string;
  paymentBreakdownSnapshot?: string; // JSON string
}

export interface CreateContractResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: Contract;
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
