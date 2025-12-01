import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import userChatService from '@/services/chat/userChatService';
import type {
  ChatConversationResponse,
  ChatUserMessageResponse,
  SendMessageRequest,
  TypingIndicatorRequest,
} from '@/models/UserChat';
import { API_BASE_URL } from '@/config';

interface UseUserChatOptions {
  conversationId?: string;
  userId?: string;
  userType: 'CUSTOMER' | 'DRIVER' | 'GUEST' | 'STAFF';
  guestSessionId?: string;
  guestName?: string;
  orderId?: string;
  vehicleAssignmentId?: string;
  onNewMessage?: (message: ChatUserMessageResponse) => void;
  onTyping?: (indicator: TypingIndicatorRequest) => void;
  onConversationClosed?: () => void;
}

interface UseUserChatReturn {
  conversation: ChatConversationResponse | null;
  messages: ChatUserMessageResponse[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  hasMore: boolean;
  connected: boolean;
  typingUsers: Map<string, string>;
  initConversation: () => Promise<void>;
  sendMessage: (content: string, imageUrl?: string) => Promise<void>;
  sendTypingIndicator: (isTyping: boolean) => void;
  loadMoreMessages: () => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  clearError: () => void;
}

export const useUserChat = (options: UseUserChatOptions): UseUserChatReturn => {
  const {
    conversationId: initialConversationId,
    userId,
    userType,
    guestSessionId,
    guestName,
    orderId,
    vehicleAssignmentId,
    onNewMessage,
    onTyping,
    onConversationClosed,
  } = options;

  const [conversation, setConversation] = useState<ChatConversationResponse | null>(null);
  const [messages, setMessages] = useState<ChatUserMessageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [page, setPage] = useState(0);

  const stompClientRef = useRef<Client | null>(null);
  const conversationIdRef = useRef<string | null>(initialConversationId || null);

  // Initialize WebSocket connection
  const initWebSocket = useCallback((convId: string) => {
    if (stompClientRef.current?.connected) {
      return;
    }

    const wsUrl = `${API_BASE_URL}/ws`;
    
    // Get JWT token for authentication (consistent with other WebSockets)
    const getAuthToken = () => {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      return token ? `Bearer ${token}` : '';
    };

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: getAuthToken(),
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 5000,
      heartbeatOutgoing: 5000,
      onConnect: async () => {
        setConnected(true);
        
        // Refresh messages when reconnecting to sync with messages received while disconnected
        try {
          const messagesResponse = userType === 'GUEST' 
            ? await userChatService.getGuestMessages(convId, 0, 50)
            : await userChatService.getMessages(convId, 0, 50);
          setMessages(messagesResponse.messages);
        } catch (err) {
          console.error('Failed to refresh messages on reconnect:', err);
        }
        
        // Subscribe to conversation messages
        client.subscribe(`/topic/chat/conversation/${convId}`, (message) => {
          const newMessage: ChatUserMessageResponse = JSON.parse(message.body);
          
          // Prevent duplicate: check if message already exists
          setMessages((prev) => {
            const exists = prev.some(m => m.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });
          
          onNewMessage?.(newMessage);
        });

        // Subscribe to typing indicators
        client.subscribe(`/topic/chat/conversation/${convId}/typing`, (message) => {
          const indicator: TypingIndicatorRequest = JSON.parse(message.body);
          
          // Determine current user's sender ID based on user type
          // For GUEST: use guestSessionId
          // For CUSTOMER/DRIVER: use userId
          const currentSenderId = userType === 'GUEST' ? guestSessionId : userId;
          
          // Debug logging
          console.log('Typing indicator received:', {
            indicatorSenderId: indicator.senderId,
            indicatorSenderType: indicator.senderType,
            indicatorSenderName: indicator.senderName,
            currentSenderId: currentSenderId,
            userType: userType,
            userId: userId,
            guestSessionId: guestSessionId,
            shouldFilter: indicator.senderId === currentSenderId,
            isTyping: indicator.isTyping
          });
          
          // Don't show typing indicator from current user
          // Compare senderId with the correct identifier based on user type
          if (indicator.senderId === currentSenderId) {
            console.log('Filtering out own typing indicator');
            return;
          }
          
          // Also filter if sender type matches current user type (same side)
          // This prevents showing typing from other guests/customers on the same side
          if (indicator.senderType === userType) {
            console.log('Filtering out typing indicator from same user type');
            return;
          }
          
          if (indicator.isTyping) {
            setTypingUsers((prev) => new Map(prev).set(indicator.senderId || 'guest', indicator.senderName || 'Người dùng'));
          } else {
            setTypingUsers((prev) => {
              const next = new Map(prev);
              next.delete(indicator.senderId || 'guest');
              return next;
            });
          }
          onTyping?.(indicator);
        });

        // Subscribe to conversation closed event
        client.subscribe(`/topic/chat/conversation/${convId}/closed`, () => {
          onConversationClosed?.();
        });

        // Subscribe to read status updates
        client.subscribe(`/topic/chat/conversation/${convId}/read`, (message) => {
          try {
            const readStatus = JSON.parse(message.body);
            console.log('Read status received:', readStatus);
            
            const readerType = readStatus.readerType;
            
            // Update messages to mark them as read based on who read them
            setMessages((prev) => prev.map(msg => {
              // Skip if already read
              if (msg.isRead) return msg;
              
              if (userType === 'STAFF') {
                // Staff is viewing the chat
                // Case 1: Driver/Customer read staff's messages - show checkmarks on staff messages
                if (readerType === 'DRIVER' || readerType === 'CUSTOMER') {
                  if (msg.senderType === 'STAFF') {
                    return { ...msg, isRead: true };
                  }
                }
                // Case 2: Staff reads - mark non-staff messages as read (for unread count display)
                // But DON'T mark staff's own messages as read
                if (readerType === 'STAFF' && msg.senderType !== 'STAFF') {
                  return { ...msg, isRead: true };
                }
              } else {
                // Non-staff user (driver/customer/guest) viewing
                // Mark staff messages as read when staff sends read status
                // This shouldn't happen often since non-staff users read their own messages
                if (readerType !== userType && msg.senderType === 'STAFF') {
                  return { ...msg, isRead: true };
                }
              }
              
              return msg;
            }));
          } catch (error) {
            console.error('Error parsing read status:', error);
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setError('Lỗi kết nối chat');
      },
    });

    client.activate();
    stompClientRef.current = client;
  }, [userId, guestSessionId, onNewMessage, onTyping, onConversationClosed]);

  // Initialize conversation
  const initConversation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let conv: ChatConversationResponse;

      if (initialConversationId) {
        conv = await userChatService.getConversation(initialConversationId);
      } else {
        switch (userType) {
          case 'CUSTOMER':
            if (!userId) throw new Error('User ID is required for customer');
            conv = await userChatService.getOrCreateCustomerConversation(userId, orderId);
            break;
          case 'DRIVER':
            if (!userId) throw new Error('User ID is required for driver');
            conv = await userChatService.getOrCreateDriverConversation(userId, vehicleAssignmentId);
            break;
          case 'GUEST':
            conv = await userChatService.getOrCreateGuestConversation(guestSessionId, guestName);
            break;
          default:
            throw new Error('Invalid user type');
        }
      }

      setConversation(conv);
      conversationIdRef.current = conv.id;

      // Load initial messages (use guest method for guests)
      const messagesResponse = userType === 'GUEST' 
        ? await userChatService.getGuestMessages(conv.id, 0, 50)
        : await userChatService.getMessages(conv.id, 0, 50);
      setMessages(messagesResponse.messages);
      setHasMore(messagesResponse.hasMore);
      setPage(1);

      // Initialize WebSocket
      initWebSocket(conv.id);
    } catch (err: any) {
      setError(err.message || 'Không thể khởi tạo cuộc hội thoại');
    } finally {
      setLoading(false);
    }
  }, [initialConversationId, userId, userType, guestSessionId, guestName, orderId, vehicleAssignmentId, initWebSocket]);

