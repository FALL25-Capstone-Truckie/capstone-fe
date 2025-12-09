import httpClient from './api/httpClient';
import type { CompensationDetailResponse, CompensationAssessmentRequest } from '../models/Compensation';

// Upload response types
export interface UploadResponse {
  urls: string[];
}

// All authenticated API calls must go through httpClient so that
// JWT, refresh token logic, and global error handling are applied
// consistently across the app.

const COMPENSATION_BASE_PATH = '/compensation';

/**
 * Get compensation detail for an issue
 */
export const getCompensationDetail = async (
  issueId: string,
): Promise<CompensationDetailResponse> => {
  const response = await httpClient.get<CompensationDetailResponse>(
    `${COMPENSATION_BASE_PATH}/${issueId}`,
  );
  return response.data;
};

/**
 * Resolve compensation for an issue (with file upload support)
 */
export const resolveCompensation = async (
  request: CompensationAssessmentRequest,
): Promise<CompensationDetailResponse> => {
  const formData = new FormData();
  
  // Add JSON data as string
  const jsonData = {
    issueId: request.issueId,
    issueType: request.issueType,
    hasDocuments: request.hasDocuments,
    documentValue: request.documentValue,
    estimatedMarketValue: request.estimatedMarketValue,
    documentImages: request.documentImages,
    assessmentRate: request.assessmentRate,
    assessmentRatePercent: request.assessmentRatePercent,
    finalCompensation: request.finalCompensation,
    staffNotes: request.staffNotes,
    adjustReason: request.adjustReason,
    handlerNotes: request.handlerNotes,
    fraudDetected: request.fraudDetected,
    fraudReason: request.fraudReason,
    refund: request.refund,
  };
  
  // Gửi phần dữ liệu JSON đúng kiểu application/json để @RequestPart("data") parse được
  const dataBlob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
  formData.append('data', dataBlob);
  
  // Add files if they exist
  if (request.documentFiles && request.documentFiles.length > 0) {
    request.documentFiles.forEach((file) => {
      // Spring @RequestParam("documentFiles") MultipartFile[] -> key lặp lại "documentFiles"
      formData.append('documentFiles', file);
    });
  }
  
  if (request.refundProofFile) {
    formData.append('refundProofFile', request.refundProofFile);
  }

  // Không set Content-Type thủ công để axios/browser tự thêm boundary multipart
  const response = await httpClient.post<CompensationDetailResponse>(
    `${COMPENSATION_BASE_PATH}`,
    formData,
    {
      headers: {
        // Override default JSON header; để undefined để axios tự suy ra multipart/form-data
        'Content-Type': undefined as unknown as string,
      },
    },
  );
  return response.data;
};

/**
 * Calculate compensation preview without saving
 * Used for realtime UI updates when staff changes assessment fields
 */
export const calculateCompensationPreview = async (
  issueId: string,
  previewData: {
    hasDocuments: boolean;
    documentValue?: number;
    estimatedMarketValue?: number;
    assessmentRate: number; // 0-100 (will be converted to 0.0-1.0)
  }
): Promise<CompensationDetailResponse['compensationBreakdown']> => {
  // Convert assessmentRate from 0-100 to 0.0-1.0 for backend
  const assessmentRateDecimal = previewData.assessmentRate / 100;
  
  const response = await httpClient.post(
    `${COMPENSATION_BASE_PATH}/${issueId}/preview`,
    {
      issueId,
      hasDocuments: previewData.hasDocuments,
      documentValue: previewData.documentValue || null,
      estimatedMarketValue: previewData.estimatedMarketValue || null,
      assessmentRate: assessmentRateDecimal,
    }
  );
  
  return response.data;
};

