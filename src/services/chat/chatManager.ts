/**
 * ChatManager - Centralized chat badge state management
 * 
 * Pattern: Follows NotificationManager pattern for consistent behavior
 * - Manages unread count for chat badge
 * - Broadcasts updates to all registered components
 * - Handles WebSocket message events
 */

import userChatService from './userChatService';

interface ChatManagerCallbacks {
  onUnreadCountUpdate?: (count: number) => void;
  onNewMessage?: (conversationId: string, senderId: string) => void;
}

class ChatManager {
  private static instance: ChatManager;
  private callbacks: Map<string, ChatManagerCallbacks> = new Map();
  private unreadCount: number = 0;
  private isInitialized: boolean = false;
  private isInitializing: boolean = false;
  private currentUserId: string = '';
  private currentUserRole: string = '';

  private constructor() {}

  static getInstance(): ChatManager {
    if (!ChatManager.instance) {
      ChatManager.instance = new ChatManager();
    }
    return ChatManager.instance;
  }

  /**
   * Initialize chat manager with user context
   */
  async initialize(userId: string, userRole: string): Promise<void> {
    // Prevent duplicate initialization
    if (this.isInitialized && this.currentUserId === userId) {
      return;
    }

    // Prevent concurrent initialization
    if (this.isInitializing) {
      return;
    }

    this.isInitializing = true;
    this.currentUserId = userId;
    this.currentUserRole = userRole;

    try {
      // Fetch initial unread count based on role
      await this.fetchUnreadCount();
      
      this.isInitialized = true;
      this.isInitializing = false;
      console.log('✅ [ChatManager] Initialized successfully, unread count:', this.unreadCount);
      
    } catch (error) {
      console.error('❌ [ChatManager] Failed to initialize:', error);
      this.isInitializing = false;
    }
  }

  /**
   * Fetch unread count from API
   */
  async fetchUnreadCount(): Promise<number> {
    try {
      if (this.currentUserRole === 'staff') {
        // Staff: use staff endpoint
        this.unreadCount = await userChatService.getUnreadCount();
      } else if (this.currentUserRole === 'customer') {
        // Customer: calculate from staff conversations endpoint with customer filter
        // Note: Customer doesn't have a dedicated conversations endpoint, 
        // so we use the unread count from their active conversation
        this.unreadCount = 0; // Customers typically only have 1 conversation
      } else {
        // Guest or other: no badge (guests only see their own conversation)
        this.unreadCount = 0;
      }
      
      // Broadcast to all components
      this.broadcastUnreadCount();
      
      return this.unreadCount;
    } catch (error) {
      console.error('❌ [ChatManager] Failed to fetch unread count:', error);
      return 0;
    }
  }

  /**
   * Register component callbacks
   */
  register(id: string, callbacks: ChatManagerCallbacks): void {
    this.callbacks.set(id, callbacks);
    
    // Immediately send current unread count to new component
    if (callbacks.onUnreadCountUpdate) {
      callbacks.onUnreadCountUpdate(this.unreadCount);
    }
  }

  /**
   * Unregister component callbacks
   */
  unregister(id: string): void {
    this.callbacks.delete(id);
  }

  /**
   * Handle new message received via WebSocket
   * Only increment badge if message is NOT from current user
   */
  handleNewMessage(conversationId: string, senderId: string): void {
    // IMPORTANT: Only increment if message is from someone else
    if (senderId !== this.currentUserId) {
      this.unreadCount += 1;
      this.broadcastUnreadCount();
      
      // Notify components about new message
      this.callbacks.forEach((callbacks) => {
        if (callbacks.onNewMessage) {
          callbacks.onNewMessage(conversationId, senderId);
        }
      });
    }
  }

  /**
   * Mark conversation as read - decrease badge count
   */
  markAsRead(conversationUnreadCount: number): void {
    this.unreadCount = Math.max(0, this.unreadCount - conversationUnreadCount);
    this.broadcastUnreadCount();
  }

  /**
   * Broadcast unread count to all registered components
   */
  private broadcastUnreadCount(): void {
    this.callbacks.forEach((callbacks) => {
      if (callbacks.onUnreadCountUpdate) {
        callbacks.onUnreadCountUpdate(this.unreadCount);
      }
    });
  }

  /**
   * Get current unread count
   */
  getUnreadCount(): number {
    return this.unreadCount;
  }

  /**
   * Set unread count directly (for optimistic updates)
   */
  setUnreadCount(count: number): void {
    this.unreadCount = Math.max(0, count);
    this.broadcastUnreadCount();
  }

  /**
   * Refresh unread count from API
   */
  async refresh(): Promise<void> {
    await this.fetchUnreadCount();
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.callbacks.clear();
    this.unreadCount = 0;
    this.isInitialized = false;
    this.isInitializing = false;
    this.currentUserId = '';
    this.currentUserRole = '';
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string {
    return this.currentUserId;
  }
}

export const chatManager = ChatManager.getInstance();
export default chatManager;
