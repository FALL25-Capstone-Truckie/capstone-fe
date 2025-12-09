import React from 'react';
import { Card, Spin } from 'antd';
import { Line } from '@ant-design/plots';
import type { RegistrationTimeSeries, PeriodType } from '../../../../models/AdminDashboard';

interface RegistrationChartProps {
  data: RegistrationTimeSeries | null;
  loading: boolean;
  title: string;
  color?: string;
  period: PeriodType;
}

const RegistrationChart: React.FC<RegistrationChartProps> = ({
  data,
  loading,
  title,
  color = '#1890ff',
  period,
}) => {
  const chartData = data?.points.map((point) => {
    // Use the label directly since backend already formats appropriately
    // WEEK: "dd/MM", MONTH: "Tuần X", YEAR: "MM/yyyy"
    return {
      date: point.date,
      count: point.count,
    };
  }) || [];

  const config = {
    data: chartData,
    xField: 'date',
    yField: 'count',
    smooth: true,
    color: color,
    point: {
      size: 4,
      shape: 'circle',
    },
    tooltip: {
      showTitle: true,
      title: (datum: any) => datum.date,
      customContent: (title: string, items: any[]) => {
        if (!items || items.length === 0) return null;
        const value = items[0]?.data?.count || 0;
        return (
          <div style={{ padding: '8px 12px' }}>
            <div style={{ marginBottom: 4, fontWeight: 500 }}>{title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: color,
                display: 'inline-block'
              }}></span>
              <span>Số lượng đăng ký: <strong>{value}</strong></span>
            </div>
          </div>
        );
      },
    },
    interactions: [
      {
        type: 'marker-active',
      },
    ],
  };

  return (
    <Card title={title} bordered={false} className="shadow-sm">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin />
        </div>
      ) : (
        <div style={{ height: 300 }}>
          <Line {...config} />
        </div>
      )}
    </Card>
  );
};

export default RegistrationChart;
