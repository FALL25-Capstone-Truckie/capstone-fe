import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Image,
  Loader2,
  Info,
  X,
  Phone,
  Mail,
  Package,
  Search,
  MoreVertical,
  CheckCheck,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { debounce } from 'lodash';
import { useUserChat } from '@/hooks/useUserChat';
import type {
  ChatConversationResponse,
  ChatUserMessageResponse,
} from '@/models/UserChat';
import { ChatParticipantType } from '@/models/UserChat';
import OrderQuickViewModal from './OrderQuickViewModal';
import VehicleAssignmentQuickViewModal from './VehicleAssignmentQuickViewModal';

interface StaffChatPanelProps {
  conversation: ChatConversationResponse;
  staffId: string;
  onViewCustomerProfile: (customerId: string) => void;
  onViewDriverProfile: (driverId: string) => void;
  onConversationClosed: () => void;
}

const StaffChatPanel: React.FC<StaffChatPanelProps> = ({
  conversation,
  staffId,
  onViewCustomerProfile,
  onViewDriverProfile,
  onConversationClosed,
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [orderQuickViewId, setOrderQuickViewId] = useState<string | null>(null);
  const [vehicleAssignmentQuickViewId, setVehicleAssignmentQuickViewId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const lastScrollTopRef = useRef(0);
  const manualScrollLockRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef(0);

  // Use real-time WebSocket chat hook
  const {
    messages,
    loading,
    sending,
    connected,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
    uploadImage,
    clearError,
  } = useUserChat({
    conversationId: conversation.id,
    userId: staffId,
    userType: 'STAFF',
    onConversationClosed,
  });
  
  // Debounced typing indicator
  const debouncedStopTyping = useCallback(
    debounce(() => sendTypingIndicator(false), 1500),
    [sendTypingIndicator]
  );

  // Auto-scroll to bottom only when NEW messages arrive (not typing indicators)
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > lastMessageCountRef.current) {
      // Check if we have a manual scroll lock active
      if (manualScrollLockRef.current) {
        // Show scroll to bottom button instead of auto-scrolling
        setShowScrollToBottom(true);
      } else {
        // Auto-scroll to bottom on new messages - use scrollTop for full scroll
        // Use multiple attempts to ensure scroll reaches bottom
        setTimeout(() => {
          if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            container.scrollTop = container.scrollHeight;
            // Second scroll after animation completes
            setTimeout(() => {
              if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
              }
            }, 100);
          }
        }, 50);
      }
      
      // Update last message count
      lastMessageCountRef.current = messages.length;
    }
  }, [messages]);

  // Track previous conversation ID to detect conversation switch
  const prevConversationIdRef = useRef<string | null>(null);
  
  // Reset all scroll state when conversation changes
  useEffect(() => {
    // Track if this is a conversation switch (for debugging)
    const _isConversationSwitch = prevConversationIdRef.current !== null && 
                                  prevConversationIdRef.current !== conversation.id;
    prevConversationIdRef.current = conversation.id;
    
    // Reset refs and state when switching conversations
    lastMessageCountRef.current = 0;
    lastScrollTopRef.current = 0;
    setIsUserScrolling(false);
    setShowScrollToTop(false);
    setShowScrollToBottom(false);
    
    // Clear any existing manual scroll lock
    if (manualScrollLockRef.current) {
      clearTimeout(manualScrollLockRef.current);
      manualScrollLockRef.current = null;
    }
    
    // Force scroll to bottom function
    const forceScrollToBottom = () => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    };
    
    // Multiple scroll attempts to ensure we reach bottom after conversation loads
    forceScrollToBottom(); // Immediate
    const timer1 = setTimeout(forceScrollToBottom, 50);
    const timer2 = setTimeout(forceScrollToBottom, 150);
    const timer3 = setTimeout(forceScrollToBottom, 300);
    const timer4 = setTimeout(forceScrollToBottom, 500);
    const timer5 = setTimeout(forceScrollToBottom, 800); // Extra delay for slow loading
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [conversation.id]);

  // Initialize scroll detection after component mounts and scroll to bottom when loading completes
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      const container = messagesContainerRef.current;
      // Check if content is scrollable
      if (container.scrollHeight > container.clientHeight) {
        // Show scroll to top if we're not at top
        setShowScrollToTop(container.scrollTop > 200);
        // Show scroll to bottom if we're not at bottom
        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        setShowScrollToBottom(distanceFromBottom > 150);
      }
      
      // When loading completes, scroll to bottom
      if (!loading && !manualScrollLockRef.current) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [loading, messages.length]);
  
  // Auto-scroll to bottom when typing indicator appears
  useEffect(() => {
    if (typingUsers.size > 0 && messagesContainerRef.current && !manualScrollLockRef.current) {
      // Scroll to bottom when someone starts typing
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [typingUsers.size]);

  // Handle scroll events to show/hide scroll buttons and detect user scrolling
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Only show scroll buttons if content is actually scrollable
    if (scrollHeight <= clientHeight) {
      setShowScrollToTop(false);
      setShowScrollToBottom(false);
      return;
    }
    
    // Detect if user is scrolling up (reading old messages)
    if (scrollTop < lastScrollTopRef.current - 10) {
      setIsUserScrolling(true);
    }
    
    // Reset user scrolling flag and clear manual scroll lock when near bottom
    if (distanceFromBottom < 50) {
      setIsUserScrolling(false);
      setShowScrollToBottom(false);
      
      // Clear manual scroll lock when user scrolls near bottom
      if (manualScrollLockRef.current) {
        clearTimeout(manualScrollLockRef.current);
        manualScrollLockRef.current = null;
      }
    }
    
    lastScrollTopRef.current = scrollTop;
    
    // Show scroll to top when scrolled down more than 200px
    setShowScrollToTop(scrollTop > 200);
    
    // Show scroll to bottom when not near bottom (more than 150px away)
    setShowScrollToBottom(distanceFromBottom > 150);
  }, []);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    if (messagesContainerRef.current) {
      setIsUserScrolling(true);
      
      // Clear any existing manual scroll lock
      if (manualScrollLockRef.current) {
        clearTimeout(manualScrollLockRef.current);
      }
      
      // Set manual scroll lock for 3 seconds to prevent auto-scroll
      manualScrollLockRef.current = setTimeout(() => {
        manualScrollLockRef.current = null;
        // When lock expires, if we're not near bottom, show scroll to bottom button
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
          if (distanceFromBottom > 150) {
            setShowScrollToBottom(true);
          }
        }
      }, 3000);
      
      messagesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Scroll to bottom function - scroll container to max scroll position
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      setIsUserScrolling(false);
      
      // Clear manual scroll lock when user explicitly scrolls to bottom
      if (manualScrollLockRef.current) {
        clearTimeout(manualScrollLockRef.current);
        manualScrollLockRef.current = null;
      }
      
      // Use scrollTop to fully scroll to bottom with smooth animation
      const container = messagesContainerRef.current;
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      setShowScrollToBottom(false);
      
      // Ensure we're at the very bottom after animation
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 350);
    }
  }, []);

  // Send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || sending) return;

    const content = messageInput.trim();
    setMessageInput('');
    sendTypingIndicator(false); // Stop typing indicator when sending
    
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessageInput(content);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      await sendMessage('[Hình ảnh]', imageUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Close conversation
  const handleCloseConversation = async () => {
    if (!window.confirm('Bạn có chắc muốn đóng cuộc hội thoại này?')) return;
    
    try {
      // Note: This would need to be implemented in useUserChat hook
      // For now, just call the parent callback
      onConversationClosed();
    } catch (error) {
      console.error('Failed to close conversation:', error);
    }
  };

  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), 'HH:mm', { locale: vi });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    }
    return format(date, 'dd/MM/yyyy', { locale: vi });
  };

  const getInitiatorName = () => {
    return conversation.initiatorName || conversation.guestName || 'Khách';
  };

  const handleViewProfile = () => {
    if (conversation.conversationType === 'CUSTOMER_SUPPORT' && conversation.initiatorId) {
      onViewCustomerProfile(conversation.initiatorId);
    } else if (conversation.conversationType === 'DRIVER_SUPPORT' && conversation.initiatorId) {
      onViewDriverProfile(conversation.initiatorId);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            {conversation.initiatorImageUrl ? (
              <img
                src={conversation.initiatorImageUrl}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold">
                {getInitiatorName().charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-semibold">{getInitiatorName()}</h2>
            <p className="text-xs opacity-80">
              {conversation.conversationType === 'CUSTOMER_SUPPORT'
                ? 'Khách hàng'
                : conversation.conversationType === 'DRIVER_SUPPORT'
                ? 'Tài xế'
                : 'Khách vãng lai'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection status indicator */}
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              connected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-xs opacity-70">
              {connected ? 'Online' : 'Offline'}
            </span>
          </div>
          
          {/* Show info button for customer and driver chats (not guest) */}
          {conversation.conversationType !== 'GUEST_SUPPORT' && (
            <button
              onClick={handleViewProfile}
              className="p-2 hover:bg-blue-500 rounded-full"
              title="Xem thông tin"
              disabled={!conversation.initiatorId}
            >
              <Info size={20} className={!conversation.initiatorId ? 'opacity-50' : ''} />
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-blue-500 rounded-full"
            >
              <MoreVertical size={20} />
            </button>
            {showActions && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg py-1 min-w-[150px] z-10">
                <button
                  onClick={handleCloseConversation}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Đóng hội thoại
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Orders Banner */}
      {conversation.activeOrders && conversation.activeOrders.length > 0 && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <Package size={16} className="text-orange-600" />
            <span className="text-orange-700 font-medium">Đơn hàng đang xử lý:</span>
            <div className="flex gap-1 flex-wrap">
              {conversation.activeOrders.map((order) => (
                <button
                  key={order.orderId}
                  onClick={() => setOrderQuickViewId(order.orderId)}
                  className="px-2 py-0.5 bg-orange-200 text-orange-800 rounded text-xs hover:bg-orange-300"
                >
                  {order.orderCode}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tracking Code for Driver - Clickable to open Vehicle Assignment Quick View */}
      {conversation.currentTrackingCode && conversation.currentVehicleAssignmentId && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <Package size={16} className="text-green-600" />
            <span className="text-green-700">Chuyến xe gần đây:</span>
            <button
              onClick={() => setVehicleAssignmentQuickViewId(conversation.currentVehicleAssignmentId!)}
              className="px-3 py-1 bg-green-200 text-green-800 rounded-lg font-mono font-semibold hover:bg-green-300 transition-colors flex items-center gap-1"
            >
              {conversation.currentTrackingCode}
              <Info size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 relative" onScroll={handleScroll}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Chưa có tin nhắn nào</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isStaff = msg.senderType === ChatParticipantType.STAFF;
              const isSystem = msg.senderType === ChatParticipantType.SYSTEM;
              const showDate =
                index === 0 ||
                formatDate(msg.createdAt) !== formatDate(messages[index - 1].createdAt);

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="text-center text-xs text-gray-400 my-2">
                      {formatDate(msg.createdAt)}
                    </div>
                  )}
                  {isSystem ? (
                    <div className="text-center">
                      <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full italic">
                        {msg.content}
                      </span>
                    </div>
                  ) : (
                    <div className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isStaff ? 'order-2' : 'order-1'}`}>
                        {!isStaff && (
                          <p className="text-xs text-gray-500 mb-1 ml-1">
                            {msg.senderName || getInitiatorName()}
                          </p>
                        )}
                        <div
                          className={`px-3 py-2 rounded-lg ${
                            isStaff ? 'bg-blue-600 text-white' : 'bg-white border shadow-sm'
                          }`}
                        >
                          {msg.imageUrl && (
                            <img
                              src={msg.imageUrl}
                              alt="Chat image"
                              className="max-w-full rounded mb-1 cursor-pointer"
                              onClick={() => window.open(msg.imageUrl, '_blank')}
                            />
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <div
                          className={`flex items-center gap-1 text-xs text-gray-400 mt-1 ${
                            isStaff ? 'justify-end mr-1' : 'ml-1'
                          }`}
                        >
                          <span>{formatTime(msg.createdAt)}</span>
                          {isStaff && msg.isRead && (
                            <CheckCheck size={14} className="text-blue-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
            {/* Typing indicator - shown below messages */}
            {typingUsers.size > 0 && (
              <div className="flex justify-start">
                <div className="max-w-[70%]">
                  <p className="text-xs text-gray-500 mb-1 ml-1">
                    {Array.from(typingUsers.values()).join(', ')}
                  </p>
                  <div className="px-3 py-2 bg-white border shadow-sm rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span className="text-xs text-gray-500 ml-1">đang nhập...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Floating Scroll Buttons - positioned above input area */}
      {(showScrollToTop || showScrollToBottom) && (
        <div className="flex justify-center gap-2 py-1.5 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
          {showScrollToTop && (
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all"
              title="Cuộn lên đầu"
            >
              <ChevronUp size={12} />
              <span>Lên đầu</span>
            </button>
          )}
          {showScrollToBottom && (
            <button
              onClick={scrollToBottom}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded-full shadow-sm hover:shadow-md transition-all"
              title="Cuộn xuống cuối"
            >
              <ChevronDown size={12} />
              <span>Xuống cuối</span>
            </button>
          )}
        </div>
      )}

      {/* Input */}
      <div className="border-t p-3 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || sending}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full disabled:opacity-50"
            title="Gửi hình ảnh"
          >
            {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Image size={20} />}
          </button>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              sendTypingIndicator(true);
              debouncedStopTyping();
            }}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sending}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
      </div>

      {/* Order Quick View Modal */}
      {orderQuickViewId && (
        <OrderQuickViewModal
          orderId={orderQuickViewId}
          onClose={() => setOrderQuickViewId(null)}
        />
      )}

      {/* Vehicle Assignment Quick View Modal */}
      {vehicleAssignmentQuickViewId && (
        <VehicleAssignmentQuickViewModal
          vehicleAssignmentId={vehicleAssignmentQuickViewId}
          trackingCode={conversation.currentTrackingCode || ''}
          isOpen={!!vehicleAssignmentQuickViewId}
          onClose={() => setVehicleAssignmentQuickViewId(null)}
        />
      )}
    </div>
  );
};

export default StaffChatPanel;
