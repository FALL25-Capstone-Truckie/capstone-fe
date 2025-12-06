import React from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
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
        return <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
      case 'staff':
        return <TeamOutlined style={{ fontSize: 24, color: '#52c41a' }} />;
      case 'drivers':
        return <CarOutlined style={{ fontSize: 24, color: '#faad14' }} />;
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

    return (
      <Col xs={24} sm={12} lg={8} key={role}>
        <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Spin />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>{getIcon(role)}</div>
                <div className="text-right">
                  <div className="text-gray-500 text-sm">{getTitle(role)}</div>
                  <div className="text-2xl font-bold">{roleData?.count || 0}</div>
                </div>
              </div>
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
                <span className="text-gray-500 text-sm ml-2">so với kỳ trước</span>
              </div>
            </div>
          )}
        </Card>
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
