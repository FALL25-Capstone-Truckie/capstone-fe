import type { GeocodingResult } from '../../models/Map';
import type { RouteResponse } from '../../models/Route';
import type { ApiResponse } from '../api/types';

// Re-export map provider types from models
export type { VietMapSearchResponse, VietMapRouteResponse } from '../../models/VietMap';

// Generic map service response types
export type GeocodingApiResponse = ApiResponse<GeocodingResult[]>;
export type RouteApiResponse = ApiResponse<RouteResponse>;