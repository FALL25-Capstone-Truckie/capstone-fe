import type { OrderDetailGroup, RouteInfo, Seal } from "../../../../../models/VehicleAssignment";

export interface TripAssignment {
    groupIndex: number;
    group: OrderDetailGroup;
    vehicleId?: string;
    driverId_1?: string;
    driverId_2?: string;
    description?: string;
    routeInfo?: RouteInfo;
    seals?: Seal[];
    completed: boolean;
}
