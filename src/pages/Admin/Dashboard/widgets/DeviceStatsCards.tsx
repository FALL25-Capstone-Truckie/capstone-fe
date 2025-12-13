import React from 'react';
import { Card, Row, Col, Spin } from 'antd';
import StatCard from '../../../../components/common/StatCard';
import {
  CarOutlined,
  HddOutlined,
  ToolOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import type { FleetStats } from '../../../../models/AdminDashboard';

interface DeviceStatsCardsProps {
  data: FleetStats | null;
  loading: boolean;
}

const DeviceStatsCards: React.FC<DeviceStatsCardsProps> = ({ data, loading }) => {
  const getIcon = (type: 'vehicles' | 'devices' | 'maintenances' | 'penalties') => {
    switch (type) {
      case 'vehicles':
        return <CarOutlined />;
      case 'devices':
        return <HddOutlined />;
      case 'maintenances':
        return <ToolOutlined />;
      case 'penalties':
        return <ExclamationCircleOutlined />;
    }
  };

  const getTitle = (type: 'vehicles' | 'devices' | 'maintenances' | 'penalties') => {
    switch (type) {
      case 'vehicles':
        return 'Tổng số phương tiện';
      case 'devices':
        return 'Tổng số thiết bị';
      case 'maintenances':
        return 'Bảo trì đang thực hiện';
      case 'penalties':
        return 'Vi phạm chưa xử lý';
    }
  };

  const renderCard = (type: 'vehicles' | 'devices' | 'maintenances' | 'penalties') => {
    const statsData = data?.[type];
    const deltaPercent = statsData?.deltaPercent || 0;
    const isPositive = deltaPercent >= 0;
    const borderColor = type === 'vehicles' ? '#1890ff' : 
                       type === 'devices' ? '#52c41a' : 
                       type === 'maintenances' ? '#faad14' : '#ff4d4f';

    return (
      <Col xs={24} sm={12} lg={6} key={type}>
        <StatCard
          title={getTitle(type)}
          value={statsData?.count || 0}
          prefix={getIcon(type)}
          suffix={
            <div className="flex items-center">
              {isPositive ? (
                <ArrowUpOutlined style={{ color: '#52c41a', marginRight: 4 }} />
              ) : (
                <ArrowDownOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
              )}
              <span
                style={{
                  color: isPositive ? '#52c41a' : '#ff4d4f',
                  fontSize: 14,
                }}
              >
                {Math.abs(deltaPercent).toFixed(1)}%
              </span>
            </div>
          }
          borderColor={borderColor}
          loading={loading}
        />
      </Col>
    );
  };

  return (
    <Row gutter={[16, 16]}>
      {renderCard('vehicles')}
      {renderCard('devices')}
      {renderCard('maintenances')}
      {renderCard('penalties')}
    </Row>
  );
};

export default DeviceStatsCards;