  // Send message
  const sendMessage = useCallback(async (content: string, imageUrl?: string) => {
    if (!conversationIdRef.current) return;

    setSending(true);
    try {
      const request: SendMessageRequest = {
        conversationId: conversationIdRef.current,
        senderId: userId,
        guestSessionId,
        senderName: guestName,
        content,
        messageType: imageUrl ? 'IMAGE' : 'TEXT',
        imageUrl,
      };

      // Send via WebSocket if connected, otherwise use REST API
      if (stompClientRef.current?.connected) {
        // WebSocket will broadcast the message back, so we don't add it locally
        // The message will be added when received via subscription
        stompClientRef.current.publish({
          destination: `/app/user-chat.send/${conversationIdRef.current}`,
          body: JSON.stringify(request),
        });
      } else {
        // Use guest method for guests (no auth required)
        const response = userType === 'GUEST'
          ? await userChatService.sendGuestMessage(conversationIdRef.current, request)
          : await userChatService.sendMessage(conversationIdRef.current, request);
        // Only add to local state if not using WebSocket
        setMessages((prev) => {
          const exists = prev.some(m => m.id === response.id);
          if (exists) return prev;
          return [...prev, response];
        });
      }
    } catch (err: any) {
      setError(err.message || 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  }, [userId, guestSessionId, guestName, userType]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!stompClientRef.current?.connected || !conversationIdRef.current) return;

    // Use guestSessionId for guests, userId for authenticated users
    const senderId = userType === 'GUEST' ? guestSessionId : userId;

    const indicator: TypingIndicatorRequest = {
      senderId: senderId,
      senderName: guestName || 'Người dùng',
      senderType: userType,
      isTyping,
    };

    console.log('Sending typing indicator:', {
      senderId: senderId,
      userType: userType,
      guestSessionId: guestSessionId,
      userId: userId,
      isTyping: isTyping,
      destination: `/app/user-chat.typing/${conversationIdRef.current}`
    });

    stompClientRef.current.publish({
      destination: `/app/user-chat.typing/${conversationIdRef.current}`,
      body: JSON.stringify(indicator),
    });
  }, [userId, guestSessionId, guestName, userType]);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!conversationIdRef.current || loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await userChatService.getMessages(conversationIdRef.current, page, 50);
      setMessages((prev) => [...response.messages, ...prev]);
      setHasMore(response.hasMore);
      setPage((p) => p + 1);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thêm tin nhắn');
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // Upload image
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    if (!conversationIdRef.current) throw new Error('Conversation not initialized');
    return userChatService.uploadImage(file, conversationIdRef.current);
  }, []);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  // Reset conversation when user type or user ID changes (login/logout)
  useEffect(() => {
    console.log('useUserChat: User identity changed, resetting conversation', {
      userType,
      userId,
      guestSessionId,
      hasConversation: !!conversation
    });
    
    // Disconnect existing WebSocket
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }
    
    // Reset all state
    setConversation(null);
    setMessages([]);
    setTypingUsers(new Map());
    setConnected(false);
    setPage(0);
    setHasMore(true);
    conversationIdRef.current = null;
  }, [userType, userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  return {
    conversation,
    messages,
    loading,
    sending,
    error,
    hasMore,
    connected,
    typingUsers,
    initConversation,
    sendMessage,
    sendTypingIndicator,
    loadMoreMessages,
    uploadImage,
    clearError,
  };
};

export default useUserChat;
