import React from 'react';
import { Segmented, DatePicker, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import type { TimeRange } from '@/services/dashboard';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (range: TimeRange, fromDate?: string, toDate?: string) => void;
  showCustomRange?: boolean;
  customFromDate?: string;
  customToDate?: string;
}

const timeRangeOptions = [
  { label: '7 ngày', value: 'WEEK' as TimeRange },
  { label: 'Tháng này', value: 'MONTH' as TimeRange },
  { label: 'Năm nay', value: 'YEAR' as TimeRange },
];

const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({
  value,
  onChange,
  showCustomRange = true,
  customFromDate,
  customToDate,
}) => {
  const handleSegmentChange = (newValue: string | number) => {
    onChange(newValue as TimeRange);
  };

  const handleRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      onChange(
        'CUSTOM',
        dates[0].startOf('day').toISOString(),
        dates[1].endOf('day').toISOString()
      );
    }
  };

  return (
    <Space wrap className="mb-4">
      <Segmented
        options={timeRangeOptions}
        value={value === 'CUSTOM' ? undefined : value}
        onChange={handleSegmentChange}
        className="bg-gray-100"
      />
      {showCustomRange && (
        <RangePicker
          placeholder={['Từ ngày', 'Đến ngày']}
          format="DD/MM/YYYY"
          onChange={handleRangeChange}
          value={
            value === 'CUSTOM' && customFromDate && customToDate
              ? [dayjs(customFromDate), dayjs(customToDate)]
              : undefined
          }
          suffixIcon={<CalendarOutlined />}
          allowClear
        />
      )}
    </Space>
  );
};

export default TimeRangeFilter;
