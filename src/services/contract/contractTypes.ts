// Contract PDF API Response Types
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
  carrierInfo: CarrierInfo;
  customerInfo: CustomerInfo;
  orderInfo: OrderInfo;
  priceDetails: PriceDetails;
  assignResult: AssignResult[];
  contractSettings: ContractSettings;
  customDepositPercent?: number | null; // Custom deposit percent for this contract (overrides contractSettings.depositPercent if set)
}

export interface CarrierInfo {
  id: string;
  carrierName: string;
  representativeName: string;
  carrierAddressLine: string;
  carrierEmail: string;
  carrierPhone: string;
  carrierTaxCode: string;
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

export interface UserResponse {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: boolean;
  dateOfBirth: string;
  imageUrl: string;
  status: string;
  role: Role;
}

export interface Role {
  id: string;
  roleName: string;
  description: string;
  isActive: boolean;
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
  deliveryAddress: Address;
  pickupAddress: Address;
  sender: Sender;
  category: Category;
  orderDetails: OrderDetail[];
  // Insurance fields
  hasInsurance?: boolean;
  totalInsuranceFee?: number;
  totalDeclaredValue?: number;
}

export interface Address {
  id: string;
  province: string;
  ward: string;
  street: string;
  addressType: boolean;
  latitude: number;
  longitude: number;
  customerId: string | null;
}

export interface Sender {
  id: string;
  companyName: string;
  representativeName: string;
  representativePhone: string;
  businessLicenseNumber: string;
  businessAddress: string;
  status: string;
  userResponse: UserResponse | null;
}

export interface Category {
  id: string;
  categoryName: string;
  description: string;
}

export interface OrderDetail {
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
  orderSizeId: OrderSize;
  vehicleAssignmentId: VehicleAssignment;
}

export interface OrderSize {
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

export interface VehicleAssignment {
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
  // Insurance fields
  totalDeclaredValue?: number;   // Tổng giá trị khai báo
  insuranceFee?: number;         // Phí bảo hiểm (đã bao gồm VAT)
  insuranceRate?: number;        // Tỷ lệ bảo hiểm (0.0008 hoặc 0.0015)
  vatRate?: number;              // Tỷ lệ VAT (0.1)
  hasInsurance?: boolean;        // Có mua bảo hiểm không
  grandTotal?: number;           // Tổng cuối cùng (phí vận chuyển + phí bảo hiểm)
}

export interface PriceStep {
  sizeRuleName: string;
  numOfVehicles: number;
  distanceRange: string;
  unitPrice: number;
  appliedKm: number;
  subtotal: number;
}

export interface AssignResult {
  vehicleIndex: number;
  sizeRuleId: string;
  sizeRuleName: string;
  currentLoad: number;
  currentLoadUnit: string;
  assignedDetails: string[];
}

export interface ContractSettings {
  id: string;
  depositPercent: number;
  expiredDepositDate: number;      // Hạn thanh toán cọc (số ngày)
  depositDeadlineHours?: number;   // Hạn thanh toán cọc (số giờ) - ưu tiên nếu có
  signingDeadlineHours?: number;   // Hạn ký hợp đồng (số giờ)
  insuranceRateNormal?: number;    // Tỷ lệ BH hàng thường (0.08%)
  insuranceRateFragile?: number;   // Tỷ lệ BH hàng dễ vỡ (0.15%)
  vatRate?: number;                // Tỷ lệ VAT (10%)
}
