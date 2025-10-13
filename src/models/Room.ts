// Request DTO
export interface CreateRoomRequest {
  orderId?: string;
  userId: string;
}

export interface GetRoomRequest {
  orderId: string;
  roomType: RoomType;
}

// ParticipantResponse có thể cần định nghĩa thêm, ví dụ:
export interface ParticipantResponse {
  userId: string;
  roleName: string;
  
}

// Response DTO
export interface CreateRoomResponse {
  roomId: string;
  orderId: string;
  participants: ParticipantResponse[];
  status: string;
  type?: string;
  createdAt: Date;
}

export enum RoomType {
  ORDER_TYPE = "ORDER_TYPE",
  SUPPORT = "SUPPORT",
  SUPPORTED = "SUPPORTED",
  DRIVER_STAFF_ORDER = "DRIVER_STAFF_ORDER",
}