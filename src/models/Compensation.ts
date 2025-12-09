import type { RefundInfo } from './DamageResolution';

/**
 * Unified models for both DAMAGE and OFF_ROUTE compensation
 */

export interface OrderContextInfo {
  orderId: string;
  orderCode: string;
  orderDetailId: string;
  trackingCode: string;
  packageDescription: string;
  orderDetailStatus: string;
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

export interface AssessmentInfo {
  assessmentId: string;
  hasDocuments: boolean;
  documentValue?: number;
  estimatedMarketValue?: number;
  documentImages?: string[];
  assessmentRate: number;
  assessmentRatePercent: string;
  compensationByPolicy: number;
  finalCompensation: number;
  staffNotes?: string;
  adjustReason?: string;
  handlerNotes?: string;
  fraudDetected: boolean;
  fraudReason?: string;
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
}

export interface CompensationDetailResponse {
  issueId: string;
  issueType: string;
  issueStatus: string;
  description: string;
  evidenceImages: string[];
  reportedAt: string;
  reportedBy?: string;
  orderContext: OrderContextInfo;
  policyInfo: PolicyInfo;
  assessment?: AssessmentInfo;
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

export interface CompensationAssessmentRequest {
  issueId: string;
  issueType: string;
  hasDocuments?: boolean;
  documentValue?: number;
  estimatedMarketValue?: number;
  documentImages?: string[];
  documentFiles?: File[];
  refundProofFile?: File;
  assessmentRate?: number;
  assessmentRatePercent?: number;
  finalCompensation?: number;
  staffNotes?: string;
  adjustReason?: string;
  handlerNotes?: string;
  fraudDetected?: boolean;
  fraudReason?: string;
  refund?: RefundRequest;
}
