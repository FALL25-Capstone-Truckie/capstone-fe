import api from './api';
import type { Order } from '../types';

export const orderService = {
    // Get all orders
    getAllOrders: async (): Promise<Order[]> => {
        const response = await api.get<Order[]>('/orders');
        return response.data;
    },

    // Get order by ID
    getOrderById: async (id: string): Promise<Order> => {
        const response = await api.get<Order>(`/orders/${id}`);
        return response.data;
    },

    // Create new order
    createOrder: async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
        const response = await api.post<Order>('/orders', orderData);
        return response.data;
    },

    // Update order
    updateOrder: async (id: string, orderData: Partial<Order>): Promise<Order> => {
        const response = await api.put<Order>(`/orders/${id}`, orderData);
        return response.data;
    },

    // Delete order
    deleteOrder: async (id: string): Promise<void> => {
        await api.delete(`/orders/${id}`);
    },

    // Track order location
    trackOrder: async (id: string): Promise<{ latitude: number, longitude: number }> => {
        const response = await api.get(`/orders/${id}/track`);
        return response.data;
    }
}; 