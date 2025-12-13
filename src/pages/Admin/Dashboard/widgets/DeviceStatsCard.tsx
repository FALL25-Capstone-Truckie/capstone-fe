import React from 'react';
import { Card, Row, Col, Spin } from 'antd';
import StatCard from '../../../../components/common/StatCard';
import { 
  MobileOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  LinkOutlined 
} from '@ant-design/icons';
import type { DeviceStatistics } from '@/services/dashboard/dashboardService';

interface DeviceStatsCardProps {
  data?: DeviceStatistics;
  loading?: boolean;
}

const DeviceStatsCard: React.FC<DeviceStatsCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card
        title={
          <span className="text-blue-800">
            <MobileOutlined className="mr-2" />
            Thống kê thiết bị
          </span>
        }
        className="shadow-sm"
      >
        <div className="flex justify-center items-center h-32">
          <Spin />
        </div>
      </Card>
    );
  }

  const stats = data || {
    totalDevices: 0,
    activeDevices: 0,
    inactiveDevices: 0,
    assignedDevices: 0,
  };

  return (
    <Card
      title={
        <span className="text-blue-800">
          <MobileOutlined className="mr-2" />
          Thống kê thiết bị
        </span>
      }
      className="shadow-sm"
    >
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <StatCard
            title="Tổng thiết bị"
            value={stats.totalDevices}
            prefix={<MobileOutlined />}
            valueStyle={{ color: '#1890ff' }}
            borderColor="#1890ff"
            loading={loading}
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Đang hoạt động"
            value={stats.activeDevices}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
            borderColor="#52c41a"
            loading={loading}
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Không hoạt động"
            value={stats.inactiveDevices}
            prefix={<CloseCircleOutlined />}
            valueStyle={{ color: '#ff4d4f' }}
            borderColor="#ff4d4f"
            loading={loading}
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Đã gắn xe"
            value={stats.assignedDevices}
            prefix={<LinkOutlined />}
            valueStyle={{ color: '#722ed1' }}
            borderColor="#722ed1"
            loading={loading}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default DeviceStatsCard;
