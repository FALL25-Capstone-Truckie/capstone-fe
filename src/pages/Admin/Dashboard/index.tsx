import React, { useState } from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { UserOutlined } from '@ant-design/icons';
import adminDashboardService from '../../../services/admin/adminDashboardService';
import { StatsCards, RegistrationChart, TopPerformersChart } from './widgets';
import { TimeRangeFilter, KpiCard, AiSummaryCard } from '../../Dashboard/components/widgets';
import type { PeriodType } from '../../../models/AdminDashboard';
import type { TimeRange } from '../../../services/dashboard';

const { Title, Text } = Typography;

const AdminDashboard: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [customDates, setCustomDates] = useState<{ from?: string; to?: string }>({});

  // Map TimeRange to PeriodType
  const mapTimeRangeToPeriod = (range: TimeRange): PeriodType => {
    switch (range) {
      case 'WEEK':
        return 'week';
      case 'YEAR':
        return 'year';
      case 'MONTH':
      default:
        return 'month';
    }
  };

  const handleTimeRangeChange = (range: TimeRange, from?: string, to?: string) => {
    setPeriod(mapTimeRangeToPeriod(range));
    if (range === 'CUSTOM') {
      setCustomDates({ from, to });
    } else {
      setCustomDates({});
    }
  };

  // Fetch dashboard summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['adminDashboardSummary', period],
    queryFn: () => adminDashboardService.getSummary(period),
  });

  // Fetch customer registrations
  const { data: customerRegistrations, isLoading: customerLoading } = useQuery({
    queryKey: ['customerRegistrations', period],
    queryFn: () => adminDashboardService.getRegistrations('customer', period),
  });

  // Fetch staff registrations
  const { data: staffRegistrations, isLoading: staffLoading } = useQuery({
    queryKey: ['staffRegistrations', period],
    queryFn: () => adminDashboardService.getRegistrations('staff', period),
  });

  // Fetch driver registrations
  const { data: driverRegistrations, isLoading: driverLoading } = useQuery({
    queryKey: ['driverRegistrations', period],
    queryFn: () => adminDashboardService.getRegistrations('driver', period),
  });

  // Fetch top staff
  const { data: topStaff, isLoading: topStaffLoading, error: topStaffError } = useQuery({
    queryKey: ['topStaff', period],
    queryFn: async () => {
      const result = await adminDashboardService.getTopStaff(5, period);
      console.log('Top Staff Data:', result);
      return result;
    },
  });

  // Fetch top drivers
  const { data: topDrivers, isLoading: topDriversLoading, error: topDriversError } = useQuery({
    queryKey: ['topDrivers', period],
    queryFn: async () => {
      const result = await adminDashboardService.getTopDrivers(5, period);
      console.log('Top Drivers Data:', result);
      return result;
    },
  });

  // Fetch AI summary
  const { data: aiSummary, isLoading: aiSummaryLoading, error: aiSummaryError } = useQuery({
    queryKey: ['adminAiSummary', period],
    queryFn: () => adminDashboardService.getAdminAiSummary(period),
  });

  // Calculate total users
  const totalUsers = (summary?.totals.customers.count || 0) + 
                     (summary?.totals.staff.count || 0) + 
                     (summary?.totals.drivers.count || 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <Title level={2} className="m-0 text-blue-800">
              Tổng quan hệ thống
            </Title>
            <Text type="secondary">Theo dõi thống kê và hiệu suất tổng thể</Text>
          </div>
          <TimeRangeFilter
            value={period === 'week' ? 'WEEK' : period === 'year' ? 'YEAR' : 'MONTH'}
            onChange={handleTimeRangeChange}
            customFromDate={customDates.from}
            customToDate={customDates.to}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Tổng số người dùng"
            value={totalUsers}
            prefix={<UserOutlined className="text-purple-500" />}
            loading={summaryLoading}
            borderColor="border-t-purple-500"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Tổng số khách hàng"
            value={summary?.totals.customers.count || 0}
            prefix={<UserOutlined className="text-blue-500" />}
            loading={summaryLoading}
            borderColor="border-t-blue-500"
            suffix={
              summary?.totals.customers.deltaPercent !== undefined 
                ? `${summary.totals.customers.deltaPercent >= 0 ? '↑' : '↓'} ${Math.abs(summary.totals.customers.deltaPercent).toFixed(1)}%`
                : undefined
            }
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Tổng số nhân viên"
            value={summary?.totals.staff.count || 0}
            prefix={<UserOutlined className="text-green-500" />}
            loading={summaryLoading}
            borderColor="border-t-green-500"
            suffix={
              summary?.totals.staff.deltaPercent !== undefined 
                ? `${summary.totals.staff.deltaPercent >= 0 ? '↑' : '↓'} ${Math.abs(summary.totals.staff.deltaPercent).toFixed(1)}%`
                : undefined
            }
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Tổng số tài xế"
            value={summary?.totals.drivers.count || 0}
            prefix={<UserOutlined className="text-orange-500" />}
            loading={summaryLoading}
            borderColor="border-t-orange-500"
            suffix={
              summary?.totals.drivers.deltaPercent !== undefined 
                ? `${summary.totals.drivers.deltaPercent >= 0 ? '↑' : '↓'} ${Math.abs(summary.totals.drivers.deltaPercent).toFixed(1)}%`
                : undefined
            }
          />
        </Col>
      </Row>

      {/* AI Summary - Full Row */}
      <div className="mb-6">
        <AiSummaryCard
          summary={aiSummary || ''}
          loading={aiSummaryLoading}
        />
      </div>

      {/* Customer Registrations Chart - Full Row */}
      <div className="mt-6">
        <RegistrationChart
          data={customerRegistrations || null}
          loading={customerLoading}
          title="Số khách hàng đăng ký theo thời gian"
          color="#1890ff"
          period={period}
        />
      </div>

      {/* Staff & Driver Registrations Charts - Same Row */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={12}>
          <RegistrationChart
            data={staffRegistrations || null}
            loading={staffLoading}
            title="Số nhân viên đăng ký theo thời gian"
            color="#52c41a"
            period={period}
          />
        </Col>
        <Col xs={24} lg={12}>
          <RegistrationChart
            data={driverRegistrations || null}
            loading={driverLoading}
            title="Số tài xế đăng ký theo thời gian"
            color="#faad14"
            period={period}
          />
        </Col>
      </Row>

      {/* Top Staff & Top Drivers - Same Row */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={12}>
          <TopPerformersChart
            data={topStaff || null}
            loading={topStaffLoading}
            title="Top nhân viên xuất sắc"
            color="#52c41a"
            metricKey="resolvedIssues"
            metricLabel="Sự cố đã xử lý"
          />
        </Col>
        <Col xs={24} lg={12}>
          <TopPerformersChart
            data={topDrivers || null}
            loading={topDriversLoading}
            title="Top tài xế xuất sắc"
            color="#faad14"
            metricKey="acceptedTrips"
            metricLabel="Chuyến xe hoàn thành"
          />
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
