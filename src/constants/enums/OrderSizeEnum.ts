/**
 * Order Size Enum - Các loại kích thước kiện hàng
 */
export enum OrderSizeEnum {
    HALF_PALLET = 'HALF_PALLET',
    STANDARD_PALLET = 'STANDARD_PALLET',
    LARGE_PALLET = 'LARGE_PALLET',
    TALL_ITEM = 'TALL_ITEM',
    LONG_ITEM = 'LONG_ITEM',
    SMALL_PARCEL = 'SMALL_PARCEL',
    MEDIUM_BOX = 'MEDIUM_BOX',
    LARGE_BOX = 'LARGE_BOX',
}

/**
 * Vietnamese labels for order size
 */
export const OrderSizeLabels: Record<string, string> = {
    [OrderSizeEnum.HALF_PALLET]: 'Nửa pallet',
    [OrderSizeEnum.STANDARD_PALLET]: 'Pallet tiêu chuẩn',
    [OrderSizeEnum.LARGE_PALLET]: 'Pallet lớn',
    [OrderSizeEnum.TALL_ITEM]: 'Hàng cao',
    [OrderSizeEnum.LONG_ITEM]: 'Hàng dài',
    [OrderSizeEnum.SMALL_PARCEL]: 'Kiện nhỏ',
    [OrderSizeEnum.MEDIUM_BOX]: 'Thùng trung bình',
    [OrderSizeEnum.LARGE_BOX]: 'Thùng lớn',
};

/**
 * Color configuration for order size badges
 */
export const OrderSizeColors: Record<string, { bg: string; text: string; border: string }> = {
    [OrderSizeEnum.HALF_PALLET]: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    [OrderSizeEnum.STANDARD_PALLET]: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    [OrderSizeEnum.LARGE_PALLET]: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    [OrderSizeEnum.TALL_ITEM]: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    [OrderSizeEnum.LONG_ITEM]: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    [OrderSizeEnum.SMALL_PARCEL]: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    [OrderSizeEnum.MEDIUM_BOX]: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    [OrderSizeEnum.LARGE_BOX]: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
};

/**
 * Icons for order size (using emoji for simplicity)
 */
export const OrderSizeIcons: Record<string, string> = {
    [OrderSizeEnum.HALF_PALLET]: '📦',
    [OrderSizeEnum.STANDARD_PALLET]: '🏗️',
    [OrderSizeEnum.LARGE_PALLET]: '🏭',
    [OrderSizeEnum.TALL_ITEM]: '📏',
    [OrderSizeEnum.LONG_ITEM]: '📐',
    [OrderSizeEnum.SMALL_PARCEL]: '📮',
    [OrderSizeEnum.MEDIUM_BOX]: '📦',
    [OrderSizeEnum.LARGE_BOX]: '🗃️',
};

/**
 * Get Vietnamese label for order size description
 */
export const getOrderSizeLabel = (description: string): string => {
    return OrderSizeLabels[description] || description;
};

/**
 * Get color configuration for order size
 */
export const getOrderSizeColor = (description: string): { bg: string; text: string; border: string } => {
    return OrderSizeColors[description] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
};

/**
 * Get icon for order size
 */
export const getOrderSizeIcon = (description: string): string => {
    return OrderSizeIcons[description] || '📦';
};
