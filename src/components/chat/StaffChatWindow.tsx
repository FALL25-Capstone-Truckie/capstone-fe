import React, { useRef, useEffect } from "react";
import { Button, Empty, Spin, Badge } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useChatContext } from "@/context/ChatContext";
import StaffChatMessage from "./StaffChatMessage";
import StaffChatConversationItem from "./StaffChatConversationItem";
import StaffChatSidebar from "./StaffChatSidebar";
import { useAuth } from "@/context/AuthContext";
import MessageInput from "./MessageInput";
import type { SupportRoom } from "@/context/ChatContext";
import { RoomType } from "@/models/Room";

type RoomTypeTab =
  | RoomType.SUPPORT
  | RoomType.ORDER_TYPE
  | RoomType.DRIVER_STAFF_ORDER;

const StaffChatWindow: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<RoomTypeTab>(
    RoomType.SUPPORT
  );

  const {
    activeConversation,
    isMinimized,
    toggleChat,
    supportRooms,
    loadingRooms,
    fetchSupportRooms,
    fetchOrderTypeRooms,
    fetchDriverTypeRooms,
    fetchDriverTypeRoomsForAdmin,
    fetchOrderTypeRoomsForAdmin,
    joinRoom,
    uiMessages,
    loadMessagesForRoom,
  } = useChatContext();

  // Fetch rooms based on active tab
  useEffect(() => {
    switch (activeTab) {
      case "SUPPORT":
        fetchSupportRooms();
        break;

      case "ORDER_TYPE":
        if (user?.role === "admin") {
          fetchDriverTypeRoomsForAdmin();
        } else {
          fetchOrderTypeRooms();
        }
        break;

      case "DRIVER_STAFF_ORDER":
        if (user?.role === "admin") {
          fetchOrderTypeRoomsForAdmin();
        } else {
          fetchDriverTypeRooms();
        }
        break;

      default:
        break;
    }
  }, [
    activeTab,
    user?.role,
    fetchSupportRooms,
    fetchOrderTypeRooms,
    fetchDriverTypeRooms,
    fetchDriverTypeRoomsForAdmin,
    fetchOrderTypeRoomsForAdmin,
  ]);

  // Load messages when activeConversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessagesForRoom(activeConversation.roomId);
    }
  }, [activeConversation?.roomId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!messagesEndRef.current || !messagesContainerRef.current || isMinimized)
      return;

    const container = messagesContainerRef.current;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    if (uiMessages.length > prevMessagesLengthRef.current && isNearBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    prevMessagesLengthRef.current = uiMessages.length;
  }, [uiMessages, isMinimized]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isMinimized && activeConversation && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 100);
    }
  }, [isMinimized, activeConversation?.roomId]);

  const mapRoomToConversation = (room: SupportRoom) => ({
    id: room.roomId,
    customerName: room.customerName || `Khách hàng #${room.roomId.slice(0, 5)}`,
    lastMessage: room.lastMessage || "Yêu cầu hỗ trợ mới",
    lastMessageTime: room.lastMessageTime || "",
    unreadCount: room.unreadCount || 0,
    status: room.status.toLowerCase() as "active" | "pending" | "closed",
    type: room.type,
  });

  const handleRoomClick = (room: SupportRoom) => {
    if (activeConversation?.roomId === room.roomId) {
      console.log("⚠️ Already viewing this room");
      return;
    }

    // Only SUPPORT type needs joinRoom
    if (room.type === "SUPPORT") {
      joinRoom(room.roomId);
    } else {
      // ORDER_TYPE and DRIVER_TYPE just load messages
      loadMessagesForRoom(room.roomId);
    }
  };

  const handleTabChange = (tab: RoomTypeTab) => {
    setActiveTab(tab);
  };

  const getTabLabel = (tab: RoomTypeTab) => {
    switch (tab) {
      case "SUPPORT":
        return "Hỗ trợ";
      case "ORDER_TYPE":
        return "Đơn hàng";
      case "DRIVER_STAFF_ORDER":
        return "Tài xế";
    }
  };

  const getEmptyDescription = () => {
    switch (activeTab) {
      case "SUPPORT":
        return "Không có yêu cầu hỗ trợ nào";
      case "ORDER_TYPE":
        return "Không có cuộc hội thoại đơn hàng nào";
      case "DRIVER_STAFF_ORDER":
        return "Không có cuộc hội thoại tài xế nào";
    }
  };

  if (isMinimized) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 w-[800px] h-[600px] bg-white shadow-lg rounded-lg flex flex-col border border-gray-200">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg flex-shrink-0">
        <h3 className="font-medium text-lg">Hỗ trợ trực tuyến</h3>
        <Button
          type="text"
          icon={<CloseOutlined />}
          size="small"
          className="text-white hover:text-gray-200"
          onClick={toggleChat}
        />
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Use StaffChatSidebar component */}
        <StaffChatSidebar activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Middle: Conversation List */}
        <div className="w-80 h-full border-r flex flex-col overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex-shrink-0">
            <h4 className="text-lg font-medium text-gray-700">
              {getTabLabel(activeTab)}
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingRooms ? (
              <div className="flex h-full items-center justify-center">
                <Spin />
              </div>
            ) : supportRooms.length > 0 ? (
              supportRooms.map((room) => (
                <StaffChatConversationItem
                  key={room.roomId}
                  conversation={mapRoomToConversation(room)}
                  isActive={activeConversation?.roomId === room.roomId}
                  onClick={() => handleRoomClick(room)}
                />
              ))
            ) : (
              <div className="flex h-full items-center justify-center">
                <Empty description={getEmptyDescription()} />
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat Content */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-gray-50 border-b flex items-center flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium mr-3">
                  {activeConversation.participants[0]?.userId
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-700">
                    {`Khách hàng #${activeConversation.roomId.slice(0, 5)}`}
                  </h4>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span>
                      {activeConversation.status === "active"
                        ? "Đang hoạt động"
                        : "Đã đóng"}
                    </span>
                    {activeConversation.type && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        {activeConversation.type}
                      </span>
                    )}
                  </div>
                </div>
                <Badge
                  status={
                    activeConversation.status === "active"
                      ? "success"
                      : "default"
                  }
                />
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-5"
              >
                {uiMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    Chưa có tin nhắn. Hãy bắt đầu cuộc hội thoại!
                  </div>
                ) : (
                  <>
                    {uiMessages.map((msg) => (
                      <StaffChatMessage
                        key={msg.id}
                        message={msg}
                        isOwnMessage={msg.senderId === user?.id}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              {activeConversation.status === "active" ? (
                <div className="flex-shrink-0">
                  <MessageInput />
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm p-3 border-t flex-shrink-0">
                  Cuộc hội thoại đã kết thúc.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-5 text-gray-500">
              <div className="text-center">
                <p>Chọn một cuộc hội thoại để bắt đầu chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffChatWindow;
