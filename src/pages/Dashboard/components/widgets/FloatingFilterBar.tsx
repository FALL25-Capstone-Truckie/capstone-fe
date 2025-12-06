import React from 'react';
import { Button, Tooltip } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  HistoryOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { TimeRange } from '@/services/dashboard';

interface FloatingFilterBarProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const filterOptions: { key: TimeRange; label: string; icon: React.ReactNode }[] = [
  { key: 'WEEK', label: '7 ngày', icon: <FieldTimeOutlined /> },
  { key: 'MONTH', label: 'Tháng', icon: <CalendarOutlined /> },
  { key: 'YEAR', label: 'Năm', icon: <HistoryOutlined /> },
];

/**
 * Thanh filter dọc cố định bên phải màn hình
 * Cho phép user đổi filter nhanh mà không cần scroll lên header
 */
const FloatingFilterBar: React.FC<FloatingFilterBarProps> = ({ value, onChange }) => {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-1 bg-gradient-to-b from-blue-600 to-blue-800 p-2 rounded-l-xl shadow-2xl">
      {/* Header icon */}
      <div className="flex items-center justify-center text-white mb-2">
        <Tooltip title="Bộ lọc thời gian" placement="left">
          <SettingOutlined className="text-lg animate-pulse" />
        </Tooltip>
      </div>

      {/* Filter buttons */}
      {filterOptions.map((opt) => {
        const isActive = value === opt.key;
        return (
          <Tooltip key={opt.key} title={opt.label} placement="left">
            <Button
              type={isActive ? 'primary' : 'text'}
              shape="circle"
              size="large"
              icon={opt.icon}
              onClick={() => onChange(opt.key)}
              className={`
                transition-all duration-200
                ${isActive
                  ? 'bg-white text-blue-600 shadow-lg scale-110 border-2 border-blue-300'
                  : 'text-white hover:bg-white/20 hover:scale-105'
                }
              `}
              style={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </Tooltip>
        );
      })}

      {/* Active label */}
      <div className="mt-2 text-center">
        <span className="text-[10px] text-blue-100 font-medium writing-mode-vertical">
          {filterOptions.find((o) => o.key === value)?.label || ''}
        </span>
      </div>
    </div>
  );
};

export default FloatingFilterBar;
