import React from 'react';
import { Card, Statistic, Typography, Skeleton } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface KpiCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  loading?: boolean;
  trend?: number;
  trendLabel?: string;
  valueStyle?: React.CSSProperties;
  borderColor?: string;
  formatter?: (value: number | string) => string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  loading,
  trend,
  trendLabel,
  valueStyle,
  borderColor = 'border-t-blue-500',
  formatter,
}) => {
  const displayValue = formatter ? formatter(value) : value;
  
  const renderTrend = () => {
    if (trend === undefined || trend === null) return null;
    
    const isPositive = trend >= 0;
    const TrendIcon = isPositive ? ArrowUpOutlined : ArrowDownOutlined;
    const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 mt-1 ${trendColor}`}>
        <TrendIcon className="text-xs" />
        <Text className={`text-xs ${trendColor}`}>
          {Math.abs(trend).toFixed(1)}% {trendLabel || 'so với kỳ trước'}
        </Text>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={`shadow-sm border-t-4 ${borderColor}`}>
        <Skeleton active paragraph={{ rows: 1 }} />
      </Card>
    );
  }

  return (
    <Card 
      className={`shadow-sm hover:shadow-md transition-shadow border-t-4 ${borderColor}`}
      styles={{ body: { padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' } }}
      style={{ height: '100%' }}
    >
      <Statistic
        title={<Text className="text-gray-600">{title}</Text>}
        value={displayValue}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{ fontSize: '24px', fontWeight: 600, ...valueStyle }}
      />
      {renderTrend()}
    </Card>
  );
};

export default KpiCard;
