import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import { Client } from "@stomp/stompjs";
import type { IMessage } from "@stomp/stompjs";

import type { ChatMessageDTO, MessageRequest } from "@/models/Chat";
import { RoomType, type CreateRoomResponse } from "@/models/Room";
import {
  mapChatMessageDTOArrayToUI,
  mapChatMessageDTOToUI,
  type ChatMessage,
} from "@/utils/chatMapper";
import roomService from "@/services/room/roomService";
import chatService from "@/services/chat/chatService";
import { useAuth } from "@/context/AuthContext";

export interface ChatConversation {
  id: string;
  roomId: string;
  participants: CreateRoomResponse["participants"];
  status: string;
  type?: string;
  messages: ChatMessageDTO[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface SupportRoom {
  roomId: string;
  orderId: string | null;
  participants: Array<{
    userId: string;
    roleName: string;
  }>;
  status: string;
  type: RoomType;
  customerName?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  createAt?: {
    seconds: number;
    nanos: number;
  };
}

export interface GetRoomRequest {
  orderId: string;
  roomType: RoomType;
}

interface ChatContextType {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  unreadCount: number;
  isOpen: boolean;
  isMinimized: boolean;
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
  uiMessages: ChatMessage[];
  setActiveConversation: (conversation: ChatConversation | null) => void;
  setChatMessages: (messages: ChatMessageDTO[]) => void;
  setUIChatMessages: (messages: ChatMessage[]) => void;
  addUIChatMessage: (message: ChatMessage) => void;
  sendMessage: (request: MessageRequest) => void;
  markAsRead: (conversationId: string) => void;
  toggleChat: () => void;
  minimizeChat: () => void;
  maximizeChat: () => void;
  connectWebSocket: (userId: string, roomId: string) => void;
  disconnectWebSocket: () => void;
  initChat: (userId: string) => Promise<void>;
  openChat: (userId: string, roomId: string) => Promise<void>;
  loadMoreMessages: (roomId: string) => Promise<void>;
  supportRooms: SupportRoom[];
  loadingRooms: boolean;
  fetchSupportRooms: () => Promise<void>;
  fetchOrderTypeRooms: () => Promise<void>;
  fetchDriverTypeRooms: () => Promise<void>;
  fetchOrderTypeRoomsForAdmin: () => Promise<void>;
  fetchDriverTypeRoomsForAdmin: () => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  setActiveRoom: (room: SupportRoom | null) => void;
  activeRoom: SupportRoom | null;
  loadMessagesForRoom: (roomId: string) => Promise<void>;
  getRoomForOrder: (
    roomData: GetRoomRequest
  ) => Promise<CreateRoomResponse | null>;
  initChatForOrderType: (room: CreateRoomResponse) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context)
    throw new Error("useChatContext must be used within a ChatProvider");
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
  isStaff?: boolean;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<ChatConversation | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [uiMessages, setUiMessages] = useState<ChatMessage[]>([]);
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<any>(null);
  const currentRoomIdRef = useRef<string | null>(null);
  const [supportRooms, setSupportRooms] = useState<SupportRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [activeRoom, setActiveRoom] = useState<SupportRoom | null>(null);
  const { user } = useAuth();

  // ✅ Helper: Sort rooms by createAt (newest first)
  const sortRoomsByCreateAt = useCallback((rooms: SupportRoom[]) => {
    return rooms.sort((a, b) => {
      const aTime = a.createAt?.seconds || 0;
      const bTime = b.createAt?.seconds || 0;
      return bTime - aTime; // Descending (newest first)
    });
  }, []);

  const timestampToMillis = useCallback((timestamp: any): number => {
    if (!timestamp) return 0;
    if (typeof timestamp === "number") return timestamp;
    if (typeof timestamp === "string") return Number(timestamp) || 0;
    if (
      typeof timestamp === "object" &&
      typeof timestamp.seconds === "number"
    ) {
      return (
        timestamp.seconds * 1000 + Math.floor((timestamp.nanos || 0) / 1000000)
      );
    }
    return 0;
  }, []);

  const setUIChatMessages = useCallback((messages: ChatMessage[]) => {
    setUiMessages(messages.sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp)));
  }, []);

  const buildConversation = useCallback(
    (
      room: CreateRoomResponse,
      messages: ChatMessageDTO[]
    ): ChatConversation => {
      const sortedMessages = messages.sort((a, b) => {
        const aTime = timestampToMillis(a.createAt);
        const bTime = timestampToMillis(b.createAt);
        return aTime - bTime;
      });

      const lastMessage =
        sortedMessages.length > 0
          ? sortedMessages[sortedMessages.length - 1]
          : null;

      return {
        id: room.roomId,
        roomId: room.roomId,
        participants: room.participants,
        status: room.status,
        type: room.type,
        messages: sortedMessages,
        lastMessage: lastMessage?.content || "",
        lastMessageTime: lastMessage
          ? timestampToMillis(lastMessage.createAt).toString()
          : "",
        unreadCount: 0,
      };
    },
    [timestampToMillis]
  );

  const addUIChatMessage = useCallback((message: ChatMessage) => {
    setUiMessages((prev) => {
      if (prev.some((msg) => msg.id === message.id)) {
        return prev;
      }

      if (!message.id.startsWith("temp-")) {
        const tempIndex = prev.findIndex(
          (msg) =>
            msg.id.startsWith("temp-") &&
            msg.content === message.content &&
            Math.abs(parseInt(msg.timestamp) - parseInt(message.timestamp)) < 5000
        );

        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = message;
          return updated;
        }
      }

      const updated = [...prev, message];
      return updated.sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));
    });
  }, []);

  const handleNewMessage = useCallback(
    (msg: ChatMessageDTO, roomId: string) => {
      console.log("💬 New message:", msg.id, "in room:", roomId);

      const msgTime = timestampToMillis(msg.createAt);
      const msgTimeStr = msgTime.toString();

      setConversations((prev) => {
        const conv = prev.find(c => c.roomId === roomId);
        if (!conv) return prev;

        if (conv.messages.some(m => m.id === msg.id)) {
          return prev;
        }

        return prev.map((c) =>
          c.roomId === roomId
            ? {
                ...c,
                messages: [...c.messages, msg],
                lastMessage: msg.content,
                lastMessageTime: msgTimeStr,
                unreadCount:
                  activeConversation?.roomId === roomId && isOpen
                    ? c.unreadCount
                    : c.unreadCount + 1,
              }
            : c
        );
      });

      if (activeConversation?.roomId === roomId) {
        setActiveConversation((prev) => {
          if (!prev || prev.messages.some(m => m.id === msg.id)) {
            return prev;
          }

          return {
            ...prev,
            messages: [...prev.messages, msg],
            lastMessage: msg.content,
            lastMessageTime: msgTimeStr,
          };
        });
      }

      const currentUserId = user?.id || sessionStorage.getItem("userId") || "";
      const uiMessage = mapChatMessageDTOToUI(msg, currentUserId);
      addUIChatMessage(uiMessage);
    },
    [
      activeConversation?.roomId,
      isOpen,
      timestampToMillis,
      addUIChatMessage,
      user?.id,
    ]
  );

  const getRoomForOrder = useCallback(
    async (roomData: GetRoomRequest): Promise<CreateRoomResponse | null> => {
      try {
        console.log("🔍 Getting room for order:", roomData);
        const room = await roomService.getRoomForOrder(roomData);
        console.log("✅ Room found:", room);
        return room;
      } catch (error) {
        console.error("❌ Error getting room for order:", error);
        return null;
      }
    },
    []
  );

  const loadMessagesForRoom = useCallback(
    async (roomId: string) => {
      if (!user) return;

      try {
        connectWebSocket(user.id, roomId);
        const chatPage = await chatService.getMessages(roomId, 20);
        const uiMessages = mapChatMessageDTOArrayToUI(
          chatPage.messages,
          user.id
        );
        setUIChatMessages(uiMessages);

        const room = supportRooms.find((r) => r.roomId === roomId);
        if (room) {
          const roomInfo = {
            id: room.roomId,
            roomId: room.roomId,
            participants: room.participants,
            status: room.status.toLowerCase(),
            messages: chatPage.messages,
            lastMessage: chatPage.messages.at(-1)?.content || "",
            lastMessageTime:
              chatPage.messages.at(-1)?.createAt?.seconds?.toString() || "",
            unreadCount: room.unreadCount || 0,
          };

          setActiveConversation(roomInfo);
        }
      } catch (error) {
        console.error("❌ loadMessagesForRoom() error:", error);
      }
    },
    [user, supportRooms, setUIChatMessages]
  );

  // ✅ Fetch SUPPORT rooms
  const fetchSupportRooms = useCallback(async () => {
    if (!user) return;

    setLoadingRooms(true);
    try {
      const rooms = await roomService.getListSupportRoomsForStaff();

      const supportRoomsData: SupportRoom[] = rooms.map((room) => ({
        ...room,
        type:
          room.type === RoomType.SUPPORT || room.type === RoomType.SUPPORTED
            ? (room.type as RoomType.SUPPORT | RoomType.SUPPORTED)
            : RoomType.SUPPORT,
      }));

      const sortedRooms = sortRoomsByCreateAt(supportRoomsData);
      setSupportRooms(sortedRooms);
    } catch (error) {
      console.error("Failed to fetch support rooms:", error);
    } finally {
      setLoadingRooms(false);
    }
  }, [user, sortRoomsByCreateAt]);

  // ✅ NEW: Fetch ORDER_TYPE rooms
  const fetchOrderTypeRooms = useCallback(async () => {
    if (!user) return;

    setLoadingRooms(true);
    try {
      const rooms = await roomService.getRoomForUserAndType(
        user.id,
        RoomType.ORDER_TYPE
      );

      const orderRoomsData: SupportRoom[] = rooms.map((room) => ({
        ...room,
        type:
          room.type === RoomType.ORDER_TYPE
            ? (room.type as RoomType.ORDER_TYPE)
            : RoomType.ORDER_TYPE,
      }));

      const sortedRooms = sortRoomsByCreateAt(orderRoomsData);

      setSupportRooms(sortedRooms);
    } catch (error) {
      console.error("Failed to fetch ORDER_TYPE rooms:", error);
    } finally {
      setLoadingRooms(false);
    }
  }, [user, sortRoomsByCreateAt]);

  // ✅ NEW: Fetch DRIVER_TYPE rooms
  const fetchDriverTypeRooms = useCallback(async () => {
    if (!user) return;

    setLoadingRooms(true);
    try {
      const rooms = await roomService.getRoomForUserAndType(
        user.id,
        RoomType.DRIVER_STAFF_ORDER
      );

      const driverRoomsData: SupportRoom[] = rooms.map((room) => ({
        ...room,
        type:
          room.type === RoomType.DRIVER_STAFF_ORDER
            ? (room.type as RoomType.DRIVER_STAFF_ORDER)
            : RoomType.DRIVER_STAFF_ORDER,
      }));

      const sortedRooms = sortRoomsByCreateAt(driverRoomsData);
      setSupportRooms(sortedRooms);
    } catch (error) {
      console.error("Failed to fetch DRIVER_TYPE rooms:", error);
    } finally {
      setLoadingRooms(false);
    }
  }, [user, sortRoomsByCreateAt]);

  const fetchOrderTypeRoomsForAdmin = useCallback(async () => {
    if (!user) return;

    setLoadingRooms(true);
    try {
      const rooms = await roomService.getFullActiveRoomByTypeForAdmin(
        RoomType.ORDER_TYPE
      );

      const orderRoomsData: SupportRoom[] = rooms.map((room) => ({
        ...room,
        type:
          room.type === RoomType.ORDER_TYPE
            ? (room.type as RoomType.ORDER_TYPE)
            : RoomType.ORDER_TYPE,
      }));

      const sortedRooms = sortRoomsByCreateAt(orderRoomsData);

      setSupportRooms(sortedRooms);
    } catch (error) {
      console.error("Failed to fetch ORDER_TYPE rooms for admin:", error);
    } finally {
      setLoadingRooms(false);
    }
  }, [user, sortRoomsByCreateAt]);

  const fetchDriverTypeRoomsForAdmin = useCallback(async () => {
    if (!user) return;

    setLoadingRooms(true);
    try {
      const rooms = await roomService.getFullActiveRoomByTypeForAdmin(
        RoomType.DRIVER_STAFF_ORDER
      );

      const driverRoomsData: SupportRoom[] = rooms.map((room) => ({
        ...room,
        type:
          room.type === RoomType.DRIVER_STAFF_ORDER
            ? (room.type as RoomType.DRIVER_STAFF_ORDER)
            : RoomType.DRIVER_STAFF_ORDER,
      }));

      const sortedRooms = sortRoomsByCreateAt(driverRoomsData);
      setSupportRooms(sortedRooms);
    } catch (error) {
      console.error("Failed to fetch DRIVER_TYPE rooms for admin:", error);
    } finally {
      setLoadingRooms(false);
    }
  }, [user, sortRoomsByCreateAt]);

  const joinRoom = useCallback(
    async (roomId: string) => {
      if (!user) return;

      try {
        const success = await roomService.joinRoom(roomId, user.id);

        if (success) {
          setSupportRooms((prev) =>
            prev.map((room) =>
              room.roomId === roomId
                ? { ...room, type: RoomType.SUPPORTED }
                : room
            )
          );

          connectWebSocket(user.id, roomId);

          setIsOpen(true);
          setIsMinimized(false);

          const chatPage = await chatService.getMessages(roomId, 20);
          const uiMessages = mapChatMessageDTOArrayToUI(
            chatPage.messages,
            user.id
          );
          setUIChatMessages(uiMessages);

          const roomInfo = {
            id: roomId,
            roomId: roomId,
            participants: [{ userId: user.id, roleName: user.role }],
            status: "active",
            messages: chatPage.messages,
            lastMessage: chatPage.messages[chatPage.messages.length - 1]?.content || "",
            lastMessageTime:
              chatPage.messages[chatPage.messages.length - 1]?.createAt?.seconds?.toString() || "",
            unreadCount: 0,
          };
          setActiveConversation(roomInfo);
        }
      } catch (error) {
        console.error("❌ joinRoom() error:", error);
      }
    },
    [user, setUIChatMessages]
  );

  const initChat = useCallback(
    async (userId: string) => {
      try {
        const room = await roomService.getCustomerHasRoomSupported(userId);

        if (!room) {
          setConversations([]);
          setActiveConversation(null);
          setUiMessages([]);
          return;
        }

        const chatPage = await chatService.getMessages(room.roomId, 20);
        const conversation = buildConversation(room, chatPage.messages);

        setConversations([conversation]);
        setActiveConversation(conversation);

        const uiMessages = mapChatMessageDTOArrayToUI(chatPage.messages, userId);
        setUIChatMessages(uiMessages);

        connectWebSocket(userId, room.roomId);
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setConversations([]);
        setActiveConversation(null);
        setUiMessages([]);
      }
    },
    [buildConversation, setUIChatMessages]
  );

  const initChatForOrderType = useCallback(
    async (room: CreateRoomResponse) => {
      try {
        if (!user) return;

        if (!room) {
          setConversations([]);
          setActiveConversation(null);
          setUiMessages([]);
          return;
        }

        const chatPage = await chatService.getMessages(room.roomId, 20);
        const conversation = buildConversation(room, chatPage.messages);

        setConversations([conversation]);
        setActiveConversation(conversation);

        const uiMessages = mapChatMessageDTOArrayToUI(chatPage.messages, user.id);
        setUIChatMessages(uiMessages);

        connectWebSocket(user.id, room.roomId);

        setIsOpen(true);
        setIsMinimized(false);
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setConversations([]);
        setActiveConversation(null);
        setUiMessages([]);
      }
    },
    [buildConversation, setUIChatMessages, user]
  );

  const openChat = useCallback(
    async (userId: string, roomId: string) => {
      try {
        const rooms = await roomService.getAllRoomsByUserId(userId);
        const room = rooms.find((r) => r.roomId === roomId);

        if (!room) {
          console.warn(`Room ${roomId} not found for user ${userId}`);
          setActiveConversation(null);
          setUiMessages([]);
          return;
        }

        const chatPage = await chatService.getMessages(room.roomId, 20);
        const conversation = buildConversation(room, chatPage.messages);

        setConversations([conversation]);
        setActiveConversation(conversation);

        const uiMessages = mapChatMessageDTOArrayToUI(chatPage.messages, userId);
        setUIChatMessages(uiMessages);

        connectWebSocket(userId, roomId);
      } catch (error) {
        console.error("Failed to open chat:", error);
        setActiveConversation(null);
        setUiMessages([]);
      }
    },
    [buildConversation, setUIChatMessages]
  );

  const loadMoreMessages = useCallback(
    async (roomId: string) => {
      if (!activeConversation || activeConversation.roomId !== roomId) return;

      try {
        const lastMessageId =
          activeConversation.messages.length > 0
            ? activeConversation.messages[0].id
            : undefined;

        const chatPage = await chatService.getMessages(
          roomId,
          20,
          lastMessageId
        );

        if (chatPage.messages.length > 0) {
          const sortedNewMessages = chatPage.messages.sort((a, b) => {
            const aTime = timestampToMillis(a.createAt);
            const bTime = timestampToMillis(b.createAt);
            return aTime - bTime;
          });

          const updatedMessages = [...sortedNewMessages, ...activeConversation.messages];
          setChatMessages(updatedMessages);

          const currentUserId = user?.id || sessionStorage.getItem("userId") || "";
          const newUIMessages = mapChatMessageDTOArrayToUI(sortedNewMessages, currentUserId);

          setUiMessages((prev) => {
            const combined = [...newUIMessages, ...prev];
            const uniqueMap = new Map(combined.map(msg => [msg.id, msg]));
            return Array.from(uniqueMap.values()).sort(
              (a, b) => parseInt(a.timestamp) - parseInt(b.timestamp)
            );
          });
        }
      } catch (error) {
        console.error("Failed to load more messages:", error);
      }
    },
    [activeConversation, timestampToMillis, user?.id]
  );

  const connectWebSocket = useCallback(
    (userId: string, roomId: string) => {
      console.log("🔌 connectWebSocket:", { userId, roomId });

      if (currentRoomIdRef.current && currentRoomIdRef.current !== roomId) {
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }
      }

      if (
        stompClientRef.current?.connected &&
        currentRoomIdRef.current === roomId &&
        subscriptionRef.current
      ) {
        console.log("✅ Already connected");
        return;
      }

      if (stompClientRef.current?.connected) {
        subscriptionRef.current = stompClientRef.current.subscribe(
          `/topic/room/${roomId}`,
          (message: IMessage) => {
            try {
              const msg: ChatMessageDTO = JSON.parse(message.body);

              if (!msg.id) {
                msg.id = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              }

              if (!msg.createAt) {
                msg.createAt = {
                  seconds: Math.floor(Date.now() / 1000),
                  nanos: (Date.now() % 1000) * 1000000,
                };
              }

              handleNewMessage(msg, roomId);
            } catch (error) {
              console.error("Error parsing WebSocket message:", error);
            }
          }
        );

        currentRoomIdRef.current = roomId;
        setConnectionStatus("connected");
        return;
      }

      setConnectionStatus("connecting");

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = "localhost:8080";
      const wsUrl = `${protocol}//${host}/chat`;

      const stompClient = new Client({
        brokerURL: wsUrl,
        reconnectDelay: 5000,
        debug: (str) => console.log("STOMP:", str),
      });

      stompClient.onConnect = () => {
        console.log(`✅ WebSocket connected to room: ${roomId}`);
        setConnectionStatus("connected");

        subscriptionRef.current = stompClient.subscribe(
          `/topic/room/${roomId}`,
          (message: IMessage) => {
            try {
              const msg: ChatMessageDTO = JSON.parse(message.body);

              if (!msg.id) {
                msg.id = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              }

              if (!msg.createAt) {
                msg.createAt = {
                  seconds: Math.floor(Date.now() / 1000),
                  nanos: (Date.now() % 1000) * 1000000,
                };
              }

              handleNewMessage(msg, roomId);
            } catch (error) {
              console.error("Error parsing WebSocket message:", error);
            }
          }
        );

        currentRoomIdRef.current = roomId;
      };

      stompClient.onWebSocketError = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
      };

      stompClient.onStompError = (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
        setConnectionStatus("error");
      };

      stompClient.activate();
      stompClientRef.current = stompClient;
    },
    [handleNewMessage]
  );

  const disconnectWebSocket = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (stompClientRef.current) {
      try {
        stompClientRef.current.deactivate();
      } catch (error) {
        console.error("Error disconnecting:", error);
      } finally {
        stompClientRef.current = null;
        currentRoomIdRef.current = null;
        setConnectionStatus("disconnected");
      }
    }
  }, []);

  const setChatMessages = useCallback(
    (messages: ChatMessageDTO[]) => {
      if (!activeConversation) return;

      const sortedMessages = messages.sort((a, b) => {
        const aTime = timestampToMillis(a.createAt);
        const bTime = timestampToMillis(b.createAt);
        return aTime - bTime;
      });

      const lastMessage = sortedMessages[sortedMessages.length - 1] || null;

      const updatedConversation = {
        ...activeConversation,
        messages: sortedMessages,
        lastMessage: lastMessage?.content || "",
        lastMessageTime: lastMessage
          ? timestampToMillis(lastMessage.createAt).toString()
          : "",
      };

      setActiveConversation(updatedConversation);

      setConversations((prev) =>
        prev.map((conv) =>
          conv.roomId === activeConversation.roomId ? updatedConversation : conv
        )
      );
    },
    [activeConversation, timestampToMillis]
  );

  const sendMessage = useCallback(
    (request: MessageRequest) => {
      const roomId = request.roomId;

      if (stompClientRef.current?.connected) {
        try {
          stompClientRef.current.publish({
            destination: `/app/chat.sendMessage/${roomId}`,
            body: JSON.stringify(request),
          });
        } catch (error) {
          console.error("Failed to send message:", error);
        }
      } else {
        console.warn("WebSocket not connected");
        return;
      }

      const now = Date.now();
      const newMsg: ChatMessageDTO = {
        id: `temp-${now}`,
        senderId: request.senderId,
        content: request.message,
        createAt: {
          seconds: Math.floor(now / 1000),
          nanos: (now % 1000) * 1000000,
        },
        type: request.type || "TEXT",
      };

      handleNewMessage(newMsg, roomId);
    },
    [handleNewMessage]
  );

  const markAsRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.roomId === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  }, []);

  const toggleChat = useCallback(() => setIsOpen((v) => !v), []);
  const minimizeChat = useCallback(() => setIsMinimized(true), []);
  const maximizeChat = useCallback(() => setIsMinimized(false), []);

  const unreadCount = useMemo(
    () => conversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
    [conversations]
  );

  React.useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  const value: ChatContextType = useMemo(
    () => ({
      conversations,
      activeConversation,
      unreadCount,
      isOpen,
      isMinimized,
      connectionStatus,
      uiMessages,
      setActiveConversation,
      setChatMessages,
      setUIChatMessages,
      addUIChatMessage,
      sendMessage,
      markAsRead,
      toggleChat,
      minimizeChat,
      maximizeChat,
      connectWebSocket,
      disconnectWebSocket,
      initChat,
      openChat,
      loadMoreMessages,
      supportRooms,
      loadingRooms,
      fetchSupportRooms,
      fetchOrderTypeRooms,
      fetchDriverTypeRooms,
      fetchOrderTypeRoomsForAdmin,
      fetchDriverTypeRoomsForAdmin,
      joinRoom,
      setActiveRoom,
      activeRoom,
      loadMessagesForRoom,
      getRoomForOrder,
      initChatForOrderType,
    }),
    [
      conversations,
      activeConversation,
      unreadCount,
      isOpen,
      isMinimized,
      connectionStatus,
      uiMessages,
      sendMessage,
      markAsRead,
      toggleChat,
      minimizeChat,
      maximizeChat,
      connectWebSocket,
      disconnectWebSocket,
      initChat,
      openChat,
      loadMoreMessages,
      supportRooms,
      loadingRooms,
      fetchSupportRooms,
      fetchOrderTypeRooms,
      fetchDriverTypeRooms,
      fetchOrderTypeRoomsForAdmin,
      fetchDriverTypeRoomsForAdmin,
      joinRoom,
      activeRoom,
      loadMessagesForRoom,
      getRoomForOrder,
      initChatForOrderType,
      setChatMessages,
      setUIChatMessages,
      addUIChatMessage,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;
