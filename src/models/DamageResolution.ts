export interface OrderContextInfo {
  orderId: string;
  orderCode: string;
  orderDetailId: string;
  declaredValue: number;
  hasInsurance: boolean;
  category: string;
  categoryDescription: string;
  transportFee: number;
  customerName: string;
  customerPhone: string;
  // Weight info for Pro-rata calculation
  weight: number;        // Trọng lượng kiện hư (tấn)
  totalWeight: number;   // Tổng trọng lượng đơn hàng (tấn)
}

/**
 * Compensation breakdown theo công thức chuẩn:
 * B_tổng = B_hàng + C_hư
 * 
 * Trong đó:
 * - C_hư = C_total × (W_kiện / W_total) × T_hư (Pro-rata freight refund)
 * - B_hàng = min(V_lỗ, 10 × C_total) nếu không bảo hiểm/không chứng từ
 * - B_hàng = min(V_lỗ, V_khai_báo) nếu có bảo hiểm + chứng từ
 */
export interface CompensationBreakdown {
  goodsCompensation: number;    // B_hàng - Bồi thường hàng hóa
  freightRefund: number;        // C_hư - Hoàn cước Pro-rata
  totalCompensation: number;    // B_tổng = B_hàng + C_hư
  legalLimit: number;           // 10 × C_total (giới hạn trách nhiệm - 10× cước vận chuyển)
  compensationCase: string;     // CASE1, CASE2, CASE3, CASE4
  explanation: string;          // Giải thích chi tiết
}

export interface PolicyInfo {
  maxCompensationWithoutDocs: number;
  insuranceRate: number;
  insuranceRatePercent: string;
  categoryMultiplier: number;
  policyDescription: string;
}

export interface DamageAssessmentInfo {
  assessmentId: string;
  hasDocuments: boolean;
  documentValue?: number;
  damageRate: number;
  damageRatePercent: string;
  compensationByPolicy: number;
  finalCompensation: number;
  staffNotes?: string;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
}

export interface RefundInfo {
  refundId: string;
  refundAmount: number;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  transactionCode?: string;
  bankTransferImage?: string;
  refundDate?: string;
  notes?: string;
  processedByStaffName?: string;
}

export interface DamageDetailResponse {
  issueId: string;
  issueType: string;
  issueStatus: string;
  description: string;
  evidenceImages: string[];
  reportedAt: string;
  reportedBy?: string;
  orderContext: OrderContextInfo;
  policyInfo: PolicyInfo;
  damageAssessment?: DamageAssessmentInfo;
  refundInfo?: RefundInfo;
  compensationBreakdown?: CompensationBreakdown;
}

export interface RefundRequest {
  createOrUpdate: boolean;
  refundAmount?: number;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  transactionCode?: string;
  bankTransferImage?: string;
  notes?: string;
}

export interface DamageResolutionRequest {
  hasDocuments: boolean;
  documentValue?: number;
  estimatedMarketValue?: number;
  damageRate: number;
  staffNotes?: string;
  finalCompensation: number;
  refund?: RefundRequest;
  fraudDetected?: boolean;
  fraudReason?: string;
}
