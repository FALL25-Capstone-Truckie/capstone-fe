import type { OrderSize, OrderSizeCreateDto, OrderSizeUpdateDto } from '@/models/OrderSize';
import type { ApiResponse, PaginatedResponse } from '../api/types';

export type { OrderSize, OrderSizeCreateDto, OrderSizeUpdateDto };

export type OrderSizeResponse = ApiResponse<OrderSize>;
export type OrderSizesResponse = ApiResponse<OrderSize[]>;
export type PaginatedOrderSizesResponse = ApiResponse<PaginatedResponse<OrderSize>>;