import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { ExclamationCircleOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { PenaltiesSummary } from '../../../../models/AdminDashboard';

interface PenaltiesSummaryCardsProps {
  data?: PenaltiesSummary;
  loading?: boolean;
}

const PenaltiesSummaryCards: React.FC<PenaltiesSummaryCardsProps> = ({ data, loading }) => {
  if (!data) return null;

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return '#ff4d4f'; // red for increase
    if (delta < 0) return '#52c41a'; // green for decrease
    return '#8c8c8c'; // gray for no change
  };

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <ArrowUpOutlined />;
    if (delta < 0) return <ArrowDownOutlined />;
    return null;
  };

  const getDeltaText = (delta: number) => {
    const absDelta = Math.abs(delta);
    if (delta > 0) return `+${absDelta.toFixed(1)}%`;
    if (delta < 0) return `-${absDelta.toFixed(1)}%`;
    return '0%';
  };

  return (
    <Card
      title={
        <span className="text-blue-800">
          <ExclamationCircleOutlined className="mr-2" />
          Thống kê vi phạm giao thông
        </span>
      }
      className="shadow-sm"
      loading={loading}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Statistic
            title="Tổng số vi phạm"
            value={data.totalPenalties}
            valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
            suffix={
              <span style={{ fontSize: '14px', color: getDeltaColor(data.deltaPercent) }}>
                {getDeltaIcon(data.deltaPercent)}
                <span style={{ marginLeft: 4 }}>{getDeltaText(data.deltaPercent)}</span>
                <span style={{ marginLeft: 4, fontSize: '12px' }}>so với kỳ trước</span>
              </span>
            }
          />
        </Col>
      </Row>
    </Card>
  );
};

export default PenaltiesSummaryCards;
