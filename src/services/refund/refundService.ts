import httpClient from '../api/httpClient';

export interface ProcessRefundRequest {
    issueId: string;
    orderDetailId: string;
    refundAmount: number;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    transactionCode: string;
    notes?: string;
    bankTransferImage?: File;
}

export interface Refund {
    id: string;
    refundAmount: number;
    bankTransferImage: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    transactionCode: string;
    refundDate: string;
    notes?: string;
    issueId: string;
    orderDetailId: string;
    processedByStaff: {
        id: string;
        fullName: string;
        email: string;
    };
    createdAt: string;
}

interface RefundResponse {
    errorCode: number;
    message: string;
    data: Refund;
}

const refundService = {
    /**
     * Process refund for damaged goods
     * @param request Refund request data
     * @returns Promise with refund data
     */
    processRefund: async (request: ProcessRefundRequest): Promise<Refund> => {
        try {
            const formData = new FormData();
            
            // Add form fields
            formData.append('issueId', request.issueId);
            formData.append('refundAmount', request.refundAmount.toString());
            formData.append('bankName', request.bankName);
            formData.append('accountNumber', request.accountNumber);
            formData.append('accountHolderName', request.accountHolderName);
            formData.append('transactionCode', request.transactionCode);
            
            if (request.notes) {
                formData.append('notes', request.notes);
            }
            
            // Add image file if provided
            if (request.bankTransferImage) {
                console.log('📤 Adding bank transfer image:', request.bankTransferImage.name);
                formData.append('bankTransferImage', request.bankTransferImage, request.bankTransferImage.name);
            }

            console.log('📤 Submitting refund request with FormData');
            console.log('📋 FormData contents:');
            formData.forEach((value, key) => {
                if (value instanceof File) {
                    console.log(`   - ${key}: File(${value.name}, ${value.size} bytes)`);
                } else {
                    console.log(`   - ${key}: ${value}`);
                }
            });
            
            // Remove default JSON content-type header to allow axios to set multipart/form-data
            const response = await httpClient.post<RefundResponse>('/refunds/process', formData, {
                headers: {
                    'Content-Type': undefined,
                },
            });
            
            return response.data.data;
        } catch (error: any) {
            console.error('❌ Error processing refund:', error);
            throw new Error(error.response?.data?.message || 'Không thể xử lý hoàn tiền');
        }
    },

    /**
     * Get refund by issue ID
     * @param issueId Issue ID
     * @returns Promise with refund data
     */
    getRefundByIssueId: async (issueId: string): Promise<Refund | null> => {
        try {
            const response = await httpClient.get<RefundResponse>(`/refunds/issue/${issueId}`);
            return response.data.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error(`Error fetching refund for issue ${issueId}:`, error);
            throw new Error(error.response?.data?.message || 'Không thể tải thông tin hoàn tiền');
        }
    },

    /**
     * Get refund by order detail ID
     * @param orderDetailId Order detail ID
     * @returns Promise with refund data
     */
    getRefundByOrderDetailId: async (orderDetailId: string): Promise<Refund | null> => {
        try {
            const response = await httpClient.get<RefundResponse>(`/refunds/order-detail/${orderDetailId}`);
            return response.data.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error(`Error fetching refund for order detail ${orderDetailId}:`, error);
            throw new Error(error.response?.data?.message || 'Không thể tải thông tin hoàn tiền');
        }
    },
};

export default refundService;
