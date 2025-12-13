import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  User,
  Building2,
  Phone,
  Mail,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { CloseOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import userChatService from '@/services/chat/userChatService';
import type { CustomerOverviewResponse } from '@/models/UserChat';
import OrderQuickViewModal from './OrderQuickViewModal';
import { getOrderStatusLabel } from '@/utils/statusHelpers';
import OrderStatusTag from '@/components/common/tags/OrderStatusTag';
import { OrderStatusEnum } from '@/constants/enums';
import { Tag, Spin, Empty, Button } from 'antd';

interface CustomerOverviewModalProps {
  customerId: string;
  onClose: () => void;
  onOrderSelect?: (orderId: string) => void; // Optional callback for embedded mode
  isEmbedded?: boolean; // Flag to indicate embedded mode
  zIndex?: number;
}

const CustomerOverviewModal: React.FC<CustomerOverviewModalProps> = ({ 
  customerId, 
  onClose, 
  onOrderSelect, 
  isEmbedded = false,
  zIndex = 2000
}) => {
  const [data, setData] = useState<CustomerOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderQuickViewId, setOrderQuickViewId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await userChatService.getCustomerOverview(customerId);
        setData(response);
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin khách hàng');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [customerId]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-700';
      case 'BLOCKED':
        return 'bg-red-100 text-red-700';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      case 'PICKING_UP':
      case 'ON_DELIVERED':
      case 'ONGOING_DELIVERED':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESSFUL':
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      case 'PICKING_UP':
      case 'ON_DELIVERED':
      case 'ONGOING_DELIVERED':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCustomerStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'ACTIVE': 'Hoạt động',
      'INACTIVE': 'Không hoạt động',
      'BLOCKED': 'Bị khóa',
      'PENDING': 'Chờ duyệt',
      'VERIFIED': 'Đã xác thực',
      'SUSPENDED': 'Tạm dừng',
    };
    return labels[status?.toUpperCase()] || status;
  };

  // If embedded, only render the content without modal wrapper and header
  if (isEmbedded) {
    return (
      <div className="h-full overflow-hidden flex flex-col">
        {/* Content - no header since UnifiedCustomerOrderModal provides it */}
        <div className="overflow-y-auto flex-1 p-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <AlertTriangle size={40} className="mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : data ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {data.imageUrl ? (
                      <img
                        src={data.imageUrl}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                            parent.appendChild(fallback.firstChild!);
                          }
                        }}
                      />
                    ) : (
                      <User size={32} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{data.fullName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{data.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{data.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(data.customerStatus)}`}>
                        {getCustomerStatusLabel(data.customerStatus)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Thành viên từ {formatDate(data.memberSince)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                {data.companyName && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <Building2 size={16} className="text-blue-600" />
                      Thông tin doanh nghiệp
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Công ty:</span>
                        <p className="font-medium">{data.companyName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Người đại diện:</span>
                        <p className="font-medium">{data.representativeName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">SĐT đại diện:</span>
                        <p className="font-medium">{data.representativePhone || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Mã số thuế:</span>
                        <p className="font-medium">{data.businessLicenseNumber || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Địa chỉ:</span>
                        <p className="font-medium">{data.businessAddress || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <Package size={20} className="mx-auto text-blue-600 mb-1" />
                    <div className="text-2xl font-bold text-blue-600">{data.totalOrders}</div>
                    <div className="text-xs text-gray-600">Tổng đơn hàng</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <CheckCircle size={20} className="mx-auto text-green-600 mb-1" />
                    <div className="text-2xl font-bold text-green-600">{data.successfulOrders}</div>
                    <div className="text-xs text-gray-600">Thành công ({data.successRate}%)</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <XCircle size={20} className="mx-auto text-red-600 mb-1" />
                    <div className="text-2xl font-bold text-red-600">{data.cancelledOrders}</div>
                    <div className="text-xs text-gray-600">Đã hủy ({data.cancelRate}%)</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <AlertTriangle size={20} className="mx-auto text-orange-600 mb-1" />
                    <div className="text-2xl font-bold text-orange-600">{data.issuesCount}</div>
                    <div className="text-xs text-gray-600">Vấn đề</div>
                  </div>
                </div>

                {/* Active Orders */}
                {data.activeOrders && data.activeOrders.length > 0 && (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-3 text-orange-600">
                      <Package size={16} />
                      Đơn hàng đang xử lý ({data.activeOrders.length})
                    </h4>
                    <div className="space-y-2">
                      {data.activeOrders.map((order) => (
                        <div
                          key={order.orderId}
                          onClick={() => isEmbedded && onOrderSelect ? onOrderSelect(order.orderId) : setOrderQuickViewId(order.orderId)}
                          className="flex items-center justify-between p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100"
                        >
                          <div>
                            <span className="font-medium text-orange-700">{order.orderCode}</span>
                            <span className="text-sm text-gray-600 ml-2">→ {order.receiverName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <OrderStatusTag status={order.status as OrderStatusEnum} size="small" />
                            <ChevronRight size={16} className="text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Orders */}
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Calendar size={16} className="text-blue-600" />
                    Đơn hàng gần đây
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {data.recentOrders.length === 0 ? (
                      <p className="text-gray-500 text-sm">Chưa có đơn hàng nào</p>
                    ) : (
                      data.recentOrders.map((order) => (
                        <div
                          key={order.orderId}
                          onClick={() => isEmbedded && onOrderSelect ? onOrderSelect(order.orderId) : setOrderQuickViewId(order.orderId)}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                            order.isActive ? 'bg-blue-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{order.orderCode}</span>
                              {order.isActive && (
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {order.receiverName} • {order.totalQuantity} kiện
                            </p>
                            <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <OrderStatusTag status={order.status as OrderStatusEnum} size="small" />
                            <ChevronRight size={16} className="text-gray-400" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
    );
  }

  // Normal modal mode
  return createPortal(
    <>
      {/* Backdrop with 10% margin (5% on each side) */}
      <div className="fixed inset-0 bg-black/50" style={{ zIndex }} onClick={onClose} />
      <div className="fixed inset-[5%] flex rounded-lg overflow-hidden shadow-2xl" style={{ zIndex }}>
        {/* Customer Overview Panel - 40% width on left */}
        <div className="bg-white shadow-xl w-[40%] h-full overflow-hidden flex flex-col">
          {/* Header - height matched with quick view modals */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center justify-between flex-shrink-0 min-h-[60px]">
            <div className="flex items-center gap-2">
              <User size={18} />
              <div>
                <h2 className="text-base font-semibold">Thông tin khách hàng</h2>
                {data && <p className="text-blue-100 text-xs">{data.fullName}</p>}
              </div>
            </div>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              className="text-white hover:bg-blue-500"
              size="small"
            />
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <AlertTriangle size={40} className="mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : data ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {data.imageUrl ? (
                      <img
                        src={data.imageUrl}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                            parent.appendChild(fallback.firstChild!);
                          }
                        }}
                      />
                    ) : (
                      <User size={32} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{data.fullName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{data.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{data.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(data.customerStatus)}`}>
                        {getCustomerStatusLabel(data.customerStatus)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Thành viên từ {formatDate(data.memberSince)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                {data.companyName && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <Building2 size={16} className="text-blue-600" />
                      Thông tin doanh nghiệp
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Công ty:</span>
                        <p className="font-medium">{data.companyName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Người đại diện:</span>
                        <p className="font-medium">{data.representativeName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">SĐT đại diện:</span>
                        <p className="font-medium">{data.representativePhone || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Mã số thuế:</span>
                        <p className="font-medium">{data.businessLicenseNumber || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Địa chỉ:</span>
                        <p className="font-medium">{data.businessAddress || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <Package size={20} className="mx-auto text-blue-600 mb-1" />
                    <div className="text-2xl font-bold text-blue-600">{data.totalOrders}</div>
                    <div className="text-xs text-gray-600">Tổng đơn hàng</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <CheckCircle size={20} className="mx-auto text-green-600 mb-1" />
                    <div className="text-2xl font-bold text-green-600">{data.successfulOrders}</div>
                    <div className="text-xs text-gray-600">Thành công ({data.successRate}%)</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <XCircle size={20} className="mx-auto text-red-600 mb-1" />
                    <div className="text-2xl font-bold text-red-600">{data.cancelledOrders}</div>
                    <div className="text-xs text-gray-600">Đã hủy ({data.cancelRate}%)</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <AlertTriangle size={20} className="mx-auto text-orange-600 mb-1" />
                    <div className="text-2xl font-bold text-orange-600">{data.issuesCount}</div>
                    <div className="text-xs text-gray-600">Vấn đề</div>
                  </div>
                </div>

                {/* Active Orders */}
                {data.activeOrders && data.activeOrders.length > 0 && (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-3 text-orange-600">
                      <Package size={16} />
                      Đơn hàng đang xử lý ({data.activeOrders.length})
                    </h4>
                    <div className="space-y-2">
                      {data.activeOrders.map((order) => (
                        <div
                          key={order.orderId}
                          onClick={() => isEmbedded && onOrderSelect ? onOrderSelect(order.orderId) : setOrderQuickViewId(order.orderId)}
                          className="flex items-center justify-between p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100"
                        >
                          <div>
                            <span className="font-medium text-orange-700">{order.orderCode}</span>
                            <span className="text-sm text-gray-600 ml-2">→ {order.receiverName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <OrderStatusTag status={order.status as OrderStatusEnum} size="small" />
                            <ChevronRight size={16} className="text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Orders */}
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Calendar size={16} className="text-blue-600" />
                    Đơn hàng gần đây
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {data.recentOrders.length === 0 ? (
                      <p className="text-gray-500 text-sm">Chưa có đơn hàng nào</p>
                    ) : (
                      data.recentOrders.map((order) => (
                        <div
                          key={order.orderId}
                          onClick={() => isEmbedded && onOrderSelect ? onOrderSelect(order.orderId) : setOrderQuickViewId(order.orderId)}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                            order.isActive ? 'bg-blue-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{order.orderCode}</span>
                              {order.isActive && (
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {order.receiverName} • {order.totalQuantity} kiện
                            </p>
                            <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <OrderStatusTag status={order.status as OrderStatusEnum} size="small" />
                            <ChevronRight size={16} className="text-gray-400" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Order Quick View Panel - 60% width on right when order is selected */}
        {orderQuickViewId ? (
          <OrderQuickViewModal
            orderId={orderQuickViewId}
            onClose={() => setOrderQuickViewId(null)}
            onCloseAll={onClose}
            isSideBySide={true}
          />
        ) : (
          <div className="flex-1 bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Package size={48} className="mx-auto mb-2 opacity-50" />
              <p>Chọn một đơn hàng để xem chi tiết</p>
            </div>
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

export default CustomerOverviewModal;
