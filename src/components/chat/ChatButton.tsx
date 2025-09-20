import React from 'react';
import { Badge, message } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useChatContext } from '@/context/ChatContext';
import roomService from '@/services/room/roomService';
import { AUTH_ACCESS_TOKEN_KEY } from '@/config';

const ChatButton: React.FC = () => {
    const { toggleChat, unreadCount } = useChatContext();

    // Lấy userId từ localStorage hoặc context
    const userId = localStorage.getItem('userId');

    const handleChatClick = async () => {
        if (!userId) {
            message.error("Bạn chưa đăng nhập!");
            return;
        }

        // 🔑 Log token ở đây
        const token = localStorage.getItem(AUTH_ACCESS_TOKEN_KEY);
        console.log("🔑 Auth token at ChatButton:", token ? token.substring(0, 30) + "..." : "No token found");

        try {
            const hasRoom = await roomService.isCustomerHasRoomSupported(userId);
            console.log("📡 API hasRoom response:", hasRoom);

            if (!hasRoom) {
                const newRoom = await roomService.createRoom({
                    orderId: undefined, // hoặc null nếu BE chấp nhận
                    userIds: [userId],
                });
                console.log("✅ Created room:", newRoom);
            }
            toggleChat();
        } catch (error) {
            console.error("❌ ChatButton error:", error);
            message.error("Không thể mở phòng hỗ trợ!");
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Badge count={unreadCount} overflowCount={99}>
                <div
                    onClick={handleChatClick}
                    className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-lg cursor-pointer transition-colors duration-200"
                >
                    <MessageOutlined style={{ fontSize: '24px', color: 'white' }} />
                </div>
            </Badge>
        </div>
    );
};

export default ChatButton;
