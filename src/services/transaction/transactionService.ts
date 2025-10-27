import httpClient from '../api/httpClient';
import type { PayOsWebhookRequest, PayOsWebhookResponse } from './types';

/**
 * Transaction Service
 * Handles payment and transaction related API calls
 */
class TransactionService {
  /**
   * Send PayOS webhook notification
   * @param data - Webhook data containing orderCode and status
   * @returns Promise with webhook response
   */
  async sendPayOsWebhook(data: PayOsWebhookRequest): Promise<PayOsWebhookResponse> {
    const response = await httpClient.post<PayOsWebhookResponse>(
      '/transactions/pay-os/webhook',
      { data }
    );
    return response.data;
  }
}

export const transactionService = new TransactionService();
export default transactionService;
