import type { Order, OrderStatus } from '@/models/Order';
import type { ApiResponse, PaginatedResponse } from '../api/types';

export interface OrderCreateDto {
    customerId: string;
    origin: string;
    destination: string;
    notes?: string;
}

export interface OrderUpdateDto {
    status?: OrderStatus;
    driverId?: string;
    notes?: string;
}

export interface OrderTrackingResponse {
    orderId: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    speed?: number;
    heading?: number;
}

export type OrderResponse = ApiResponse<Order>;
export type OrdersResponse = ApiResponse<Order[]>;
export type PaginatedOrdersResponse = ApiResponse<PaginatedResponse<Order>>;
export type OrderTrackingApiResponse = ApiResponse<OrderTrackingResponse>; 