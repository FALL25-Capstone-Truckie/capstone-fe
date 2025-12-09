import React from 'react';
import { TrendLineChart } from '../../../Dashboard/components/charts';
import type { PenaltiesTimeSeries } from '../../../../models/AdminDashboard';
import dayjs from 'dayjs';

interface PenaltiesTimeSeriesChartProps {
  data?: PenaltiesTimeSeries;
  loading?: boolean;
}

const PenaltiesTimeSeriesChart: React.FC<PenaltiesTimeSeriesChartProps> = ({ data, loading }) => {
  if (!data) return null;

  // Format data for the chart - convert to TrendLineChart format
  const chartData = data.points.map(point => ({
    date: point.date,
    value: point.count,
    label: dayjs(point.date).format('DD/MM'),
  }));

  const getChartTitle = () => {
    switch (data.period) {
      case 'week':
        return 'Biểu đồ vi phạm 7 ngày qua';
      case 'month':
        return 'Biểu đồ vi phạm 30 ngày qua';
      case 'year':
        return 'Biểu đồ vi phạm 12 tháng qua';
      default:
        return 'Biểu đồ vi phạm theo thời gian';
    }
  };

  return (
    <TrendLineChart
      data={chartData}
      title={getChartTitle()}
      loading={loading}
      height={300}
      yAxisLabel="Số vi phạm"
      smooth={true}
      color="#1890ff"
      showArea={false}
      isCurrency={false}
    />
  );
};

export default PenaltiesTimeSeriesChart;
