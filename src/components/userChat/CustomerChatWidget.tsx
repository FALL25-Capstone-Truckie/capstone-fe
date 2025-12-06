import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
  PictureOutlined,
  LoadingOutlined,
  MinusOutlined,
  BorderOutlined,
  UserOutlined,
  CarOutlined,
  TeamOutlined,
  InboxOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Card, Image, Button } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { debounce } from 'lodash';
import userChatService from '@/services/chat/userChatService';
import type {
  ChatConversationResponse,
  ChatUserMessageResponse,
  SendMessageRequest,
} from '@/models/UserChat';
import { ChatParticipantType } from '@/models/UserChat';
import { useUserChat } from '@/hooks/useUserChat';

interface CustomerChatWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  orderId?: string;
}

const CustomerChatWidget: React.FC<CustomerChatWidgetProps> = ({ 
  isOpen: externalIsOpen, 
  onClose: externalOnClose, 
  onOpen: externalOnOpen,
  orderId 
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const handleOpen = () => {
    externalOnOpen?.();
    if (externalOnOpen === undefined) {
      setInternalIsOpen(true);
    }
  };
  
  const handleClose = () => {
    externalOnClose?.();
    if (externalOnClose === undefined) {
      setInternalIsOpen(false);
    }
  };
  const [isMinimized, setIsMinimized] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  const isInputFocusedRef = useRef(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const lastScrollTopRef = useRef(0);
  const manualScrollLockRef = useRef<NodeJS.Timeout | null>(null);

  // Notification sound with Web Audio API fallback
  const playNotificationSound = useCallback(() => {
    // Try to play the audio file first
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Audio file not available, using Web Audio API fallback:', error);
        // Fallback to Web Audio API beep
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 800; // 800Hz beep
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
        } catch (fallbackError) {
          console.log('Web Audio API also failed:', fallbackError);
        }
      });
    }
  }, []);

  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;
  const userType = isAuthenticated ? 'CUSTOMER' : 'GUEST';
  
  // Generate or get guest session ID for guests
  // Clear guest session when user is authenticated to prevent mixing conversations
  const getGuestSessionId = () => {
    if (isAuthenticated) {
      // Clear guest session when logged in to prevent mixing with customer conversation
      localStorage.removeItem('guestSessionId');
      return undefined;
    }
    let sessionId = localStorage.getItem('guestSessionId');
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guestSessionId', sessionId);
    }
    return sessionId;
  };

  const guestSessionId = getGuestSessionId();
  
  const [unreadCount, setUnreadCount] = useState(0);

  const {
    conversation,
    messages,
    loading,
    sending,
    error,
    connected,
    typingUsers,
    initConversation,
    sendMessage,
    sendTypingIndicator,
    uploadImage,
    clearError,
  } = useUserChat({
    userId: userId,
    userType: userType as 'CUSTOMER' | 'GUEST',
    orderId,
    guestSessionId: guestSessionId,
    guestName: undefined, // Let backend generate random guest name
    onNewMessage: (message) => {
      // Debug logging to track message reception
      console.log('CustomerChatWidget onNewMessage called:', {
        messageId: message.id,
        senderType: message.senderType,
        senderName: message.senderName,
        content: message.content?.substring(0, 50),
        isOpen: isOpenRef.current, // Use ref instead of closure value
        currentUnreadCount: unreadCount
      });
      
      // Only increment unread if message is from STAFF (not from current user)
      // Check senderType to be more reliable than senderId comparison
      if (message.senderType === 'STAFF') {
        console.log('Message is from STAFF, checking conditions for badge increment');
        
        // Only increment if widget is closed (use ref to avoid stale closure)
        if (!isOpenRef.current) {
          console.log('Widget is closed, checking for duplicate message');
          
          // Check if this message was already processed using ref
          const wasProcessed = processedMessageIds.current.has(message.id);
          
          if (!wasProcessed) {
            // Mark as processed and increment badge
            processedMessageIds.current.add(message.id);
            setUnreadCount(prev => {
              const newCount = prev + 1;
              console.log('Badge incremented:', { from: prev, to: newCount });
              return newCount;
            });
            // Play notification sound for new messages
            playNotificationSound();
          } else {
            console.log('Message already processed, skipping badge increment');
          }
        } else {
          console.log('Widget is open, not incrementing badge');
          // If input is focused, auto-mark messages as read
          if (isInputFocusedRef.current) {
            // Mark messages as read since user is actively engaged
            markMessagesAsRead();
          }
        }
      } else {
        console.log('Message is not from STAFF, not incrementing badge. senderType:', message.senderType);
      }
    },
  });

  // Update unread count from conversation when it loads
  useEffect(() => {
    if (conversation) {
      setUnreadCount(conversation.unreadCount || 0);
      // Clear processed message IDs when conversation changes
      processedMessageIds.current.clear();
    }
  }, [conversation]);

  // Update isOpen ref whenever isOpen state changes
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Reset unread count when widget opens or input is focused
  const clearBadge = useCallback(() => {
    setUnreadCount(0);
    // Clear processed message IDs when badge is cleared
    processedMessageIds.current.clear();
  }, []);

  // Mark messages as read when user interacts
  const markMessagesAsRead = useCallback(async () => {
    if (conversation) {
      try {
        await userChatService.markAsReadForCustomer(conversation.id);
        console.log('Messages marked as read for conversation:', conversation.id);
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
    }
  }, [conversation]);

  useEffect(() => {
    if (isOpen) {
      clearBadge();
      // Mark messages as read when widget opens
      markMessagesAsRead();
    }
  }, [isOpen, clearBadge, markMessagesAsRead]);

  // Initialize conversation immediately on component mount (not when widget opens)
  // This allows WebSocket to receive messages even when widget is closed
  // Always re-initialize to fetch latest unread count from server
  useEffect(() => {
    // console.log('CustomerChatWidget: Initializing conversation for WebSocket connection');
    initConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount to fetch latest unread count

  // Debug: Log WebSocket connection status changes
  // useEffect(() => {
  //   console.log('CustomerChatWidget: WebSocket connection status changed:', {
  //     connected,
  //     userType,
  //     guestSessionId,
  //     conversationId: conversation?.id
  //   });
  // }, [connected, userType, guestSessionId, conversation?.id]);

  // Polling for unread count only when WebSocket is disconnected
  // This is a fallback mechanism when WebSocket connection is lost
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;
    
    const pollUnreadCount = async () => {
      // Only poll when WebSocket is disconnected and widget is closed
      if (conversation && !isOpen && !connected) {
        try {
          // Get latest conversation data to update unread count
          let updatedConv: ChatConversationResponse;
          
          if (userType === 'GUEST') {
            // For guests, use getOrCreateGuestConversation to get current conversation
            updatedConv = await userChatService.getOrCreateGuestConversation(guestSessionId!);
          } else {
            // For customers, use getConversation
            updatedConv = await userChatService.getConversation(conversation.id);
          }
          
          // Only update if there's a discrepancy
          if (updatedConv.unreadCount !== unreadCount) {
            setUnreadCount(updatedConv.unreadCount || 0);
          }
        } catch (error) {
          console.error('Failed to poll unread count:', error);
        }
      }
    };

    // Start polling every 10 seconds only when WebSocket is disconnected
    if (!connected) {
      pollingInterval = setInterval(pollUnreadCount, 10000);
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [conversation, isOpen, unreadCount, userType, guestSessionId, connected]);

  // Track if this is initial load
  const isInitialLoadRef = useRef(true);
  const lastMessageCountRef2 = useRef(0);
  
  // Reset initial load flag when widget opens
  useEffect(() => {
    if (isOpen) {
      isInitialLoadRef.current = true;
      lastMessageCountRef2.current = 0;
    }
  }, [isOpen]);

  // Scroll to bottom BEFORE paint using useLayoutEffect - prevents flash of top content
  useLayoutEffect(() => {
    if (!messagesContainerRef.current || messages.length === 0 || loading) return;
    
    // Initial load - scroll immediately before browser paints
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      lastMessageCountRef2.current = messages.length;
      setIsUserScrolling(false);
      setShowScrollToBottom(false);
    }
  }, [messages, loading]);

  // Handle widget reopen - scroll to bottom
  useLayoutEffect(() => {
    if (isOpen && messages.length > 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [isOpen]);

  // Auto-scroll when typing indicator appears (focus on typing)
  useEffect(() => {
    if (typingUsers.size > 0 && messagesContainerRef.current && !isUserScrolling) {
      // Smooth scroll to bottom when someone starts typing
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [typingUsers.size, isUserScrolling]);

  // Auto-scroll on new messages (after initial load)
  useEffect(() => {
    if (!messagesContainerRef.current || messages.length === 0 || loading) return;
    
    // New messages arrived after initial load
    if (messages.length > lastMessageCountRef2.current && lastMessageCountRef2.current > 0) {
      if (manualScrollLockRef.current) {
        setShowScrollToBottom(true);
      } else {
        messagesContainerRef.current.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: 'smooth' });
      }
      lastMessageCountRef2.current = messages.length;
    }
  }, [messages, loading]);

  // Debounced typing indicator
  const debouncedStopTyping = useCallback(
    debounce(() => sendTypingIndicator(false), 1000),
    [sendTypingIndicator]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    // Clear badge when user starts typing (indicates they're reading)
    if (unreadCount > 0) {
      clearBadge();
    }
    // Mark messages as read when user focuses on input
    markMessagesAsRead();
    sendTypingIndicator(true);
    debouncedStopTyping();
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || sending) return;

    const content = messageInput.trim();
    setMessageInput('');
    sendTypingIndicator(false);
    // Mark messages as read when sending a reply
    markMessagesAsRead();
    await sendMessage(content);
    
    // Keep focus on input after sending message for continuous chatting
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle scroll events to show/hide scroll buttons and detect user scrolling
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
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

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      setIsUserScrolling(false);
      
      // Clear manual scroll lock when user explicitly scrolls to bottom
      if (manualScrollLockRef.current) {
        clearTimeout(manualScrollLockRef.current);
        manualScrollLockRef.current = null;
      }
      
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShowScrollToBottom(false);
    }
  }, []);

  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      await sendMessage('', imageUrl);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const getMessageSenderColor = (senderType: string) => {
    switch (senderType) {
      case ChatParticipantType.STAFF:
        return 'bg-blue-600 text-white';
      case ChatParticipantType.SYSTEM:
        return 'bg-gray-200 text-gray-600 italic';
      default:
        return 'bg-green-600 text-white';
    }
  };

  const isOwnMessage = (senderType: string, senderId?: string) => {
    if (userType === 'GUEST') {
      return senderType === ChatParticipantType.GUEST;
    }
    return senderId === userId;
  };

  // Helper function to check if this is the last read message from current user
  const isLastReadOwnMessage = (msg: ChatUserMessageResponse, index: number) => {
    if (!msg.isRead) return false;
    
    const isOwn = isOwnMessage(msg.senderType, msg.senderId || undefined);
    if (!isOwn) return false;
    
    // Check if there are any more own messages after this one that are also read
    for (let i = index + 1; i < messages.length; i++) {
      const nextMsg = messages[i];
      const nextIsOwn = isOwnMessage(nextMsg.senderType, nextMsg.senderId || undefined);
      if (nextIsOwn && nextMsg.isRead) {
        return false; // There's a later read message from the same sender
      }
    }
    
    return true; // This is the last read message from this sender
  };

  // Always render the button, modal visibility controlled by isOpen state
  return (
    <>
      <Button
        type="primary"
        shape="circle"
        onClick={handleOpen}
        className="fixed shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110"
        style={{
          width: '64px',
          height: '64px',
          fontSize: '28px',
          zIndex: 998,
          background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
          bottom: '1rem',
          right: '1rem',
          border: 'none'
        }}
        title="Chat với nhân viên hỗ trợ"
        icon={<MessageOutlined style={{ fontSize: '24px', color: 'white' }} />}
      >
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Modal - only render when isOpen is true */}
      {isOpen && (
        <Card
          className={`fixed shadow-2xl transition-all duration-300 ${
            isMinimized ? 'w-80 h-14' : 'w-[480px] h-[650px] max-h-[80vh]'
          }`}
          style={{
            zIndex: 999,
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bottom: '1rem',
            right: 'calc(1rem + 80px)', // Open to the left of buttons
          }}
          styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
        >
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageOutlined style={{ fontSize: '20px', color: 'white' }} />
          <div>
            <h3 className="font-semibold text-sm">Hỗ trợ khách hàng</h3>
            {!isMinimized && (
              <p className="text-xs opacity-80">
                {connected ? 'Đang kết nối' : 'Đang kết nối...'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="text"
            icon={isMinimized ? <BorderOutlined style={{ fontSize: '16px' }} /> : <MinusOutlined style={{ fontSize: '16px' }} />}
            className="text-white hover:bg-white/20"
            size="middle"
            onClick={() => setIsMinimized(!isMinimized)}
          />
          <Button
            type="text"
            icon={<CloseOutlined style={{ fontSize: '16px' }} />}
            className="text-white hover:bg-white/20"
            size="middle"
            onClick={handleClose}
          />
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div 
            ref={messagesContainerRef} 
            className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 relative" 
            style={{ minHeight: 0 }} 
            onScroll={handleScroll}
          >
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <LoadingOutlined style={{ fontSize: '28px', color: '#1890ff' }} spin />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageOutlined style={{ fontSize: '36px', color: '#1890ff' }} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Xin chào! Chúng tôi có thể giúp gì cho bạn?</p>
              </div>
            ) : (
              <>
                {messages.map((msg: ChatUserMessageResponse, index: number) => {
                  const isOwn = isOwnMessage(msg.senderType, msg.senderId || undefined);
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
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%]`}>
                          {!isOwn && msg.senderType !== ChatParticipantType.SYSTEM && (
                            <p className="text-xs text-gray-500 mb-0.5 ml-1">
                              {msg.senderName || 'Nhân viên hỗ trợ'}
                            </p>
                          )}
                          <div
                            className={`px-3 py-2 rounded-xl text-sm ${
                              isOwn
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : msg.senderType === ChatParticipantType.SYSTEM
                                ? 'bg-gray-200 text-gray-600 italic text-center'
                                : 'bg-white text-gray-900 border rounded-bl-sm shadow-sm'
                            }`}
                          >
                            {msg.imageUrl && !msg.content ? (
                              <div className="message-image-only">
                                <Image
                                  src={msg.imageUrl}
                                  alt="Chat image"
                                  className="max-w-[200px] max-h-[200px] rounded cursor-pointer"
                                  preview={{
                                    mask: 'Xem ảnh lớn',
                                    maskClosable: true,
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            ) : (
                              <>
                                {msg.imageUrl && (
                                  <div className="message-image-container mb-1">
                                    <Image
                                      src={msg.imageUrl}
                                      alt="Chat image"
                                      className="max-w-[200px] max-h-[200px] rounded cursor-pointer"
                                      preview={{
                                        mask: 'Xem ảnh lớn',
                                        maskClosable: true,
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                )}
                                {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                              </>
                            )}
                          </div>
                          <p className={`text-xs text-gray-400 mt-0.5 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                            {formatTime(msg.createdAt)}
                            {isLastReadOwnMessage(msg, index) && ' · Đã xem'}
                          </p>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                {typingUsers.size > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 px-3 py-2 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Đang nhập...
                      </p>
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
                <Button
                  type="default"
                  size="small"
                  onClick={scrollToTop}
                  className="shadow-sm hover:shadow-md transition-all flex items-center gap-1"
                  style={{
                    borderRadius: '16px',
                    fontSize: '12px',
                    height: '28px',
                    padding: '0 12px',
                  }}
                  title="Cuộn lên đầu"
                >
                  <UpOutlined style={{ fontSize: '10px' }} />
                  <span>Lên đầu</span>
                </Button>
              )}
              {showScrollToBottom && (
                <Button
                  type="primary"
                  size="small"
                  onClick={scrollToBottom}
                  className="shadow-sm hover:shadow-md transition-all flex items-center gap-1"
                  style={{
                    borderRadius: '16px',
                    fontSize: '12px',
                    height: '28px',
                    padding: '0 12px',
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    border: 'none'
                  }}
                  title="Cuộn xuống cuối"
                >
                  <DownOutlined style={{ fontSize: '10px' }} />
                  <span>Xuống cuối</span>
                </Button>
              )}
            </div>
          )}

          {/* Error Message */}
          {/* {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100">
              <p className="text-sm text-red-600">{error}</p>
              <Button type="link" size="small" onClick={clearError} className="text-red-500 p-0">
                Đóng
              </Button>
            </div>
          )} */}

          {/* Input Area */}
          <div className="border-t p-3 bg-white rounded-b-lg">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <Button
                type="text"
                icon={isUploading ? <LoadingOutlined spin style={{ fontSize: '18px' }} /> : <PictureOutlined style={{ fontSize: '18px' }} />}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || sending}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                size="large"
                title="Gửi hình ảnh"
              />
              <input
                ref={inputRef}
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onFocus={() => {
                  isInputFocusedRef.current = true;
                  clearBadge();
                  markMessagesAsRead();
                }}
                onBlur={() => {
                  isInputFocusedRef.current = false;
                }}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-2.5 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={sending}
              />
              <Button
                type="primary"
                icon={sending ? <LoadingOutlined spin style={{ fontSize: '18px' }} /> : <SendOutlined style={{ fontSize: '18px' }} />}
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sending}
                className="bg-blue-600 hover:bg-blue-700 border-blue-600"
                size="large"
              />
            </div>
          </div>
        </>
      )}
        </Card>
      )}
    </>
  );
};

export default CustomerChatWidget;
