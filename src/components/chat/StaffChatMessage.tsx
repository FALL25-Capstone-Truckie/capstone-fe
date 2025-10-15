import React from "react";
import { Avatar, Image } from "antd";
import { UserOutlined, CustomerServiceOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { ChatMessage } from "@/models/Chat";

interface StaffChatMessageProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

const StaffChatMessage: React.FC<StaffChatMessageProps> = ({
  message,
  isOwnMessage,
}) => {
  if (!message?.content) {
    return null;
  }

  const messageTime = dayjs(message.timestamp).format("HH:mm");
  const isSystemMessage =
    message.senderType === "anonymous" && message.content.startsWith("SYSTEM:");
  console.log("Rendering message:", message);

  // 🟡 Tin nhắn hệ thống
  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
          {message.content.replace("SYSTEM:", "")} • {messageTime}
        </div>
      </div>
    );
  }

  // 🟢 Kiểm tra xem nội dung có phải ảnh không
  const isImageMessage =
    message.content &&
    /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)$/i.test(message.content);

  // Kiểm tra nếu xem nội dung là URL
  const isUrlMessage =
    message.content && /^(https?:\/\/[^\s]+)$/.test(message.content);

  function shortenUrl(url: string) {
    try {
      const u = new URL(url);
      return (
        u.hostname +
        u.pathname.substring(0, 20) +
        (u.pathname.length > 20 ? "..." : "")
      );
    } catch {
      return url;
    }
  }

  return (
    <div
      className={`flex mb-4 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      {!isOwnMessage && (
        <Avatar
          icon={<UserOutlined />}
                    className="mr-2 bg-blue-500"
        />
      )}

      <div className="max-w-[70%] flex flex-col">
        {/* 💬 Nếu là ảnh */}
        {isImageMessage ? (
          <div className="rounded-lg overflow-hidden">
            <Image
              src={message.content}
              alt="image-message"
              width={200}
              className="rounded-lg"
            />
          </div>
        ) : isUrlMessage ? (
          // 🔗 Nếu là URL
          <div
            className={`px-4 py-2 rounded-lg break-words w-full ${
              isOwnMessage
                ? "bg-blue-500 text-white rounded-tr-none"
                : "bg-gray-100 text-gray-800 rounded-tl-none"
            }`}
          >
            <a
              href={message.content}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline break-all ${
                isOwnMessage ? "text-white" : "text-blue-600"
              }`}
            >
              {shortenUrl(message.content)}
            </a>
          </div>
        ) : (
          // 💬 Nếu là text - ĐÃ SỬA LỖI TRÀN
          <div
            className={`px-4 py-2 rounded-lg whitespace-pre-wrap break-words w-full ${
              isOwnMessage
                ? "bg-blue-500 text-white rounded-tr-none"
                : "bg-gray-100 text-gray-800 rounded-tl-none"
            }`}
            style={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {message.content}
          </div>
        )}

        <div
          className={`text-xs mt-1 text-gray-500 ${
            isOwnMessage ? "text-right" : "text-left"
          }`}
        >
          {messageTime}
        </div>
      </div>

      {isOwnMessage && (
        <Avatar
          icon={<CustomerServiceOutlined />}
                    className="ml-2 bg-gray-500"
        />
      )}
    </div>
  );
};

export default StaffChatMessage;
