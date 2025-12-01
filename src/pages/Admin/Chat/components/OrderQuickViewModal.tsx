import React, { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  User,
  FileText,
  Truck,
  AlertTriangle,
  ExternalLink,
  Route,
  Shield,
  Fuel,
  Camera,
  Info,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import orderService from '@/services/order/orderService';
import type { StaffOrderDetailResponse } from '@/services/order/types';
import type { StaffVehicleAssignment } from '@/models/Order';
import { Tabs, Empty, Spin, Card, Descriptions, Tag, Badge, Button, Collapse, Image, Row, Col } from 'antd';
import StaffContractSection from '../../Order/components/StaffContractSection';
import TransactionSection from '../../../Orders/components/CustomerOrderDetail/TransactionSection';
import InsuranceInfo from '@/components/common/InsuranceInfo';
import CompactContractCard from '@/components/common/CompactContractCard';
import PaymentCard from '@/components/common/PaymentCard';
import {
  CarOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BoxPlotOutlined,
  ToolOutlined,
  CameraOutlined,
  FireOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  CreditCardOutlined,
  TagOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import OrderStatusTag from '@/components/common/tags/OrderStatusTag';
import ContractStatusTag from '@/components/common/tags/ContractStatusTag';
import { TransactionStatusTag } from '@/components/common/tags';
import {
  OrderStatusEnum,
  ContractStatusEnum,
  TransactionEnum,
  VehicleAssignmentStatusLabels,
  getSealStatusLabel,
  getSealStatusColor,
  getIssueStatusLabel,
  getIssueStatusColor,
} from '@/constants/enums';
import RouteMapSection from '@/pages/Admin/Order/components/StaffOrderDetail/RouteMapSection';

dayjs.extend(utc);
dayjs.extend(timezone);

interface OrderQuickViewModalProps {
  orderId: string;
  onClose: () => void;
  onCloseAll?: () => void; // Callback to close all modals
  isSideBySide?: boolean;
}

const OrderQuickViewModal: React.FC<OrderQuickViewModalProps> = ({ 
  orderId, 
  onClose, 
  onCloseAll,
  isSideBySide = false 
}) => {
  const [orderData, setOrderData] = useState<StaffOrderDetailResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVehicleTab, setActiveVehicleTab] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await orderService.getOrderForStaffByOrderId(orderId);
        setOrderData(data);
        // Set first vehicle assignment as active if exists
        if (data?.order?.vehicleAssignments?.length > 0) {
          setActiveVehicleTab(data.order.vehicleAssignments[0].id);
        }
      } catch (err: any) {
        console.error('Error loading order data:', err);
        setError(err.message || 'Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [orderId]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    return dayjs(dateStr).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm');
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Helper function for vehicle assignment status
  const getVehicleAssignmentStatusLabel = (status: string) => {
    return VehicleAssignmentStatusLabels[status as keyof typeof VehicleAssignmentStatusLabels] || status;
  };

  const getVehicleAssignmentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ACTIVE': 'processing',
      'INACTIVE': 'default',
      'COMPLETED': 'success',
      'COMPLETE': 'success',
      'UNASSIGNED': 'default',
      'ASSIGNED_TO_DRIVER': 'processing',
      'ASSIGNED_TO_ROUTE': 'processing',
      'RESERVED': 'purple',
      'IN_TRANSIT': 'processing',
      'ON_STANDBY': 'warning',
      'MAINTENANCE_HOLD': 'orange',
      'DECOMMISSIONED': 'error',
      'ASSIGNED': 'processing',
      'AVAILABLE': 'success',
      'IN_TRIP': 'processing',
    };
    return colors[status?.toUpperCase()] || 'default';
  };

  // Helper function for journey status
  const getJourneyStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'INITIAL': 'Khởi tạo',
      'ACTIVE': 'Đang hoạt động',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
      'IN_PROGRESS': 'Đang tiến hành',
      'DELAYED': 'Bị trễ',
    };
    return labels[status] || status;
  };

  const getJourneyStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'INITIAL': 'default',
      'ACTIVE': 'processing',
      'COMPLETED': 'success',
      'CANCELLED': 'error',
      'IN_PROGRESS': 'processing',
      'DELAYED': 'warning',
    };
    return colors[status] || 'default';
  };

  // Helper function for transaction type
  const getTransactionTypeName = (type?: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'Thanh toán cọc';
      case 'FULL_PAYMENT':
        return 'Thanh toán toàn bộ';
      case 'RETURN_SHIPPING':
        return 'Cước phí trả hàng';
      default:
        return type || 'Chưa xác định';
    }
  };

  const order = orderData?.order;
  const contract = orderData?.contract;

  // Handle view detail click - close all modals and navigate
  const handleViewDetail = () => {
    if (onCloseAll) {
      onCloseAll();
    } else {
      onClose();
    }
    navigate(`/staff/orders/${orderId}`);
  };

  // Tab items for order detail
  const getTabItems = () => {
    if (!order) return [];
    
    const items = [
      {
        key: 'basic',
        label: 'Thông tin cơ bản',
        children: renderBasicInfo(),
      },
      {
        key: 'details',
        label: 'Chi tiết kiện hàng',
        children: renderOrderDetails(),
      },
      {
        key: 'vehicle',
        label: 'Vận chuyển',
        children: renderVehicleInfo(),
      },
      {
        key: 'contract',
        label: 'Hợp đồng & Thanh toán',
        children: renderContractTab(),
      },
    ];
    
    return items;
  };

  // Render basic info tab
  const renderBasicInfo = () => {
    if (!order) return null;
    return (
      <div className="space-y-4">
        {/* Customer & Receiver Info */}
        <div className="grid grid-cols-2 gap-3">
          <Card size="small" className="bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 mb-2 text-blue-600 font-medium">
              <UserOutlined />
              Người gửi
            </div>
            <Descriptions column={1} size="small" className="text-sm">
              <Descriptions.Item label="Tên">{order.senderRepresentativeName || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="SĐT">{order.senderRepresentativePhone || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Công ty">{order.senderCompanyName || 'N/A'}</Descriptions.Item>
            </Descriptions>
          </Card>
          <Card size="small" className="bg-green-50 border-green-200">
            <div className="flex items-center gap-2 mb-2 text-green-600 font-medium">
              <UserOutlined />
              Người nhận
            </div>
            <Descriptions column={1} size="small" className="text-sm">
              <Descriptions.Item label="Tên">{order.receiverName}</Descriptions.Item>
              <Descriptions.Item label="SĐT">{order.receiverPhone}</Descriptions.Item>
              {order.receiverIdentity && (
                <Descriptions.Item label="CMND">{order.receiverIdentity}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </div>

        {/* Addresses */}
        <Card size="small">
          <div className="flex items-center gap-2 mb-2 text-red-500 font-medium">
            <EnvironmentOutlined />
            Địa chỉ
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Tag color="blue">Lấy hàng</Tag>
              <span>{order.pickupAddress || 'N/A'}</span>
            </div>
            <div className="flex items-start gap-2">
              <Tag color="green">Giao hàng</Tag>
              <span>{order.deliveryAddress || 'N/A'}</span>
            </div>
          </div>
        </Card>

        {/* Package Summary */}
        <Card size="small">
          <div className="flex items-center gap-2 mb-2 text-orange-500 font-medium">
            <Package size={16} />
            Thông tin hàng hóa
          </div>
          <Descriptions column={3} size="small" className="text-sm">
            <Descriptions.Item label="Loại hàng">{order.categoryDescription || order.categoryName || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Số kiện">{order.totalQuantity}</Descriptions.Item>
            <Descriptions.Item label="Bảo hiểm">
              <Tag color={order.hasInsurance ? 'green' : 'default'}>{order.hasInsurance ? 'Có' : 'Không'}</Tag>
            </Descriptions.Item>
          </Descriptions>
          {order.packageDescription && (
            <p className="text-sm mt-2 text-gray-600">
              <strong>Mô tả:</strong> {order.packageDescription}
            </p>
          )}
          <div className="mt-3 pt-2 border-t space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Giá trị khai báo:</span>
              <span className="font-medium text-orange-600">{formatCurrency(order.totalDeclaredValue)}</span>
            </div>
            {contract?.totalValue && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tổng tiền đơn hàng:</span>
                <span className="font-bold text-green-600">{formatCurrency(contract.totalValue)}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card size="small" className="bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-2 mb-2 text-yellow-700 font-medium">
              <FileTextOutlined />
              Ghi chú
            </div>
            <p className="text-sm">{order.notes}</p>
          </Card>
        )}
      </div>
    );
  };

  // Render order details tab
  const renderOrderDetails = () => {
    if (!order?.orderDetails || order.orderDetails.length === 0) {
      return <Empty description="Không có chi tiết kiện hàng" />;
    }

    return (
      <div className="space-y-3">
        {order.orderDetails.map((detail, index) => (
          <Card key={detail.id} size="small" className="border-purple-200 bg-purple-50/50">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs text-gray-500">Mã theo dõi</span>
                <p className="font-bold text-purple-700">{detail.trackingCode || `Kiện #${index + 1}`}</p>
              </div>
              <OrderStatusTag status={detail.status as OrderStatusEnum} size="small" />
            </div>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Trọng lượng">
                <span className="font-medium">{detail.weightBaseUnit} {detail.unit}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {detail.orderSize ? (
                  <span>{detail.description}</span>
                ) : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ))}
      </div>
    );
  };

  // Render vehicle info tab - similar to staff order detail page
  const renderVehicleInfo = () => {
    if (!order?.vehicleAssignments || order.vehicleAssignments.length === 0) {
      return (
        <Empty 
          image={<CarOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
          description="Chưa có phân công vận chuyển" 
        />
      );
    }

    return (
      <div className="space-y-4">
        {/* Trip selector tabs */}
        <Tabs
          activeKey={activeVehicleTab}
          onChange={setActiveVehicleTab}
          size="small"
          type="card"
          items={order.vehicleAssignments.map((va, idx) => ({
            key: va.id,
            label: (
              <span className="flex items-center gap-1">
                <CarOutlined />
                Chuyến xe #{idx + 1}
              </span>
            ),
          }))}
        />

        {/* Active trip details */}
        {order.vehicleAssignments
          .filter(va => va.id === activeVehicleTab)
          .map(va => renderTripDetails(va))}
      </div>
    );
  };

  // Render trip details for a vehicle assignment
  const renderTripDetails = (va: StaffVehicleAssignment) => {
    const vaData = va as any; // Cast to any for accessing additional properties
    
    return (
      <div key={va.id} className="space-y-4">
        {/* Vehicle Info */}
        <Card size="small" className="border-blue-200 bg-blue-50/50">
          <div className="p-2">
            {/* Vehicle header */}
            <div className="flex items-center mb-3">
              <CarOutlined className="text-xl text-blue-500 mr-3" />
              <span className="text-lg font-medium">
                {va.vehicle?.licensePlateNumber || 'Chưa có thông tin'}
              </span>
              <Tag className="ml-3" color={getVehicleAssignmentStatusColor(va.status || '')}>
                {getVehicleAssignmentStatusLabel(va.status || '')}
              </Tag>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center">
                <TagOutlined className="mr-2 text-gray-500" />
                <span className="font-medium mr-1">Nhà sản xuất:</span>
                <span>{va.vehicle?.manufacturer || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <CarOutlined className="mr-2 text-gray-500" />
                <span className="font-medium mr-1">Mẫu xe:</span>
                <span>{va.vehicle?.model || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <TagOutlined className="mr-2 text-gray-500" />
                <span className="font-medium mr-1">Loại xe:</span>
                <span>{va.vehicle?.vehicleTypeDescription || 'N/A'}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Drivers */}
        <div className="grid grid-cols-2 gap-3">
          <Card size="small" className="bg-green-50 border-green-200">
            <div className="flex items-center mb-2">
              <UserOutlined className="text-green-500 mr-2" />
              <span className="font-medium">Tài xế chính</span>
            </div>
            {va.primaryDriver ? (
              <div className="ml-6 text-sm space-y-1">
                <div className="flex items-center">
                  <UserOutlined className="mr-2 text-gray-500" />
                  <span>{va.primaryDriver.fullName}</span>
                </div>
                <div className="flex items-center">
                  <PhoneOutlined className="mr-2 text-gray-500" />
                  <span>{va.primaryDriver.phoneNumber}</span>
                </div>
              </div>
            ) : (
              <div className="ml-6 text-gray-500 text-sm">Chưa có thông tin</div>
            )}
          </Card>
          
          <Card size="small" className="bg-blue-50 border-blue-200">
            <div className="flex items-center mb-2">
              <UserOutlined className="text-blue-500 mr-2" />
              <span className="font-medium">Tài xế phụ</span>
            </div>
            {va.secondaryDriver ? (
              <div className="ml-6 text-sm space-y-1">
                <div className="flex items-center">
                  <UserOutlined className="mr-2 text-gray-500" />
                  <span>{va.secondaryDriver.fullName}</span>
                </div>
                <div className="flex items-center">
                  <PhoneOutlined className="mr-2 text-gray-500" />
                  <span>{va.secondaryDriver.phoneNumber}</span>
                </div>
              </div>
            ) : (
              <div className="ml-6 text-gray-500 text-sm">Chưa có thông tin</div>
            )}
          </Card>
        </div>

        {/* Trip Detail Sections */}
        <Card size="small" className="bg-white border-gray-200">
          <div className="text-sm font-semibold text-blue-700 mb-3 flex items-center">
            <BoxPlotOutlined className="mr-2" />
            Chi tiết chuyến xe
          </div>
          <Tabs
            size="small"
            type="card"
            items={[
              {
                key: 'packages',
                label: <span><BoxPlotOutlined className="mr-1" />Kiện hàng</span>,
                children: renderTripPackages(va),
              },
              {
                key: 'journey',
                label: <span><EnvironmentOutlined className="mr-1" />Lộ trình</span>,
                children: renderJourneyWithMap(va),
              },
              {
                key: 'issues',
                label: (
                  <span>
                    <ToolOutlined className="mr-1" />Sự cố
                    {vaData.issues && vaData.issues.length > 0 && (
                      <Tag color="red" className="ml-1">{vaData.issues.length}</Tag>
                    )}
                  </span>
                ),
                children: renderIssues(va),
              },
              {
                key: 'seals',
                label: <span><FileTextOutlined className="mr-1" />Niêm phong</span>,
                children: renderSeals(va),
              },
              {
                key: 'penalties',
                label: <span><WarningOutlined className="mr-1" />Vi phạm</span>,
                children: renderPenalties(va),
              },
              {
                key: 'fuel',
                label: <span><FireOutlined className="mr-1" />Nhiên liệu</span>,
                children: renderFuelConsumption(va),
              },
              {
                key: 'photos',
                label: <span><CameraOutlined className="mr-1" />Hình ảnh</span>,
                children: renderCompletionPhotos(va),
              },
            ]}
          />
        </Card>
      </div>
    );
  };

  // Render packages for a trip
  const renderTripPackages = (va: StaffVehicleAssignment) => {
    const tripPackages = order?.orderDetails?.filter(od => od.vehicleAssignmentId === va.id) || [];
    if (tripPackages.length === 0) {
      return <Empty description="Không có kiện hàng trong chuyến này" />;
    }
    return (
      <div className="space-y-2">
        {tripPackages.map((pkg, idx) => (
          <Card key={pkg.id} size="small" className="bg-purple-50/50">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-purple-700">{pkg.trackingCode}</p>
                <p className="text-sm text-gray-500">{pkg.weightBaseUnit} {pkg.unit}</p>
                {pkg.description && (
                  <p className="text-sm text-gray-600 mt-1 italic">
                    Mô tả: {pkg.description}
                  </p>
                )}
              </div>
              <OrderStatusTag status={pkg.status as OrderStatusEnum} size="small" />
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Render journey with map
  const renderJourneyWithMap = (va: StaffVehicleAssignment) => {
    const vaData = va as any;
    if (!vaData.journeyHistories || vaData.journeyHistories.length === 0) {
      return <Empty description="Chưa có lộ trình" />;
    }

    // Find ACTIVE journey
    const activeJourneys = vaData.journeyHistories
      .filter((j: any) => j.status === 'ACTIVE')
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (activeJourneys.length === 0) {
      // Show all journeys if no active
      return (
        <div className="space-y-2">
          {vaData.journeyHistories.map((journey: any) => (
            <Card key={journey.id} size="small" className="bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="font-medium">{journey.journeyName || `Hành trình ${journey.journeyType}`}</span>
                <Tag color={getJourneyStatusColor(journey.status)}>
                  {getJourneyStatusLabel(journey.status)}
                </Tag>
              </div>
            </Card>
          ))}
        </div>
      );
    }

    const activeJourney = activeJourneys[0];

    // Check if journey has segments for map
    if (!activeJourney.journeySegments || activeJourney.journeySegments.length === 0) {
      return (
        <div className="space-y-2">
          <Card size="small" className="bg-blue-50 border-blue-200">
            <div className="flex justify-between items-center">
              <span className="font-medium">{activeJourney.journeyName || 'Hành trình đang hoạt động'}</span>
              <Tag color="processing">{getJourneyStatusLabel(activeJourney.status)}</Tag>
            </div>
          </Card>
          <Empty description="Không có thông tin chi tiết lộ trình" />
        </div>
      );
    }

    return (
      <div className="p-2">
        <RouteMapSection
          journeySegments={activeJourney.journeySegments}
          journeyInfo={activeJourney}
          issues={vaData.issues}
        />
      </div>
    );
  };

  // Render issues tab
  const renderIssues = (va: StaffVehicleAssignment) => {
    const vaData = va as any;
    if (!vaData.issues || vaData.issues.length === 0) {
      return <Empty description="Không có sự cố nào được ghi nhận" />;
    }

    return (
      <div className="space-y-4">
        {vaData.issues.map((issue: any, issueIdx: number) => {
          const isOrderRejection = issue.issueCategory === 'ORDER_REJECTION';
          const isSealReplacement = issue.issueCategory === 'SEAL_REPLACEMENT';
          const isDamage = issue.issueCategory === 'DAMAGE';

          return (
            <Card
              key={issue.id || issueIdx}
              className={`shadow-md border-l-4 ${
                isOrderRejection ? 'border-l-red-500 bg-red-50' :
                isSealReplacement ? 'border-l-yellow-500 bg-yellow-50' :
                isDamage ? 'border-l-orange-500 bg-orange-50' :
                'border-l-blue-500 bg-blue-50'
              }`}
              size="small"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ExclamationCircleOutlined className="text-xl text-red-600" />
                    <div className="text-base font-semibold text-gray-900">
                      {issue.issueTypeName || 'Sự cố'}
                    </div>
                  </div>
                  {issue.reportedAt && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 ml-7">
                      <ClockCircleOutlined />
                      <span>Báo cáo: {formatDate(issue.reportedAt)}</span>
                    </div>
                  )}
                </div>
                <Tag color={getIssueStatusColor(issue.status)}>
                  {getIssueStatusLabel(issue.status)}
                </Tag>
              </div>

              {/* Description */}
              <div className="mb-3 p-2 bg-white rounded">
                <div className="text-sm text-gray-600 font-medium mb-1">Mô tả:</div>
                <div className="text-sm">{issue.description || 'Không có mô tả'}</div>
              </div>

              {/* Location */}
              {(issue.locationLatitude && issue.locationLongitude) && (
                <div className="mb-3 p-2 bg-white rounded">
                  <div className="text-sm text-gray-600 font-medium mb-1 flex items-center">
                    <EnvironmentOutlined className="mr-1 text-red-500" />
                    Vị trí sự cố:
                  </div>
                  <div className="text-sm">
                    Lat: {issue.locationLatitude.toFixed(6)}, Lng: {issue.locationLongitude.toFixed(6)}
                  </div>
                </div>
              )}

              {/* Staff info */}
              {issue.staff && issue.staff.fullName && (
                <div className="mb-3 p-2 bg-white rounded">
                  <div className="text-sm text-gray-600 font-medium mb-1">Nhân viên xử lý:</div>
                  <div className="flex items-center gap-4">
                    <span><UserOutlined className="mr-1" />{issue.staff.fullName}</span>
                    {issue.staff.phoneNumber && (
                      <span><PhoneOutlined className="mr-1" />{issue.staff.phoneNumber}</span>
                    )}
                  </div>
                </div>
              )}

              {/* ORDER_REJECTION specific info */}
              {isOrderRejection && issue.affectedOrderDetails && issue.affectedOrderDetails.length > 0 && (
                <div className="mb-3 p-3 bg-white rounded border border-red-200">
                  <div className="text-sm font-semibold text-red-600 mb-2 flex items-center">
                    <DollarOutlined className="mr-2" />
                    Thông tin phí trả hàng
                  </div>
                  <Descriptions size="small" column={1} bordered>
                    {issue.paymentDeadline && (
                      <Descriptions.Item label="Hạn thanh toán">
                        <span className="text-red-600 font-medium">{formatDate(issue.paymentDeadline)}</span>
                      </Descriptions.Item>
                    )}
                    {issue.finalFee && (
                      <Descriptions.Item label="Phí cuối cùng">
                        <span className="font-bold text-red-600">{formatCurrency(issue.finalFee)}</span>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <InboxOutlined className="text-lg text-red-600" />
                      <span className="text-sm font-semibold text-red-700">
                        Kiện hàng bị ảnh hưởng ({issue.affectedOrderDetails.length} kiện)
                      </span>
                    </div>
                    <div className="space-y-2">
                      {issue.affectedOrderDetails.map((pkg: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <Tag color="red">{pkg.trackingCode || 'N/A'}</Tag>
                          <span className="font-bold text-red-700">{pkg.weightBaseUnit?.toFixed(2)} {pkg.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SEAL_REPLACEMENT specific info */}
              {isSealReplacement && (
                <div className="mb-3 p-3 bg-white rounded border border-yellow-200">
                  <div className="text-sm font-semibold text-yellow-700 mb-2 flex items-center">
                    <WarningOutlined className="mr-2" />
                    Thông tin thay thế niêm phong
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {issue.oldSeal && (
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 font-medium mb-1">Niêm phong cũ:</div>
                        <div className="font-semibold">{issue.oldSeal.sealCode}</div>
                        <Tag color="red" className="mt-1">Đã gỡ</Tag>
                      </div>
                    )}
                    {issue.newSeal && (
                      <div className="p-2 bg-green-50 rounded">
                        <div className="text-xs text-gray-600 font-medium mb-1">Niêm phong mới:</div>
                        <div className="font-semibold">{issue.newSeal.sealCode}</div>
                        <Tag color={getSealStatusColor(issue.newSeal.status)} className="mt-1">
                          {getSealStatusLabel(issue.newSeal.status)}
                        </Tag>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Issue images */}
              {issue.issueImages && issue.issueImages.length > 0 && (
                <div className="mb-3 p-2 bg-white rounded">
                  <div className="text-sm text-gray-600 font-medium mb-2">
                    {isOrderRejection ? 'Ảnh xác nhận trả hàng:' : 'Hình ảnh sự cố:'}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Image.PreviewGroup>
                      {issue.issueImages.map((url: string, idx: number) => (
                        <Image
                          key={idx}
                          src={url}
                          alt={`Issue image ${idx + 1}`}
                          className="rounded"
                          width="100%"
                          style={{maxHeight: '120px', objectFit: 'cover'}}
                        />
                      ))}
                    </Image.PreviewGroup>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  // Render completion photos tab
  const renderCompletionPhotos = (va: StaffVehicleAssignment) => {
    const vaData = va as any;
    if (!vaData.photoCompletions || vaData.photoCompletions.length === 0) {
      return <Empty description="Không có hình ảnh hoàn thành" />;
    }

    return (
      <div className="p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Image.PreviewGroup>
            {vaData.photoCompletions.map((url: string, idx: number) => (
              <div key={idx} className="relative group">
                <Image
                  src={url}
                  alt={`Hình ảnh hoàn thành ${idx + 1}`}
                  className="object-cover rounded w-full"
                  style={{height: '120px', objectFit: 'cover'}}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded transition-all" />
              </div>
            ))}
          </Image.PreviewGroup>
        </div>
      </div>
    );
  };

  // Render seals with Vietnamese translations
  const renderSeals = (va: StaffVehicleAssignment) => {
    const vaData = va as any;
    if (!vaData.seals || vaData.seals.length === 0) {
      return <Empty description="Không có thông tin niêm phong" />;
    }
    return (
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vaData.seals.map((seal: any) => (
            <div key={seal.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600">Mã niêm phong</p>
                  <p className="text-base font-bold text-blue-600">{seal.sealCode || seal.sealId}</p>
                </div>
                <Tag color={getSealStatusColor(seal.status)} className="ml-2">
                  {getSealStatusLabel(seal.status)}
                </Tag>
              </div>

              <div className="space-y-2 mb-3 pb-3 border-b border-blue-200">
                <div>
                  <p className="text-xs text-gray-500">Mô tả</p>
                  <p className="text-sm text-gray-700">{seal.description || "Không có mô tả"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Ngày niêm phong</p>
                  <p className="font-medium text-gray-700">{seal.sealDate ? formatDate(seal.sealDate) : "Chưa có"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Thời gian gỡ</p>
                  <p className="font-medium text-gray-700">{seal.sealRemovalTime ? formatDate(seal.sealRemovalTime) : "Chưa gỡ"}</p>
                </div>
              </div>

              {seal.sealAttachedImage && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-gray-500 mb-2">Hình ảnh niêm phong</p>
                  <Image
                    src={seal.sealAttachedImage}
                    alt={`Seal ${seal.sealCode}`}
                    className="w-full rounded"
                    style={{maxHeight: '100px', objectFit: 'cover'}}
                  />
                </div>
              )}

              {seal.sealRemovalReason && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-gray-500">Lý do gỡ niêm phong</p>
                  <p className="text-sm text-red-600 font-medium">{seal.sealRemovalReason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper function for penalty status
  const getPenaltyStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PENDING': 'Chờ xử lý',
      'PAID': 'Đã thanh toán',
      'UNPAID': 'Chưa thanh toán',
    };
    return labels[status] || status;
  };

  // Render penalties with better UI
  const renderPenalties = (va: StaffVehicleAssignment) => {
    const vaData = va as any;
    if (!vaData.penalties || vaData.penalties.length === 0) {
      return <Empty description="Không có vi phạm nào được ghi nhận" />;
    }
    return (
      <div className="p-4 space-y-4">
        {vaData.penalties.map((penalty: any, index: number) => (
          <Card
            key={penalty.id || index}
            className="shadow-sm hover:shadow-md transition-shadow rounded-lg border-l-4 border-l-red-500"
            size="small"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 font-medium">Loại vi phạm</div>
                  <div className="text-base font-bold text-gray-900">
                    {penalty.type || penalty.violationType || "Không xác định"}
                  </div>
                </div>
                <Tag color="red" className="ml-2">
                  {penalty.amount ? formatCurrency(penalty.amount) : formatCurrency(penalty.penaltyAmount)}
                </Tag>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100"></div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Mô tả:</span>
                  <span className="text-sm text-gray-900 text-right max-w-xs">
                    {penalty.description || penalty.violationDescription || "Không có mô tả"}
                  </span>
                </div>
                {(penalty.location || penalty.violationLocation) && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Địa điểm:</span>
                    <span className="text-sm text-gray-900 text-right max-w-xs">
                      {penalty.location || penalty.violationLocation}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Thời gian:</span>
                  <span className="font-semibold text-gray-900">
                    {penalty.createdAt ? formatDate(penalty.createdAt) : "Chưa có"}
                  </span>
                </div>
                {penalty.status && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    <Tag color={penalty.status === 'PAID' ? 'green' : 'orange'}>
                      {getPenaltyStatusLabel(penalty.status)}
                    </Tag>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Render fuel consumption with better UI
  const renderFuelConsumption = (va: StaffVehicleAssignment) => {
    const vaData = va as any;
    if (!vaData.fuelConsumption) {
      return <Empty description="Chưa có dữ liệu nhiên liệu" />;
    }
    const fuel = vaData.fuelConsumption;
    return (
      <div className="p-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow rounded-lg border-l-4 border-l-blue-500">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center">
              <FireOutlined className="text-2xl text-blue-500 mr-3" />
              <div>
                <div className="text-lg font-bold text-gray-900">
                  Thông tin tiêu thụ nhiên liệu
                </div>
                <div className="text-sm text-gray-500">
                  Ghi nhận lúc: {fuel.dateRecorded ? formatDate(fuel.dateRecorded) : "Chưa có"}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100"></div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Odometer đầu chuyến</p>
                  <p className="text-lg font-bold text-gray-900">
                    {fuel.odometerReadingAtStart ? `${fuel.odometerReadingAtStart.toLocaleString('vi-VN')} km` : "Chưa có"}
                  </p>
                </div>
                {fuel.odometerReadingAtEnd && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Odometer cuối chuyến</p>
                    <p className="text-lg font-bold text-gray-900">
                      {fuel.odometerReadingAtEnd.toLocaleString('vi-VN')} km
                    </p>
                  </div>
                )}
                {fuel.distanceTraveled && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Quãng đường đã đi</p>
                    <p className="text-lg font-bold text-gray-900">
                      {fuel.distanceTraveled.toLocaleString('vi-VN')} km
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {fuel.fuelVolume && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Lượng nhiên liệu</p>
                    <p className="text-lg font-bold text-gray-900">
                      {fuel.fuelVolume} lít
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 font-medium">Ghi chú</p>
                  <p className="text-sm text-gray-900">
                    {fuel.notes || "Không có ghi chú"}
                  </p>
                </div>
              </div>
            </div>

            {/* Images */}
            {(fuel.odometerAtStartUrl || fuel.odometerAtEndUrl) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fuel.odometerAtStartUrl && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">Hình ảnh odometer đầu chuyến</p>
                    <Image
                      src={fuel.odometerAtStartUrl}
                      alt="Odometer start"
                      className="w-full rounded border border-gray-200"
                      style={{maxHeight: '120px', objectFit: 'cover'}}
                    />
                  </div>
                )}
                {fuel.odometerAtEndUrl && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-2">Hình ảnh odometer cuối chuyến</p>
                    <Image
                      src={fuel.odometerAtEndUrl}
                      alt="Odometer end"
                      className="w-full rounded border border-gray-200"
                      style={{maxHeight: '120px', objectFit: 'cover'}}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Company Invoice */}
            {fuel.companyInvoiceImageUrl && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2">Hóa đơn nhiên liệu</p>
                <Image
                  src={fuel.companyInvoiceImageUrl}
                  alt="Company invoice"
                  className="w-full rounded border border-gray-200"
                  style={{maxHeight: '150px', objectFit: 'cover'}}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // Render contract tab with compact layout for modal
  const renderContractTab = () => {
    const transactions = orderData?.transactions || [];
    
    return (
      <div className="space-y-4">
        {/* Contract Information - Using CompactContractCard for modal */}
        <CompactContractCard
          contract={contract}
          orderId={orderData?.order?.id}
          depositAmount={orderData?.order?.depositAmount}
          onRefetch={() => {
            // Refetch order data if needed
            if (orderId) {
              const loadData = async () => {
                try {
                  const data = await orderService.getOrderForStaffByOrderId(orderId);
                  setOrderData(data);
                } catch (err: any) {
                  setError(err.message || 'Không thể tải thông tin đơn hàng');
                }
              };
              loadData();
            }
          }}
        />

        {/* Insurance Information - Compact version */}
        <InsuranceInfo
          hasInsurance={orderData?.order?.hasInsurance}
          totalInsuranceFee={orderData?.order?.totalInsuranceFee}
          totalDeclaredValue={orderData?.order?.totalDeclaredValue}
        />

        {/* Transactions - Card-style layout for modal */}
        <Card
          title={
            <div className="flex items-center">
              <CreditCardOutlined className="mr-2 text-blue-500" />
              <span>Thông tin thanh toán ({transactions.length})</span>
            </div>
          }
          className="shadow-sm rounded-xl"
          size="small"
        >
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <PaymentCard
                  key={transaction.id}
                  transaction={transaction}
                  compact={true}
                />
              ))}
            </div>
          ) : (
            <Empty description="Chưa có thông tin thanh toán" />
          )}
        </Card>
      </div>
    );
  };

  // Container class based on layout mode - with 10% margin when not side-by-side
  const containerClass = isSideBySide
    ? 'flex-1 bg-white h-full overflow-hidden flex flex-col'
    : 'fixed inset-[5%] bg-black/50 flex items-center justify-center z-[60]';
  
  const contentClass = isSideBySide
    ? 'bg-white h-full overflow-hidden flex flex-col'
    : 'bg-white rounded-lg shadow-xl w-full h-full overflow-hidden flex flex-col';

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* Header - height matched with overview modals */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex items-center justify-between flex-shrink-0 min-h-[60px]">
          <div className="flex items-center gap-2">
            <InboxOutlined className="text-lg" />
            <div>
              <h2 className="text-base font-semibold">Chi tiết đơn hàng</h2>
              {order && <p className="text-blue-100 text-xs">Mã: {order.orderCode}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {order && (
              <Button
                type="primary"
                ghost
                size="small"
                icon={<ExternalLink size={14} />}
                onClick={handleViewDetail}
                className="!text-white !border-white hover:!bg-white/20"
              >
                Xem chi tiết
              </Button>
            )}
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              className="text-white hover:bg-white/20"
              size="small"
            />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spin size="large" tip="Đang tải..." />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <AlertTriangle size={40} className="mx-auto mb-2" />
              <p>{error}</p>
            </div>
          ) : order ? (
            <div className="space-y-4">
              {/* Order Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{order.orderCode}</h3>
                  <p className="text-xs text-gray-500">Tạo lúc: {formatDate(order.createdAt)}</p>
                </div>
                <OrderStatusTag status={order.status as OrderStatusEnum} />
              </div>

              {/* Tabs */}
              <Tabs
                defaultActiveKey="basic"
                items={getTabItems()}
                size="small"
                className="order-detail-tabs"
              />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <AlertTriangle size={40} className="mx-auto mb-2" />
              <p>Không có dữ liệu đơn hàng</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderQuickViewModal;
