/**
 * Role mapping utility for converting backend roles to frontend notification roles
 * Handles role conversion with proper fallbacks and validation
 */

export type NotificationRole = 'STAFF' | 'CUSTOMER';

/**
 * Maps backend user role to frontend notification role
 * @param backendRole - Role from backend (lowercase)
 * @returns Valid notification role with fallback
 */
export const mapToNotificationRole = (backendRole?: string): NotificationRole => {
  if (!backendRole) {
    console.warn('⚠️ No backend role provided, defaulting to CUSTOMER');
    return 'CUSTOMER';
  }

  const upperRole = backendRole.toUpperCase();
  
  // Staff roles (admin and staff both use StaffNotificationListPage)
  if (upperRole === 'ADMIN' || upperRole === 'STAFF') {
    return 'STAFF';
  }
  
  // Customer role
  if (upperRole === 'CUSTOMER') {
    return 'CUSTOMER';
  }
  
  // Unknown role - log warning and default to CUSTOMER
  console.warn(`⚠️ Unknown backend role "${backendRole}", defaulting to CUSTOMER`);
  return 'CUSTOMER';
};

/**
 * Checks if a role is valid for notifications
 * @param role - Role to validate
 * @returns True if role is valid for notifications
 */
export const isValidNotificationRole = (role: string): role is NotificationRole => {
  return role === 'STAFF' || role === 'CUSTOMER';
};

/**
 * Gets the appropriate notification route based on role
 * @param role - Notification role
 * @returns Route path for notification list page
 */
export const getNotificationRoute = (role: NotificationRole): string => {
  return role === 'STAFF' ? '/staff/notifications' : '/notifications';
};
