import type { NotificationType } from '../types/notification';

// Complete mappings for all NotificationType values
export const notificationColorMap: Record<NotificationType, string> = {
  // Customer - Order Lifecycle
  ORDER_CREATED: 'blue',
  ORDER_PROCESSING: 'processing',
  CONTRACT_READY: 'orange',
  CONTRACT_SIGNED: 'green',
  PAYMENT_DEPOSIT_SUCCESS: 'green',
  PAYMENT_FULL_SUCCESS: 'green',
  DRIVER_ASSIGNED: 'blue',
  
  // Customer - Delivery Tracking
  PICKING_UP_STARTED: 'blue',
  DELIVERY_STARTED: 'processing',
  DELIVERY_IN_PROGRESS: 'processing',
  DELIVERY_COMPLETED: 'success',
  DELIVERY_FAILED: 'error',
  
  // Customer - Cancellation & Return
  ORDER_CANCELLED: 'error',
  RETURN_STARTED: 'orange',
  RETURN_COMPLETED: 'success',
  RETURN_PAYMENT_REQUIRED: 'orange',
  COMPENSATION_PROCESSED: 'green',
  
  // Customer - Issues
  ISSUE_REPORTED: 'warning',
  ISSUE_IN_PROGRESS: 'processing',
  ISSUE_RESOLVED: 'success',
  PACKAGE_DAMAGED: 'error',
  ORDER_REJECTED_BY_RECEIVER: 'error',
  REROUTE_REQUIRED: 'warning',
  SEAL_REPLACED: 'processing',
  
  // Customer - Reminders
  PAYMENT_REMINDER: 'orange',
  PAYMENT_OVERDUE: 'error',
  CONTRACT_SIGN_REMINDER: 'orange',
  CONTRACT_SIGN_OVERDUE: 'error',
  
  // Staff - Order Management
  STAFF_ORDER_CREATED: 'blue',
  STAFF_ORDER_PROCESSING: 'processing',
  STAFF_CONTRACT_SIGNED: 'green',
  STAFF_DEPOSIT_RECEIVED: 'green',
  STAFF_FULL_PAYMENT: 'green',
  STAFF_RETURN_PAYMENT: 'green',
  STAFF_ORDER_CANCELLED: 'error',
  STAFF_PAYMENT_REMINDER: 'orange',
  
  // Staff - Issues
  NEW_ISSUE_REPORTED: 'error',
  ISSUE_ESCALATED: 'error',
  
  // Staff - Maintenance
  VEHICLE_MAINTENANCE_DUE: 'warning',
  VEHICLE_INSPECTION_DUE: 'warning',
  
  // Driver
  NEW_ORDER_ASSIGNED: 'blue',
  PAYMENT_RECEIVED: 'green',
  RETURN_PAYMENT_SUCCESS: 'green',
  SEAL_ASSIGNED: 'processing',
  DAMAGE_RESOLVED: 'success',
  ORDER_REJECTION_RESOLVED: 'success',
  
  // Legacy/Generic
  SEAL_REPLACEMENT: 'orange',
  ORDER_REJECTION: 'error',
  DAMAGE: 'error',
  REROUTE: 'warning',
  PENALTY: 'error',
  PAYMENT_SUCCESS: 'green',
  PAYMENT_TIMEOUT: 'error',
  ORDER_STATUS_CHANGE: 'blue',
  ISSUE_STATUS_CHANGE: 'processing',
  GENERAL: 'default',
};

