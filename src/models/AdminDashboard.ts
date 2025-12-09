export type PeriodType = 'week' | 'month' | 'year';

export interface DateRange {
  from: string;
  to: string;
}

export interface RoleCount {
  count: number;
  deltaPercent: number;
}

export interface UserTotals {
  customers: RoleCount;
  staff: RoleCount;
  drivers: RoleCount;
}

export interface MaintenanceAlert {
  vehicleId: string;
  licensePlate: string;
  maintenanceType: string;
  scheduledDate: string;
  isOverdue: boolean;
}

export interface FleetStatus {
  totalVehicles: number;
  availableVehicles: number;
  inUseVehicles: number;
  inMaintenanceVehicles: number;
  maintenanceAlerts: MaintenanceAlert[];
}

export interface PenaltiesSummary {
  totalPenalties: number;
  previousPenalties: number;
  deltaPercent: number;
}

export interface PenaltiesDataPoint {
  date: string;
  count: number;
}

export interface PenaltiesTimeSeries {
  period: PeriodType;
  points: PenaltiesDataPoint[];
}

export interface AdminDashboardSummary {
  period: PeriodType;
  currentRange: DateRange;
  previousRange: DateRange;
  totals: UserTotals;
  fleetStatus: FleetStatus;
  penaltiesSummary?: PenaltiesSummary;
  penaltiesTimeSeries?: PenaltiesTimeSeries;
}

export interface DataPoint {
  date: string;
  count: number;
}

export interface RegistrationTimeSeries {
  role: string;
  period: PeriodType;
  points: DataPoint[];
}

export interface TopStaff {
  staffId: string;
  name: string;
  email: string;
  resolvedIssues: number;
  avatarUrl?: string;
}

export interface TopDriver {
  driverId: string;
  name: string;
  email: string;
  acceptedTrips: number;
  avatarUrl?: string;
}

export interface FleetStats {
  vehicles: RoleCount;
  devices: RoleCount;
  maintenances: RoleCount;
  penalties: RoleCount;
}
