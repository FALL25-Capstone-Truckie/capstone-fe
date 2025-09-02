// Order model
export interface Order {
    id: string;
    customerId: string;
    customerName: string;
    origin: string;
    destination: string;
    status: OrderStatus;
    createdAt: string;
    updatedAt?: string;
    completedAt?: string;
    driverId?: string;
    driverName?: string;
    estimatedDistance?: number;
    estimatedDuration?: number;
    actualDistance?: number;
    actualDuration?: number;
    price?: number;
    notes?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface OrderCreateRequest {
    origin: string;
    destination: string;
    notes?: string;
}

export interface OrderUpdateRequest {
    status?: OrderStatus;
    driverId?: string;
    notes?: string;
}

export interface OrderResponse {
    id: string;
    customerId: string;
    customerName: string;
    origin: string;
    destination: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
    completedAt?: string;
    driverId?: string;
    driverName?: string;
    estimatedDistance?: number;
    estimatedDuration?: number;
    actualDistance?: number;
    actualDuration?: number;
    price?: number;
    notes?: string;
}

// Chuyển đổi từ API response sang model
export const mapOrderResponseToModel = (apiOrder: OrderResponse): Order => {
    return {
        ...apiOrder,
        status: apiOrder.status as OrderStatus
    };
};

// Lọc orders theo status
export const filterOrdersByStatus = (orders: Order[], status: OrderStatus | 'all'): Order[] => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
};

// Tính tổng doanh thu từ danh sách orders
export const calculateTotalRevenue = (orders: Order[]): number => {
    return orders.reduce((total, order) => total + (order.price || 0), 0);
};

// Kiểm tra xem order có thể hủy không
export const canCancelOrder = (order: Order): boolean => {
    return order.status === 'pending' || order.status === 'processing';
}; 