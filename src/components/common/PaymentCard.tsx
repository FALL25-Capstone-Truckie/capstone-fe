import React from 'react';
import { Card, Tag, Avatar } from 'antd';
import { CreditCard, Wallet, Building, Calendar, DollarSign, Package } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { TransactionStatusTag } from './tags';
import { TransactionEnum } from '@/constants/enums';

dayjs.extend(utc);
dayjs.extend(timezone);

interface PaymentCardProps {
  transaction: {
    id: string;
    paymentProvider: string;
    gatewayOrderCode: string;
    amount: number;
    currencyCode: string;
    status: string;
    paymentDate: string;
    transactionType?: string;
  };
  compact?: boolean; // For modal vs full page
}

const PaymentCard: React.FC<PaymentCardProps> = ({ transaction, compact = false }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa có thông tin";
    return dayjs(dateString)
      .tz("Asia/Ho_Chi_Minh")
      .format(compact ? "DD/MM/YYYY" : "DD/MM/YYYY HH:mm");
  };

  const getTransactionTypeName = (type?: string) => {
    switch (type) {
      case "DEPOSIT":
        return "Thanh toán cọc";
      case "FULL_PAYMENT":
        return "Thanh toán toàn bộ";
      case "RETURN_SHIPPING":
        return "Cước phí trả hàng";
      default:
        return "Chưa xác định";
    }
  };

  const getProviderIcon = (provider?: string) => {
    if (!provider) return <CreditCard size={20} />;
    
    switch (provider.toLowerCase()) {
      case 'vnpay':
        return <Wallet size={20} className="text-red-500" />;
      case 'momo':
        return <Wallet size={20} className="text-pink-500" />;
      case 'zalopay':
        return <Wallet size={20} className="text-blue-500" />;
      case 'bank_transfer':
        return <Building size={20} className="text-green-500" />;
      default:
        return <CreditCard size={20} className="text-gray-500" />;
    }
  };

  const getTransactionTypeColor = (type?: string) => {
    switch (type) {
      case "DEPOSIT":
        return "bg-orange-50 border-orange-200";
      case "FULL_PAYMENT":
        return "bg-green-50 border-green-200";
      case "RETURN_SHIPPING":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card
      className={`${compact ? 'shadow-sm' : 'shadow-md'} rounded-xl border-l-4 ${getTransactionTypeColor(transaction.transactionType)} hover:shadow-lg transition-shadow`}
      bodyStyle={{ padding: compact ? '12px' : '16px' }}
    >
      <div className="flex items-start justify-between">
        {/* Left side - Icon and main info */}
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0">
            <Avatar
              icon={getProviderIcon(transaction.paymentProvider)}
              className="bg-white border border-gray-200"
              size={compact ? 40 : 48}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Transaction Type and Order Code */}
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
                {getTransactionTypeName(transaction.transactionType)}
              </span>
              <Tag 
                color="blue" 
                className="ml-2"
              >
                {transaction.gatewayOrderCode || "N/A"}
              </Tag>
            </div>

            {/* Provider and Date */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                {getProviderIcon(transaction.paymentProvider)}
                <span>{transaction.paymentProvider || "Chưa có thông tin"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{formatDate(transaction.paymentDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Amount and Status */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Amount */}
          <div className="text-right">
            <div className={`font-bold ${compact ? 'text-lg' : 'text-xl'} text-green-600`}>
              {transaction.amount !== null && transaction.amount !== undefined
                ? `${transaction.amount.toLocaleString("vi-VN")}`
                : "0"}
            </div>
            <div className="text-xs text-gray-500">
              {transaction.currencyCode || "VND"}
            </div>
          </div>

          {/* Status */}
          <div>
            {transaction.status ? (
              <TransactionStatusTag status={transaction.status as TransactionEnum} />
            ) : (
              <Tag color="default">
                Chưa có thông tin
              </Tag>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PaymentCard;
