import type { ApiResponse } from '../api/types';

export interface PayOsWebhookRequest {
  orderCode: number;
  status: string;
}

export interface PayOsWebhookResponse extends ApiResponse<any> {}