export const notificationNameMap: Record<NotificationType, string> = {
  // Customer - Order Lifecycle
  ORDER_CREATED: 'Đơn hàng mới',
  ORDER_PROCESSING: 'Đang xử lý',
  CONTRACT_READY: 'Hợp đồng sẵn sàng',
  CONTRACT_SIGNED: 'Hợp đồng đã ký',
  PAYMENT_DEPOSIT_SUCCESS: 'Thanh toán cọc thành công',
  PAYMENT_FULL_SUCCESS: 'Thanh toán đủ thành công',
  DRIVER_ASSIGNED: 'Đã phân công tài xế',
  
  // Customer - Delivery Tracking
  PICKING_UP_STARTED: 'Bắt đầu lấy hàng',
  DELIVERY_STARTED: 'Đang vận chuyển',
  DELIVERY_IN_PROGRESS: 'Sắp giao hàng',
  DELIVERY_COMPLETED: 'Giao hàng thành công',
  DELIVERY_FAILED: 'Giao hàng thất bại',
  
  // Customer - Cancellation & Return
  ORDER_CANCELLED: 'Đơn hàng bị hủy',
  RETURN_STARTED: 'Bắt đầu trả hàng',
  RETURN_COMPLETED: 'Trả hàng thành công',
  RETURN_PAYMENT_REQUIRED: 'Cần thanh toán cước trả',
  COMPENSATION_PROCESSED: 'Bồi thường đã xử lý',
  
  // Customer - Issues
  ISSUE_REPORTED: 'Sự cố đã báo cáo',
  ISSUE_IN_PROGRESS: 'Sự cố đang xử lý',
  ISSUE_RESOLVED: 'Sự cố đã giải quyết',
  PACKAGE_DAMAGED: 'Hàng hóa bị hư hỏng',
  ORDER_REJECTED_BY_RECEIVER: 'Người nhận từ chối',
  REROUTE_REQUIRED: 'Cần tái định tuyến',
  SEAL_REPLACED: 'Seal đã được thay thế',
  
  // Customer - Reminders
  PAYMENT_REMINDER: 'Nhắc nhở thanh toán',
  PAYMENT_OVERDUE: 'Quá hạn thanh toán',
  CONTRACT_SIGN_REMINDER: 'Nhắc nhở ký hợp đồng',
  CONTRACT_SIGN_OVERDUE: 'Quá hạn ký hợp đồng',
  
  // Staff - Order Management
  STAFF_ORDER_CREATED: 'Đơn hàng mới',
  STAFF_ORDER_PROCESSING: 'Cần xử lý đơn hàng',
  STAFF_CONTRACT_SIGNED: 'Hợp đồng đã ký',
  STAFF_DEPOSIT_RECEIVED: 'Đã nhận cọc',
  STAFF_FULL_PAYMENT: 'Đã thanh toán đủ',
  STAFF_RETURN_PAYMENT: 'Đã nhận cước trả',
  STAFF_ORDER_CANCELLED: 'Đơn hàng bị hủy',
  STAFF_PAYMENT_REMINDER: 'Nhắc nhở thanh toán',
  
  // Staff - Issues
  NEW_ISSUE_REPORTED: 'Sự cố mới',
  ISSUE_ESCALATED: 'Sự cố khẩn cấp',
  
  // Staff - Maintenance
  VEHICLE_MAINTENANCE_DUE: 'Đến hạn bảo trì',
  VEHICLE_INSPECTION_DUE: 'Đến hạn kiểm định',
  
  // Driver
  NEW_ORDER_ASSIGNED: 'Đơn hàng mới',
  PAYMENT_RECEIVED: 'Đã nhận thanh toán',
  RETURN_PAYMENT_SUCCESS: 'Thanh toán cước trả thành công',
  SEAL_ASSIGNED: 'Đã cấp seal',
  DAMAGE_RESOLVED: 'Sự cố đã giải quyết',
  ORDER_REJECTION_RESOLVED: 'Vấn đề từ chối đã giải quyết',
  
  // Legacy/Generic
  SEAL_REPLACEMENT: 'Thay thế seal',
  ORDER_REJECTION: 'Từ chối đơn hàng',
  DAMAGE: 'Hư hỏng',
  REROUTE: 'Tái định tuyến',
  PENALTY: 'Phạt',
  PAYMENT_SUCCESS: 'Thanh toán thành công',
  PAYMENT_TIMEOUT: 'Quá hạn thanh toán',
  ORDER_STATUS_CHANGE: 'Thay đổi trạng thái đơn',
  ISSUE_STATUS_CHANGE: 'Thay đổi trạng thái sự cố',
  GENERAL: 'Thông báo chung',
};
