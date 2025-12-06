import React, { useState } from 'react';
import { Card, Tag, Button, Collapse, Descriptions } from 'antd';
import { FileText, Calendar, DollarSign, User, ChevronDown, ChevronUp } from 'lucide-react';
import { ContractStatusTag } from './tags';
import { ContractStatusEnum } from '@/constants/enums';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface CompactContractCardProps {
  contract?: {
    id: string;
    contractName: string;
    effectiveDate: string;
    expirationDate: string;
    totalValue: number;
    adjustedValue: number;
    description: string;
    attachFileUrl: string;
    status: string;
    staffName: string;
  };
  orderId?: string;
  depositAmount?: number;
  onRefetch?: () => void;
}

const CompactContractCard: React.FC<CompactContractCardProps> = ({
  contract,
  orderId,
  depositAmount,
  onRefetch,
}) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa có thông tin";
    return dayjs(dateString)
      .tz("Asia/Ho_Chi_Minh")
      .format("DD/MM/YYYY");
  };

  const formatCurrency = (amount?: number) => {
    if (amount === null || amount === undefined) return "0";
    return `${amount.toLocaleString("vi-VN")} VND`;
  };

  if (!contract) {
    return (
      <Card className="shadow-sm rounded-xl border-l-4 border-l-gray-300">
        <div className="text-center py-4 text-gray-500">
          <FileText size={24} className="mx-auto mb-2 opacity-50" />
          <p>Chưa có hợp đồng</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="shadow-sm rounded-xl border-l-4 border-l-green-500 hover:shadow-md transition-shadow"
      bodyStyle={{ padding: '12px' }}
    >
      {/* Header - Compact view */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText size={18} className="text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">
              {contract.contractName}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <ContractStatusTag status={contract.status as ContractStatusEnum} size="small" />
              <span className="text-xs text-gray-500">
                {formatDate(contract.effectiveDate)} - {formatDate(contract.expirationDate)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="text-right">
            <div className="font-bold text-green-600 text-sm">
              {formatCurrency(
                contract.adjustedValue && contract.adjustedValue > 0
                  ? contract.adjustedValue
                  : contract.totalValue
              )}
            </div>
            {depositAmount && (
              <div className="text-xs text-gray-500">
                Đặt cọc: {formatCurrency(depositAmount)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expand/Collapse button */}
      <Button
        type="text"
        size="small"
        onClick={() => setExpanded(!expanded)}
        className="w-full justify-between items-center h-6 text-xs"
        icon={expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      >
        {expanded ? 'Thu gọn' : 'Xem chi tiết'}
      </Button>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Descriptions size="small" column={1} className="compact-descriptions">
            <Descriptions.Item label="Nhân viên phụ trách">
              <div className="flex items-center gap-1">
                <User size={12} />
                {contract.staffName || "Chưa có thông tin"}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hiệu lực">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(contract.effectiveDate)}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hết hạn">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(contract.expirationDate)}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Giá trị gốc">
              <div className="flex items-center gap-1 text-green-600">
                {formatCurrency(contract.totalValue)}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Giá trị điều chỉnh">
              <div className="flex items-center gap-1 text-green-600 font-bold">
                {formatCurrency(contract.adjustedValue)}
              </div>
            </Descriptions.Item>
            {contract.description && (
              <Descriptions.Item label="Mô tả">
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {contract.description}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>
      )}
    </Card>
  );
};

export default CompactContractCard;
