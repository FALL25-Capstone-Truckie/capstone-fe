import api from "./api";
import type { FormOrders, Orders } from "../types";

export const orderService = {
  // Get all orders
  getAllOrders: async (): Promise<Orders[]> => {
    const response = await api.get("/orders");
    return response.data.data;
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<Orders> => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  // Create new order
  createOrder: async (orderData: FormOrders): Promise<Orders> => {
    const response = await api.post("/orders", orderData);
    return response.data.data;
  },

  // Update order
  updateOrder: async (
    id: string,
    orderData: Partial<Orders>
  ): Promise<Orders> => {
    const response = await api.put(`/orders/${id}`, orderData);
    return response.data.data;
  },

  // Delete order
  deleteOrder: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  // Track order location
  trackOrder: async (
    id: string
  ): Promise<{ latitude: number; longitude: number }> => {
    const response = await api.get(`/orders/${id}/track`);
    return response.data.data;
  },
};
