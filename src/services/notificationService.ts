import httpClient from './api/httpClient';
import type {
  Notification,
  NotificationStats,
  NotificationFilter,
  NotificationResponse,
  NotificationType,
} from '../types/notification';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL } from '../config';

type NotificationCallback = (notification: Notification) => void;

/**
 * NotificationService - WebSocket-based real-time notification service
 * Pattern: Follows IssueWebSocketService for consistent behavior
 * 
 * Key features:
 * - Singleton pattern for shared connection
 * - Callback-based subscriptions (no throwing errors)
 * - Auto-reconnect on disconnect with exponential backoff
 * - Subscriptions automatically restored after reconnect
 */
class NotificationService {
  private client: Client | null = null;
  private notificationCallbacks: NotificationCallback[] = [];
  private reconnectAttempts = 0;
  private reconnectDelay = 5000; // 5 seconds base delay
  private userId: string | null = null;
  private userRole: string | null = null;
  private isConnecting = false;

  // ==================== REST API Methods ====================

  /**
   * Get notifications for current user (userId from JWT)
   */
  async getNotifications(
    filter: NotificationFilter = {}
  ): Promise<NotificationResponse> {
    const params = new URLSearchParams();
    
    if (filter.page !== undefined) params.append('page', filter.page.toString());
    if (filter.size !== undefined) params.append('size', filter.size.toString());
    if (filter.unreadOnly) params.append('unreadOnly', 'true');
    if (filter.notificationType) params.append('notificationType', filter.notificationType);
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);

    const response = await httpClient.get<NotificationResponse>(
      `/notifications?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get notification stats for current user (userId from JWT)
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await httpClient.get<NotificationStats>(
        `/notifications/stats`
      );
      return response.data;
    } catch (error) {
      // console.warn('⚠️ [NotificationService] Stats endpoint not available');
      return {
        totalCount: 0,
        unreadCount: 0,
        readCount: 0,
        countByType: {} as Record<NotificationType, number>
      };
    }
  }

  /**
   * Mark notification as read (userId from JWT)
   */
  async markAsRead(notificationId: string): Promise<void> {
    await httpClient.put(`/notifications/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read (userId from JWT)
   */
  async markAllAsRead(): Promise<void> {
    await httpClient.put(`/notifications/read-all`);
  }

  /**
   * Delete a notification (userId from JWT)
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await httpClient.delete(`/notifications/${notificationId}`);
  }

  /**
   * Get unread count (userId from JWT)
   */
  async getUnreadCount(): Promise<number> {
    const stats = await this.getNotificationStats();
    return stats.unreadCount;
  }

  // ==================== WebSocket Methods ====================

  /**
   * Connect to WebSocket server
   * @param userId User ID for subscribing to user-specific notifications
   * @param userRole User role (STAFF, CUSTOMER, DRIVER)
   */
  async connect(userId: string, userRole: 'STAFF' | 'CUSTOMER' | 'DRIVER'): Promise<void> {
    // Store for reconnection
    this.userId = userId;
    this.userRole = userRole;

    // Already connected - just ensure subscription is set up
    if (this.client?.connected) {
      console.log('✅ [NotificationService] Already connected');
      return;
    }

    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      // console.log('⏳ [NotificationService] Connection already in progress...');
      return;
    }

    this.isConnecting = true;

    // Get JWT token from authService (in-memory storage for security)
    const authService = await import('./auth/authService').then(module => module.default);
    const token = authService.getAuthToken();

    return new Promise<void>((resolve, reject) => {
      try {
        // Use shared WebSocket endpoint (same as IssueWebSocket)
        const socket = new SockJS(`${API_BASE_URL}/vehicle-tracking-browser`);
        
        this.client = new Client({
          webSocketFactory: () => socket as any,
          connectHeaders: {
            Authorization: token ? `Bearer ${token}` : '',
          },
          debug: () => {
            // Silent in production
          },
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
          console.log('✅ [NotificationService] WebSocket connected');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          
          // Setup subscription after connected
          this.setupNotificationSubscription();
          resolve();
        };

        this.client.onStompError = (frame) => {
          console.error('❌ [NotificationService] STOMP error:', frame);
          this.isConnecting = false;
          reject(new Error(frame.headers['message'] || 'STOMP connection failed'));
        };

        this.client.onWebSocketClose = () => {
          console.warn('⚠️ [NotificationService] WebSocket closed');
          this.isConnecting = false;
          // Trigger reconnection
          this.handleReconnect();
        };

        this.client.onWebSocketError = (error) => {
          console.error('❌ [NotificationService] WebSocket error:', error);
        };

        this.client.activate();
      } catch (error) {
        console.error('❌ [NotificationService] Failed to initialize:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Setup notification subscription (internal - called after connect)
   */
  private setupNotificationSubscription() {
    if (!this.client?.connected) {
      console.warn('⚠️ [NotificationService] Cannot subscribe - not connected');
      return;
    }

    if (!this.userId) {
      console.warn('⚠️ [NotificationService] Cannot subscribe - no userId');
      return;
    }

    const topic = `/topic/user/${this.userId}/notifications`;
    
    this.client.subscribe(topic, (message: IMessage) => {
      try {
        const notification: Notification = JSON.parse(message.body);
        // console.log('📬 [NotificationService] Received notification:', notification.notificationType);
        
        // Notify all registered callbacks
        this.notificationCallbacks.forEach(callback => {
          try {
            callback(notification);
          } catch (error) {
            console.error('❌ [NotificationService] Callback error:', error);
          }
        });
      } catch (error) {
        console.error('❌ [NotificationService] Parse error:', error);
      }
    });

    // console.log(`✅ [NotificationService] Subscribed to ${topic}`);
  }

  /**
   * Handle reconnection with exponential backoff
   * Pattern: Same as IssueWebSocket - unlimited retries
   */
  private handleReconnect() {
    this.reconnectAttempts++;
    
    // Exponential backoff with max 30 seconds
    const delay = Math.min(this.reconnectDelay * Math.min(this.reconnectAttempts, 6), 30000);
    
    console.log(`🔄 [NotificationService] Reconnecting in ${delay/1000}s (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.userId && this.userRole) {
        this.connect(this.userId, this.userRole as 'STAFF' | 'CUSTOMER' | 'DRIVER').catch(error => {
          console.error('❌ [NotificationService] Reconnection failed:', error);
          // Will retry again through onWebSocketClose
        });
      }
    }, delay);
  }

  /**
   * Subscribe to notifications
   * @param callback Function to call when notification is received
   * @returns Unsubscribe function
   */
  subscribe(callback: NotificationCallback): () => void {
    this.notificationCallbacks.push(callback);
    // console.log(`📝 [NotificationService] Callback registered (total: ${this.notificationCallbacks.length})`);

    // Return unsubscribe function
    return () => {
      const index = this.notificationCallbacks.indexOf(callback);
      if (index > -1) {
        this.notificationCallbacks.splice(index, 1);
        console.log(`📝 [NotificationService] Callback removed (total: ${this.notificationCallbacks.length})`);
      }
    };
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use connect() + subscribe() instead
   */
  async subscribeToUserNotifications(
    userId: string,
    userRole: 'STAFF' | 'CUSTOMER' | 'DRIVER',
    onNotification: NotificationCallback
  ): Promise<() => void> {
    // Connect if not already connected
    await this.connect(userId, userRole);
    
    // Register callback
    return this.subscribe(onNotification);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.notificationCallbacks = [];
    this.userId = null;
    this.userRole = null;
    this.reconnectAttempts = 0;
    console.log('🔌 [NotificationService] Disconnected');
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
