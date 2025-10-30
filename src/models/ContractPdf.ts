import type { UserResponse, Role } from './User';

// Contract PDF related types
export interface ContractPdfResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: ContractData;
}

export interface ContractData {
  pdfUrl: string | null;
  contractId: string;
  message: string;
  distanceKm: number;
  customerInfo: CustomerInfo;
  orderInfo: OrderInfo;
  priceDetails: PriceDetails;
  assignResult: AssignResult[];
  contractSettings: ContractSettings;
}

export interface CustomerInfo {
  id: string;
  companyName: string;
  representativeName: string;
  representativePhone: string;
  businessLicenseNumber: string;
  businessAddress: string;
  status: string;
  userResponse: UserResponse;
}

export interface OrderInfo {
  id: string;
  totalPrice: number | null;
  notes: string;
  totalQuantity: number;
  orderCode: string;
  receiverName: string;
  receiverPhone: string;
  receiverIdentity: string;
  packageDescription: string;
  createdAt: string;
  status: string;
  deliveryAddress: AddressInfo;
  pickupAddress: AddressInfo;
  sender: SenderInfo;
  category: CategoryInfo;
  orderDetails: OrderDetailInfo[];
}

export interface AddressInfo {
  id: string;
  province: string;
  ward: string;
  street: string;
  addressType: boolean;
  latitude: number;
  longitude: number;
  customerId: string | null;
}

export interface SenderInfo {
  id: string;
  companyName: string;
  representativeName: string;
  representativePhone: string;
  businessLicenseNumber: string;
  businessAddress: string;
  status: string;
  userResponse: UserResponse | null;
}

export interface CategoryInfo {
  id: string;
  categoryName: string;
  description: string;
}

export interface OrderDetailInfo {
  weight: number;
  weightBaseUnit: number;
  unit: string;
  description: string;
  status: string;
  startTime: string | null;
  estimatedStartTime: string;
  endTime: string | null;
  estimatedEndTime: string | null;
  createdAt: string;
  updatedAt: string | null;
  trackingCode: string;
  orderId: string;
  orderSizeId: OrderSizeInfo;
  vehicleAssignmentId: VehicleAssignmentInfo;
}

export interface OrderSizeInfo {
  id: string;
  minWeight: number | null;
  maxWeight: number | null;
  minLength: number;
  maxLength: number;
  minHeight: number;
  maxHeight: number;
  minWidth: number;
  maxWidth: number;
  status: string;
  description: string;
}

export interface VehicleAssignmentInfo {
  id: string;
  vehicleId: string | null;
  driver_id_1: string | null;
  driver_id_2: string | null;
}

export interface PriceDetails {
  totalPrice: number;
  totalBeforeAdjustment: number;
  categoryExtraFee: number;
  categoryMultiplier: number;
  promotionDiscount: number;
  finalTotal: number;
  steps: PriceStep[];
  summary: string;
}

export interface PriceStep {
  vehicleRuleName: string;
  numOfVehicles: number;
  distanceRange: string;
  unitPrice: number;
  appliedKm: number;
  subtotal: number;
}

export interface AssignResult {
  vehicleIndex: number;
  vehicleRuleId: string;
  vehicleRuleName: string;
  currentLoad: number;
  assignedDetails: string[];
}

export interface ContractSettings {
  id: string;
  depositPercent: number;
  expiredDepositDate: number;
  insuranceRate: number;
}
