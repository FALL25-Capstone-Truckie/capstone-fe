import httpClient from '../api/httpClient';
import axios from 'axios';
import { API_URL } from '@/config/env';

// Create a separate axios instance for guest requests (no auth headers)
const guestHttpClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
import { handleApiError } from '../api/errorHandler';
import type {
  ChatConversationResponse,
  ChatMessagesPageResponse,
  ChatUserMessageResponse,
  ChatStatisticsResponse,
  CustomerOverviewResponse,
  DriverOverviewResponse,
  OrderQuickViewResponse,
  SendMessageRequest,
} from '../../models/UserChat';

const BASE_URL = '/user-chat';

/**
 * Service for user-to-user chat functionality
 */
const userChatService = {
  // ==================== Customer Endpoints ====================

  /**
   * Create or get customer conversation
   */
  getOrCreateCustomerConversation: async (
    customerId: string,
    orderId?: string
  ): Promise<ChatConversationResponse> => {
    try {
      const params = new URLSearchParams({ customerId });
      if (orderId) params.append('orderId', orderId);
      
      const response = await httpClient.post<ChatConversationResponse>(
        `${BASE_URL}/customer/conversations?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tạo cuộc hội thoại');
    }
  },

  // ==================== Driver Endpoints ====================

  /**
   * Create or get driver conversation
   */
  getOrCreateDriverConversation: async (
    driverId: string,
    vehicleAssignmentId?: string
  ): Promise<ChatConversationResponse> => {
    try {
      const params = new URLSearchParams({ driverId });
      if (vehicleAssignmentId) params.append('vehicleAssignmentId', vehicleAssignmentId);
      
      const response = await httpClient.post<ChatConversationResponse>(
        `${BASE_URL}/driver/conversations?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tạo cuộc hội thoại');
    }
  },

  // ==================== Guest Endpoints ====================

  /**
   * Create or get guest conversation (uses guest http client without auth)
   */
  getOrCreateGuestConversation: async (
    sessionId?: string,
    guestName?: string
  ): Promise<ChatConversationResponse> => {
    try {
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      if (guestName) params.append('guestName', guestName);
      
      // Use guest http client (no auth headers) for guest endpoints
      const response = await guestHttpClient.post<ChatConversationResponse>(
        `${BASE_URL}/guest/conversations?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tạo cuộc hội thoại');
    }
  },

  /**
   * Send message as guest (uses guest http client without auth)
   */
  sendGuestMessage: async (
    conversationId: string,
    request: SendMessageRequest
  ): Promise<ChatUserMessageResponse> => {
    try {
      const response = await guestHttpClient.post<ChatUserMessageResponse>(
        `${BASE_URL}/conversations/${conversationId}/messages`,
        request
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể gửi tin nhắn');
    }
  },

  /**
   * Get messages as guest (uses guest http client without auth)
   */
  getGuestMessages: async (
    conversationId: string,
    page: number = 0,
    size: number = 50
  ): Promise<ChatMessagesPageResponse> => {
    try {
      const response = await guestHttpClient.get<ChatMessagesPageResponse>(
        `${BASE_URL}/conversations/${conversationId}/messages`,
        { params: { page, size } }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tải tin nhắn');
    }
  },

  // ==================== Common Endpoints ====================

  /**
   * Get conversation by ID
   */
  getConversation: async (conversationId: string): Promise<ChatConversationResponse> => {
    try {
      const response = await httpClient.get<ChatConversationResponse>(
        `${BASE_URL}/conversations/${conversationId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tải cuộc hội thoại');
    }
  },

  /**
   * Get messages for a conversation with pagination
   */
  getMessages: async (
    conversationId: string,
    page: number = 0,
    size: number = 50
  ): Promise<ChatMessagesPageResponse> => {
    try {
      const response = await httpClient.get<ChatMessagesPageResponse>(
        `${BASE_URL}/conversations/${conversationId}/messages`,
        { params: { page, size } }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tải tin nhắn');
    }
  },

  /**
   * Send a message via REST API
   */
  sendMessage: async (
    conversationId: string,
    request: SendMessageRequest
  ): Promise<ChatUserMessageResponse> => {
    try {
      const response = await httpClient.post<ChatUserMessageResponse>(
        `${BASE_URL}/conversations/${conversationId}/messages`,
        request
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể gửi tin nhắn');
    }
  },

  /**
   * Upload chat image
   */
  uploadImage: async (file: File, conversationId: string): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);

      const response = await httpClient.post<string>(
        `${BASE_URL}/upload-image`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tải lên hình ảnh');
    }
  },

  // ==================== Staff Endpoints ====================

  /**
   * Get all active conversations for staff
   */
  getStaffConversations: async (
    type?: string,
    page: number = 0,
    size: number = 20
  ): Promise<{ content: ChatConversationResponse[]; totalElements: number; totalPages: number }> => {
    try {
      const params: Record<string, string | number> = { page, size };
      if (type) params.type = type;

      const response = await httpClient.get(`${BASE_URL}/staff/conversations`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tải danh sách cuộc hội thoại');
    }
  },

  /**
   * Get conversations with unread messages
   */
  getUnreadConversations: async (): Promise<ChatConversationResponse[]> => {
    try {
      const response = await httpClient.get<ChatConversationResponse[]>(
        `${BASE_URL}/staff/conversations/unread`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tải cuộc hội thoại chưa đọc');
    }
  },

  /**
   * Mark conversation messages as read
   */
  markAsRead: async (conversationId: string): Promise<void> => {
    try {
      await httpClient.put(
        `${BASE_URL}/staff/conversations/${conversationId}/read`,
        null
      );
    } catch (error) {
      throw handleApiError(error, 'Không thể đánh dấu đã đọc');
    }
  },

  markAsReadForCustomer: async (conversationId: string): Promise<void> => {
    try {
      await httpClient.put(
        `${BASE_URL}/customer/conversations/${conversationId}/read`,
        null
      );
    } catch (error) {
      throw handleApiError(error, 'Không thể đánh dấu đã đọc');
    }
  },

  /**
   * Close a conversation
   */
  closeConversation: async (conversationId: string): Promise<void> => {
    try {
      await httpClient.put(
        `${BASE_URL}/staff/conversations/${conversationId}/close`,
        null
      );
    } catch (error) {
      throw handleApiError(error, 'Không thể đóng cuộc hội thoại');
    }
  },

  /**
   * Search conversations by name
   */
  searchConversations: async (keyword: string): Promise<ChatConversationResponse[]> => {
    try {
      const response = await httpClient.get<ChatConversationResponse[]>(
        `${BASE_URL}/staff/conversations/search`,
        { params: { keyword } }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tìm kiếm cuộc hội thoại');
    }
  },

  /**
   * Search messages in a conversation
   */
  searchMessages: async (
    conversationId: string,
    keyword: string
  ): Promise<ChatUserMessageResponse[]> => {
    try {
      const response = await httpClient.get<ChatUserMessageResponse[]>(
        `${BASE_URL}/staff/messages/search`,
        { params: { conversationId, keyword } }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tìm kiếm tin nhắn');
    }
  },

  // ==================== Overview Endpoints ====================

  /**
   * Get customer overview for staff
   */
  getCustomerOverview: async (customerId: string): Promise<CustomerOverviewResponse> => {
    try {
      const response = await httpClient.get<CustomerOverviewResponse>(
        `${BASE_URL}/staff/customer/${customerId}/overview`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tải thông tin khách hàng');
    }
  },

  /**
   * Get driver overview for staff
   */
  getDriverOverview: async (driverId: string): Promise<DriverOverviewResponse> => {
    try {
      const response = await httpClient.get<DriverOverviewResponse>(
        `${BASE_URL}/staff/driver/${driverId}/overview`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tải thông tin tài xế');
    }
  },

  /**
   * Get order quick view for staff
   */
  getOrderQuickView: async (orderId: string): Promise<OrderQuickViewResponse> => {
    try {
      const response = await httpClient.get<OrderQuickViewResponse>(
        `${BASE_URL}/staff/order/${orderId}/quick-view`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tải thông tin đơn hàng');
    }
  },

  /**
   * Get vehicle assignment quick view for staff (comprehensive trip info with tabs)
   */
  getVehicleAssignmentQuickView: async (vehicleAssignmentId: string): Promise<import('@/models/UserChat').VehicleAssignmentQuickViewResponse> => {
    try {
      const response = await httpClient.get<import('@/models/UserChat').VehicleAssignmentQuickViewResponse>(
        `${BASE_URL}/staff/vehicle-assignment/${vehicleAssignmentId}/quick-view`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tải thông tin chuyến xe');
    }
  },

  // ==================== Statistics Endpoints ====================

  /**
   * Get chat statistics
   */
  getChatStatistics: async (): Promise<ChatStatisticsResponse> => {
    try {
      const response = await httpClient.get<ChatStatisticsResponse>(
        `${BASE_URL}/staff/statistics`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tải thống kê chat');
    }
  },

  /**
   * Get total unread message count for staff
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await httpClient.get<number>(`${BASE_URL}/staff/unread-count`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Không thể tải số tin nhắn chưa đọc');
    }
  },

  /**
   * Alias for getUnreadCount (for ChatManager)
   */
  getStaffUnreadCount: async (): Promise<number> => {
    try {
      const response = await httpClient.get<number>(`${BASE_URL}/staff/unread-count`);
      return response.data;
    } catch (error) {
      console.error('Failed to get staff unread count:', error);
      return 0;
    }
  },

  /**
   * Get customer conversations
   */
  getCustomerConversations: async (
    page: number = 0,
    size: number = 20
  ): Promise<{ content: ChatConversationResponse[]; totalElements: number; totalPages: number }> => {
    try {
      const response = await httpClient.get(`${BASE_URL}/customer/conversations`, { 
        params: { page, size } 
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get customer conversations:', error);
      return { content: [], totalElements: 0, totalPages: 0 };
    }
  },
};

export default userChatService;
