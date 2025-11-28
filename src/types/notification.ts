export type NotificationType =
  // ============= CUSTOMER NOTIFICATIONS - ORDER LIFECYCLE =============
  | 'ORDER_CREATED'              // Đơn hàng đã tạo thành công (Email: YES)
  | 'ORDER_PROCESSING'           // Đơn hàng đang được xử lý (Email: NO)
  | 'CONTRACT_READY'             // Hợp đồng đã sẵn sàng để ký (Email: YES - ACTION)
  | 'CONTRACT_SIGNED'            // Hợp đồng đã được ký (Email: NO)
  | 'PAYMENT_DEPOSIT_SUCCESS'    // Thanh toán cọc thành công (Email: NO)
  | 'PAYMENT_FULL_SUCCESS'       // Thanh toán đủ thành công (Email: NO)
  | 'DRIVER_ASSIGNED'            // Đã phân công tài xế - cần thanh toán (Email: YES - ACTION)
  
  // ============= CUSTOMER NOTIFICATIONS - DELIVERY TRACKING =============
  | 'PICKING_UP_STARTED'         // Tài xế bắt đầu lấy hàng (Email: YES - để vào xem live tracking)
  | 'DELIVERY_STARTED'           // Đang vận chuyển hàng (Email: NO)
  | 'DELIVERY_IN_PROGRESS'       // Sắp giao hàng - gần điểm giao (Email: NO)
  | 'DELIVERY_COMPLETED'         // Giao hàng thành công (Email: YES khi ALL packages)
  | 'DELIVERY_FAILED'            // Giao hàng thất bại (Email: YES)
  
  // ============= CUSTOMER NOTIFICATIONS - CANCELLATION & RETURN =============
  | 'ORDER_CANCELLED'            // Đơn hàng/kiện hàng bị hủy (Email: YES)
  | 'RETURN_STARTED'             // Bắt đầu trả hàng - cần TT cước trả (Email: YES - ACTION)
  | 'RETURN_COMPLETED'           // Trả hàng thành công (Email: YES khi ALL packages)
  | 'RETURN_PAYMENT_REQUIRED'    // Cần thanh toán cước trả hàng (Email: YES - ACTION)
  | 'COMPENSATION_PROCESSED'     // Bồi thường đã xử lý (Email: YES)

  // ============= CUSTOMER NOTIFICATIONS - ISSUES =============
  | 'ISSUE_REPORTED'             // Sự cố đã được báo cáo (Email: NO)
  | 'ISSUE_IN_PROGRESS'          // Sự cố đang xử lý (Email: NO)
  | 'ISSUE_RESOLVED'             // Sự cố đã giải quyết (Email: NO)
  | 'PACKAGE_DAMAGED'            // Hàng bị hư hỏng (Email: YES)
  | 'ORDER_REJECTED_BY_RECEIVER' // Người nhận từ chối nhận hàng (Email: YES)
  | 'REROUTE_REQUIRED'           // Cần tái định tuyến (Email: NO)
  | 'SEAL_REPLACED'              // Seal đã được thay thế (Email: NO)

  // ============= CUSTOMER NOTIFICATIONS - REMINDERS =============
  | 'PAYMENT_REMINDER'           // Nhắc nhở thanh toán (Email: YES - ACTION)
  | 'PAYMENT_OVERDUE'            // Quá hạn thanh toán (Email: YES)
  | 'CONTRACT_SIGN_REMINDER'     // Nhắc nhở ký hợp đồng (Email: YES - ACTION)
  | 'CONTRACT_SIGN_OVERDUE'      // Quá hạn ký hợp đồng (Email: YES)

  // ============= STAFF NOTIFICATIONS - ORDER MANAGEMENT =============
  | 'STAFF_ORDER_CREATED'        // Đơn hàng mới được tạo
  | 'STAFF_ORDER_PROCESSING'     // Đơn hàng cần tạo hợp đồng
  | 'STAFF_CONTRACT_SIGNED'      // Hợp đồng đã được ký
  | 'STAFF_DEPOSIT_RECEIVED'     // Đã nhận cọc - cần lên lộ trình
  | 'STAFF_FULL_PAYMENT'         // Đã thanh toán đủ
  | 'STAFF_RETURN_PAYMENT'       // Cước trả hàng đã thanh toán
  | 'STAFF_ORDER_CANCELLED'      // Đơn/kiện hàng bị hủy
  | 'STAFF_PAYMENT_REMINDER'     // Nhắc nhở liên hệ khách thanh toán

  // ============= STAFF NOTIFICATIONS - ISSUES =============
  | 'NEW_ISSUE_REPORTED'         // Có sự cố mới cần xử lý
  | 'ISSUE_ESCALATED'            // Sự cố cần xử lý gấp

  // ============= STAFF NOTIFICATIONS - MAINTENANCE (future) =============
  | 'VEHICLE_MAINTENANCE_DUE'    // Đến hạn bảo trì
  | 'VEHICLE_INSPECTION_DUE'     // Đến hạn kiểm định

  // ============= DRIVER NOTIFICATIONS =============
  | 'NEW_ORDER_ASSIGNED'         // Đơn hàng mới được phân công
  | 'PAYMENT_RECEIVED'           // Khách đã thanh toán đủ
  | 'RETURN_PAYMENT_SUCCESS'     // Thanh toán cước trả hàng thành công
  | 'SEAL_ASSIGNED'              // Được cấp seal mới
  | 'DAMAGE_RESOLVED'            // Sự cố hư hỏng đã giải quyết
  | 'ORDER_REJECTION_RESOLVED'   // Sự cố khách từ chối đã giải quyết

  // ============= LEGACY/GENERIC TYPES =============
  | 'SEAL_REPLACEMENT'
  | 'ORDER_REJECTION'
  | 'DAMAGE'
  | 'REROUTE'
  | 'PENALTY'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_TIMEOUT'
  | 'ORDER_STATUS_CHANGE'
  | 'ISSUE_STATUS_CHANGE'
  | 'GENERAL';

export type RecipientRole = 'STAFF' | 'CUSTOMER' | 'DRIVER';

export interface Notification {
  id: string;
  title: string;
  description: string;
  notificationType: NotificationType;
  recipientRole: RecipientRole;
  createdAt: string;
  isRead: boolean;
  emailSent: boolean;
  pushNotificationSent: boolean;
  relatedOrderId?: string;
  relatedOrderDetailIds?: string[];
  relatedIssueId?: string;
  relatedVehicleAssignmentId?: string;
  relatedContractId?: string;
  metadata?: Record<string, any>;
  readAt?: string;
  updatedAt?: string;
}

export interface NotificationStats {
  totalCount: number;
  unreadCount: number;
  readCount: number;
  countByType: Record<NotificationType, number>;
}

export interface NotificationFilter {
  page?: number;
  size?: number;
  unreadOnly?: boolean;
  notificationType?: NotificationType;
  startDate?: string;
  endDate?: string;
}

export interface NotificationResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
