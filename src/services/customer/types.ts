import type { Customer, CustomerUpdateRequest } from '@/models/Customer';
import type { UserResponse } from '@/models/User';
import type { ApiResponse, PaginatedResponse } from '../api/types';

export type { Customer, UserResponse, CustomerUpdateRequest };
export type CustomerResponse = ApiResponse<Customer>;
export type CustomersResponse = ApiResponse<Customer[]>;
export type PaginatedCustomersResponse = ApiResponse<PaginatedResponse<Customer>>;