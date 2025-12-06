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

export interface AdminDashboardSummary {
  period: PeriodType;
  currentRange: DateRange;
  previousRange: DateRange;
  totals: UserTotals;
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
