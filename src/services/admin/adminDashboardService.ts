import httpClient from '../api/httpClient';
import { handleApiError } from '../api/errorHandler';
import type {
  AdminDashboardSummary,
  RegistrationTimeSeries,
  TopStaff,
  TopDriver,
  PeriodType,
} from '../../models/AdminDashboard';

const adminDashboardService = {
  getSummary: async (period: PeriodType = 'month'): Promise<AdminDashboardSummary> => {
    try {
      const response = await httpClient.get('/admin/dashboard/summary', {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin dashboard summary:', error);
      throw handleApiError(error, 'Không thể tải tổng quan dashboard');
    }
  },

  getRegistrations: async (
    role: string,
    period: PeriodType = 'month'
  ): Promise<RegistrationTimeSeries> => {
    try {
      const response = await httpClient.get('/admin/dashboard/registrations', {
        params: { role, period },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching registrations:', error);
      throw handleApiError(error, 'Không thể tải dữ liệu đăng ký');
    }
  },

  getTopStaff: async (
    limit: number = 5,
    period: PeriodType = 'month'
  ): Promise<TopStaff[]> => {
    try {
      const response = await httpClient.get('/admin/dashboard/top-staff', {
        params: { limit, period },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top staff:', error);
      throw handleApiError(error, 'Không thể tải danh sách nhân viên xuất sắc');
    }
  },

  getTopDrivers: async (
    limit: number = 5,
    period: PeriodType = 'month'
  ): Promise<TopDriver[]> => {
    try {
      const response = await httpClient.get('/admin/dashboard/top-drivers', {
        params: { limit, period },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top drivers:', error);
      throw handleApiError(error, 'Không thể tải danh sách tài xế xuất sắc');
    }
  },

  getAdminAiSummary: async (period: PeriodType = 'month'): Promise<string> => {
    try {
      const response = await httpClient.get('/admin/dashboard/ai-summary', {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin AI summary:', error);
      throw handleApiError(error, 'Không thể tải tóm tắt AI');
    }
  },
};

export default adminDashboardService;
