import type {
  Order,
  OrderDetail,
  OrderCreateRequest as OrderCreateRequestModel,
  OrderUpdateDto,
  OrderTrackingResponse,
  CustomerOrder,
  CustomerOrderDetail,
  CustomerOrderDetailItem,
  CustomerContract,
  CustomerTransaction,
  RecentReceiverSuggestion,
  StaffOrderDetail,
  StaffOrderDetailItem,
  UnitsListResponse,
  ReceiverDetailsResponse,
  VehicleSuggestion,
  PackedDetail,
  AssignedDetail,
  VehicleSuggestionsResponse,
  BillOfLadingPreviewResponse,
  BothOptimalAndRealisticVehicleSuggestionsResponse,
  BothOptimalAndRealisticVehicle,
} from "@/models/Order";
import type { ApiResponse, PaginatedResponse } from "../api/types";

// Re-export types from models
export type {
  UnitsListResponse,
  ReceiverDetailsResponse,
  VehicleSuggestion,
  PackedDetail,
  AssignedDetail,
  VehicleSuggestionsResponse,
  BillOfLadingPreviewResponse,
  BothOptimalAndRealisticVehicleSuggestionsResponse,
  BothOptimalAndRealisticVehicle,
};

export interface CustomerOrdersResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: CustomerOrder[];
}

export interface CustomerOrderDetailResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    order: CustomerOrderDetail;
    contract?: CustomerContract;
    transactions?: CustomerTransaction[];
  };
}

export interface RecentReceiversResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: RecentReceiverSuggestion[];
}

// Types imported from models - no need to redefine

export interface StaffOrderDetailResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    order: StaffOrderDetail;
    contract?: CustomerContract;
    transactions?: CustomerTransaction[];
  };
}

export type OrderResponse = ApiResponse<Order>;
export type OrdersResponse = ApiResponse<Order[]>;
export type OrderDetailsResponse = ApiResponse<OrderDetail[]>;
export type PaginatedOrdersResponse = ApiResponse<PaginatedResponse<Order>>;
export type OrderTrackingApiResponse = ApiResponse<OrderTrackingResponse>;
export type VehicleAssignmentResponse = ApiResponse<OrderDetail[]>;

// BillOfLadingPreviewResponse, BothOptimalAndRealisticVehicleSuggestionsResponse, 
// and BothOptimalAndRealisticVehicle are imported from models
