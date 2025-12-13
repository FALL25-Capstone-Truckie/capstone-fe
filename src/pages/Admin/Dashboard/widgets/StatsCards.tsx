import React from 'react';
import { Card, Row, Col, Spin } from 'antd';
import StatCard from '../../../../components/common/StatCard';
import {
  UserOutlined,
  TeamOutlined,
  CarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import type { UserTotals } from '../../../../models/AdminDashboard';

interface StatsCardsProps {
  data: UserTotals | null;
  loading: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ data, loading }) => {
  const getIcon = (role: 'customers' | 'staff' | 'drivers') => {
    switch (role) {
      case 'customers':
        return <UserOutlined />;
      case 'staff':
        return <TeamOutlined />;
      case 'drivers':
        return <CarOutlined />;
    }
  };

  const getTitle = (role: 'customers' | 'staff' | 'drivers') => {
    switch (role) {
      case 'customers':
        return 'Tổng số khách hàng';
      case 'staff':
        return 'Tổng số nhân viên';
      case 'drivers':
        return 'Tổng số tài xế';
    }
  };

  const renderCard = (role: 'customers' | 'staff' | 'drivers') => {
    const roleData = data?.[role];
    const deltaPercent = roleData?.deltaPercent || 0;
    const isPositive = deltaPercent >= 0;
    const borderColor = role === 'customers' ? '#1890ff' : role === 'staff' ? '#52c41a' : '#faad14';

    return (
      <Col xs={24} sm={12} lg={8} key={role}>
        <StatCard
          title={getTitle(role)}
          value={roleData?.count || 0}
          prefix={getIcon(role)}
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
      {renderCard('customers')}
      {renderCard('staff')}
      {renderCard('drivers')}
    </Row>
  );
};

export default StatsCards;
