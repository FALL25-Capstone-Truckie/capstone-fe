import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Tag,
  Tabs,
  Empty,
  Image,
  Descriptions,
  Spin,
  Button,
} from 'antd';
import {
  CarOutlined,
  IdcardOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  TagOutlined,
  BoxPlotOutlined,
  EnvironmentOutlined,
  ToolOutlined,
  FileTextOutlined,
  WarningOutlined,
  FireOutlined,
  CameraOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  CloseOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  RightOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { vehicleAssignmentService } from '@/services/vehicle-assignment';
import { VehicleAssignmentTag, OrderStatusTag } from '@/components/common/tags';
import { VehicleAssignmentEnum, OrderStatusEnum } from '@/constants/enums';
import { getIssueStatusLabel, getIssueStatusColor, getSealStatusLabel, getSealStatusColor } from '@/constants/enums';
import { formatSealStatus } from '@/models/JourneyHistory';
import OrderDetailStatusCard from '@/components/common/OrderDetailStatusCard';
import RouteMapSection from '@/pages/Admin/Order/components/StaffOrderDetail/RouteMapSection';
import vietmapService from '@/services/vietmap/vietmapService';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface VehicleAssignmentQuickViewModalProps {
  vehicleAssignmentId: string;
  trackingCode?: string;
  isOpen?: boolean;
  onClose: () => void;
  onCloseAll?: () => void;
  isSideBySide?: boolean;
}

// Helper functions for status translation and colors
const getVehicleStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'ACTIVE': 'Đang hoạt động',
    'INACTIVE': 'Không hoạt động',
    'MAINTENANCE': 'Đang bảo trì',
    'AVAILABLE': 'Sẵn sàng',
    'IN_USE': 'Đang sử dụng',
    'RETIRED': 'Đã ngừng sử dụng',
  };
  return labels[status?.toUpperCase()] || status;
};

const getVehicleStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'ACTIVE': 'green',
    'INACTIVE': 'default',
    'MAINTENANCE': 'orange',
    'AVAILABLE': 'blue',
    'IN_USE': 'processing',
    'RETIRED': 'red',
  };
  return colors[status?.toUpperCase()] || 'default';
};

const getDriverStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'ACTIVE': 'Đang hoạt động',
    'INACTIVE': 'Không hoạt động',
    'ON_TRIP': 'Đang chạy chuyến',
    'AVAILABLE': 'Sẵn sàng',
    'OFF_DUTY': 'Nghỉ phép',
    'SUSPENDED': 'Tạm ngưng',
  };
  return labels[status?.toUpperCase()] || status;
};

const getDriverStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'ACTIVE': 'green',
    'INACTIVE': 'default',
    'ON_TRIP': 'processing',
    'AVAILABLE': 'blue',
    'OFF_DUTY': 'orange',
    'SUSPENDED': 'red',
  };
  return colors[status?.toUpperCase()] || 'default';
};

const getJourneyStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'INITIAL': 'Khởi tạo',
    'ACTIVE': 'Đang hoạt động',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy',
    'IN_PROGRESS': 'Đang tiến hành',
    'DELAYED': 'Bị trễ',
  };
  return labels[status?.toUpperCase()] || status;
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
  return colors[status?.toUpperCase()] || 'default';
};

const getSegmentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'PENDING': 'Chờ xử lý',
    'IN_PROGRESS': 'Đang thực hiện',
    'COMPLETED': 'Hoàn thành',
    'SKIPPED': 'Bỏ qua',
  };
  return labels[status?.toUpperCase()] || status;
};

const getSegmentStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'PENDING': 'default',
    'IN_PROGRESS': 'processing',
    'COMPLETED': 'success',
    'SKIPPED': 'warning',
  };
  return colors[status?.toUpperCase()] || 'default';
};

// Component to display issue location with reverse geocoding
const IssueLocationDisplay: React.FC<{ latitude: number; longitude: number }> = ({ latitude, longitude }) => {
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const results = await vietmapService.reverseGeocode(latitude, longitude);
        if (results && results.length > 0) {
          setAddress(results[0].display || results[0].address || '');
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAddress();
  }, [latitude, longitude]);

  return (
    <div className="mb-2 p-2 bg-white rounded text-sm">
      <div className="text-gray-600 font-medium mb-1 flex items-center">
        <EnvironmentOutlined className="mr-1 text-red-500" />
        Vị trí sự cố:
      </div>
      <div className="text-xs">
        {loading ? 'Đang tải địa chỉ...' : (address || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`)}
      </div>
    </div>
  );
};

const VehicleAssignmentQuickViewModal: React.FC<VehicleAssignmentQuickViewModalProps> = ({
  vehicleAssignmentId,
  trackingCode,
  isOpen = true,
  onClose,
  onCloseAll,
  isSideBySide = false,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('vehicle');

  // Use same API as VehicleAssignmentDetail page
  const { data: assignmentData, isLoading } = useQuery({
    queryKey: ['staffVehicleAssignmentFull', vehicleAssignmentId],
    queryFn: () => vehicleAssignmentId ? vehicleAssignmentService.getFullById(vehicleAssignmentId) : null,
    enabled: isOpen && !!vehicleAssignmentId,
  });

  const va: any = assignmentData?.data;

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return dayjs(date).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm');
  };

  // Handle navigation to order detail
  const handleViewOrderDetail = () => {
    if (va?.order?.id) {
      if (onCloseAll) onCloseAll();
      else onClose();
      navigate(`/staff/orders/${va.order.id}`);
    }
  };

  // Handle navigation to vehicle assignment detail
  const handleViewVehicleAssignmentDetail = () => {
    if (onCloseAll) onCloseAll();
    else onClose();
    navigate(`/staff/vehicle-assignments/${vehicleAssignmentId}`);
  };

  if (!isOpen) return null;

  // Tab items - FULL structure matching VehicleAssignmentDetail page
  const tabItems = [
    {
      key: 'vehicle',
      label: <span><CarOutlined /> Xe & Tài xế</span>,
      children: va ? renderVehicleDriverTab() : null,
    },
    {
      key: 'orderDetails',
      label: <span><BoxPlotOutlined /> Danh sách kiện hàng</span>,
      children: va ? renderOrderDetailsTab() : null,
    },
    {
      key: 'journey',
      label: <span><EnvironmentOutlined /> Lộ trình vận chuyển</span>,
      children: va ? renderJourneyTab() : null,
    },
    {
      key: 'issues',
      label: (
        <span>
          <ToolOutlined /> Sự cố
          {va?.issues && va.issues.length > 0 && (
            <Tag color="red" className="ml-1">{va.issues.length}</Tag>
          )}
        </span>
      ),
      children: va ? renderIssuesTab() : null,
    },
    {
      key: 'seals',
      label: <span><FileTextOutlined /> Niêm phong</span>,
      children: va ? renderSealsTab() : null,
    },
    {
      key: 'penalties',
      label: <span><WarningOutlined /> Vi phạm & Phạt</span>,
      children: va ? renderPenaltiesTab() : null,
    },
    {
      key: 'fuel',
      label: <span><FireOutlined /> Tiêu thụ nhiên liệu</span>,
      children: va ? renderFuelTab() : null,
    },
    {
      key: 'photos',
      label: <span><CameraOutlined /> Hình ảnh hoàn thành</span>,
      children: va ? renderPhotosTab() : null,
    },
  ];

  // Tab 1: Vehicle & Driver Info - Clone from VehicleAssignmentDetail
  function renderVehicleDriverTab() {
    if (!va) return null;
    return (
      <div className="space-y-4">
        {/* Vehicle Info */}
        <Card className="shadow-sm rounded-lg border-blue-100" size="small">
          <div className="mb-4 bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <CarOutlined className="text-lg text-blue-500 mr-2" />
                <span className="text-base font-medium">
                  {va.vehicle?.licensePlateNumber || 'Chưa có thông tin'}
                </span>
                {va.vehicle?.status && (
                  <Tag color={getVehicleStatusColor(va.vehicle.status)} className="ml-2">
                    {getVehicleStatusLabel(va.vehicle.status)}
                  </Tag>
                )}
              </div>
              <VehicleAssignmentTag status={va.status as VehicleAssignmentEnum} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center">
                <TagOutlined className="mr-2 text-gray-500" />
                <span className="font-medium mr-1">Hãng:</span>
                <span>{va.vehicle?.manufacturer || 'Chưa có'}</span>
              </div>
              <div className="flex items-center">
                <CarOutlined className="mr-2 text-gray-500" />
                <span className="font-medium mr-1">Model:</span>
                <span>{va.vehicle?.model || 'Chưa có'}</span>
              </div>
              <div className="flex items-center">
                <TagOutlined className="mr-2 text-gray-500" />
                <span className="font-medium mr-1">Loại xe:</span>
                <span>{va.vehicle?.vehicleTypeDescription || va.vehicle?.vehicleTypeName || 'Chưa có'}</span>
              </div>
            </div>
          </div>

          {/* Drivers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <UserOutlined className="text-green-500 mr-2" />
                  <span className="font-medium text-sm">Tài xế chính</span>
                </div>
                {va.primaryDriver?.status && (
                  <Tag color={getDriverStatusColor(va.primaryDriver.status)} style={{ fontSize: '10px' }}>
                    {getDriverStatusLabel(va.primaryDriver.status)}
                  </Tag>
                )}
              </div>
              {va.primaryDriver ? (
                <div className="ml-5 space-y-1 text-sm">
                  <div className="flex items-center">
                    <UserOutlined className="mr-2 text-gray-500" />
                    <span className="font-medium">{va.primaryDriver.fullName}</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneOutlined className="mr-2 text-gray-500" />
                    <span>{va.primaryDriver.phoneNumber}</span>
                  </div>
                  {va.primaryDriver.email && (
                    <div className="flex items-center">
                      <MailOutlined className="mr-2 text-gray-500" />
                      <span className="truncate">{va.primaryDriver.email}</span>
                    </div>
                  )}
                  {va.primaryDriver.driverLicenseNumber && (
                    <div className="flex items-center">
                      <IdcardOutlined className="mr-2 text-gray-500" />
                      <span>GPLX: {va.primaryDriver.driverLicenseNumber}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="ml-5 text-gray-500 text-sm">Chưa có thông tin</div>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <UserOutlined className="text-blue-500 mr-2" />
                  <span className="font-medium text-sm">Tài xế phụ</span>
                </div>
                {va.secondaryDriver?.status && (
                  <Tag color={getDriverStatusColor(va.secondaryDriver.status)} style={{ fontSize: '10px' }}>
                    {getDriverStatusLabel(va.secondaryDriver.status)}
                  </Tag>
                )}
              </div>
              {va.secondaryDriver ? (
                <div className="ml-5 space-y-1 text-sm">
                  <div className="flex items-center">
                    <UserOutlined className="mr-2 text-gray-500" />
                    <span className="font-medium">{va.secondaryDriver.fullName}</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneOutlined className="mr-2 text-gray-500" />
                    <span>{va.secondaryDriver.phoneNumber}</span>
                  </div>
                  {va.secondaryDriver.email && (
                    <div className="flex items-center">
                      <MailOutlined className="mr-2 text-gray-500" />
                      <span className="truncate">{va.secondaryDriver.email}</span>
                    </div>
                  )}
                  {va.secondaryDriver.driverLicenseNumber && (
                    <div className="flex items-center">
                      <IdcardOutlined className="mr-2 text-gray-500" />
                      <span>GPLX: {va.secondaryDriver.driverLicenseNumber}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="ml-5 text-gray-500 text-sm">Chưa có thông tin</div>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Tab 2: Order Details (Package List) - Clone from VehicleAssignmentDetail
  function renderOrderDetailsTab() {
    if (!va) return null;
    const orderDetails = va.orderDetails || [];

    if (orderDetails.length === 0) {
      return <Empty description="Không có kiện hàng nào cho chuyến xe này" />;
    }

    return (
      <div className="space-y-3">
        {orderDetails.map((detail: any, idx: number) => (
          <Card
            key={detail.id || idx}
            className="shadow-sm hover:shadow-md transition-shadow rounded-lg border-l-4 border-l-green-500"
            size="small"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-medium">Mã theo dõi</div>
                  <div className="text-base font-bold text-gray-900">
                    {detail.trackingCode || 'Chưa có'}
                  </div>
                </div>
                <OrderDetailStatusCard status={detail.status} />
              </div>
              <div className="border-t border-gray-100"></div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trọng lượng:</span>
                  <span className="font-semibold text-gray-900">
                    {detail.weightBaseUnit} {detail.unit}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Mô tả:</span>
                  <span className="text-gray-900 text-right max-w-xs">
                    {detail.description || 'Không có mô tả'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Tab 3: Journey/Route - WITH MAP like VehicleAssignmentDetail
  function renderJourneyTab() {
    if (!va) return null;

    if (!va.journeyHistories || va.journeyHistories.length === 0) {
      return <Empty description="Không có lịch sử hành trình nào" />;
    }

    const activeJourneys = va.journeyHistories
      .filter((j: any) => j.status === 'ACTIVE')
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (activeJourneys.length === 0) {
      return <Empty description="Không có lộ trình đang hoạt động" />;
    }

    const activeJourney = activeJourneys[0];

    if (!activeJourney.journeySegments || activeJourney.journeySegments.length === 0) {
      return <Empty description="Không có thông tin lộ trình" />;
    }

    return (
      <div className="p-2">
        <RouteMapSection
          journeySegments={activeJourney.journeySegments}
          journeyInfo={activeJourney}
          issues={va.issues}
        />
      </div>
    );
  }

  // Tab 4: Issues - Clone from VehicleAssignmentDetail
  function renderIssuesTab() {
    if (!va) return null;

    if (!va.issues || va.issues.length === 0) {
      return <Empty description="Không có sự cố nào được ghi nhận" />;
    }

    return (
      <div className="space-y-3">
        {va.issues.map((issue: any, issueIdx: number) => {
          const isOrderRejection = issue.issueCategory === 'ORDER_REJECTION';
          const isSealReplacement = issue.issueCategory === 'SEAL_REPLACEMENT';
          const isDamage = issue.issueCategory === 'DAMAGE';
          const isPenalty = issue.issueCategory === 'PENALTY';

          return (
            <Card
              key={issue.id || issueIdx}
              className={`shadow-sm border-l-4 ${
                isOrderRejection ? 'border-l-red-500 bg-red-50' :
                isSealReplacement ? 'border-l-yellow-500 bg-yellow-50' :
                isDamage ? 'border-l-orange-500 bg-orange-50' :
                isPenalty ? 'border-l-red-600 bg-red-100' :
                'border-l-blue-500 bg-blue-50'
              }`}
              size="small"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ExclamationCircleOutlined className="text-lg text-red-600" />
                    <div className="text-sm font-semibold text-gray-900">
                      {issue.issueTypeName || 'Sự cố'}
                    </div>
                  </div>
                  {issue.reportedAt && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 ml-6">
                      <ClockCircleOutlined />
                      <span>Báo cáo: {formatDate(issue.reportedAt)}</span>
                    </div>
                  )}
                </div>
                <Tag color={getIssueStatusColor(issue.status)}>
                  {getIssueStatusLabel(issue.status)}
                </Tag>
              </div>

              <div className="mb-2 p-2 bg-white rounded text-sm">
                <div className="text-gray-600 font-medium mb-1">Mô tả:</div>
                <div className="text-xs">{issue.description || 'Không có mô tả'}</div>
              </div>

              {(issue.locationLatitude && issue.locationLongitude) && (
                <IssueLocationDisplay 
                  latitude={issue.locationLatitude} 
                  longitude={issue.locationLongitude}
                />
              )}

              {issue.staff && issue.staff.fullName && (
                <div className="mb-2 p-2 bg-white rounded text-xs">
                  <div className="text-gray-600 font-medium mb-1">Nhân viên xử lý:</div>
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
                <div className="mb-2 p-2 bg-white rounded border border-red-200">
                  <div className="text-xs font-semibold text-red-600 mb-2 flex items-center">
                    <DollarOutlined className="mr-2" />
                    Thông tin phí trả hàng
                  </div>
                  <Descriptions size="small" column={1} bordered>
                    {issue.paymentDeadline && (
                      <Descriptions.Item label="Hạn thanh toán">
                        <span className="text-red-600 font-medium text-xs">
                          {formatDate(issue.paymentDeadline)}
                        </span>
                      </Descriptions.Item>
                    )}
                    {issue.finalFee && (
                      <Descriptions.Item label="Phí cuối cùng">
                        <span className="font-bold text-red-600 text-xs">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(issue.finalFee)}
                        </span>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </div>
              )}

              {/* SEAL_REPLACEMENT specific info */}
              {isSealReplacement && (
                <div className="mb-2 p-2 bg-white rounded border border-yellow-200">
                  <div className="text-xs font-semibold text-yellow-700 mb-2 flex items-center">
                    <WarningOutlined className="mr-2" />
                    Thông tin thay thế niêm phong
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {issue.oldSeal && (
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600 font-medium mb-1">Niêm phong cũ:</div>
                        <div className="font-semibold text-xs">{issue.oldSeal.sealCode}</div>
                        <Tag color="red" className="mt-1" style={{ fontSize: '10px' }}>Đã gỡ</Tag>
                      </div>
                    )}
                    {issue.newSeal && (
                      <div className="p-2 bg-green-50 rounded">
                        <div className="text-xs text-gray-600 font-medium mb-1">Niêm phong mới:</div>
                        <div className="font-semibold text-xs">{issue.newSeal.sealCode}</div>
                        <Tag color={getSealStatusColor(issue.newSeal.status)} className="mt-1" style={{ fontSize: '10px' }}>
                          {getSealStatusLabel(issue.newSeal.status)}
                        </Tag>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Issue images */}
              {issue.issueImages && issue.issueImages.length > 0 && (
                <div className="p-2 bg-white rounded">
                  <div className="text-xs text-gray-600 font-medium mb-2">Hình ảnh sự cố:</div>
                  <div className="grid grid-cols-3 gap-2">
                    <Image.PreviewGroup>
                      {issue.issueImages.map((url: string, idx: number) => (
                        <Image
                          key={idx}
                          src={url}
                          alt={`Issue ${idx + 1}`}
                          className="rounded"
                          width="100%"
                          style={{ maxHeight: '80px', objectFit: 'cover' }}
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
  }

  // Tab 5: Seals - Clone from VehicleAssignmentDetail
  function renderSealsTab() {
    if (!va) return null;

    if (!va.seals || va.seals.length === 0) {
      return <Empty description="Không có thông tin niêm phong" />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {va.seals.map((seal: any) => (
          <div key={seal.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-600">Mã niêm phong</p>
                <p className="text-sm font-bold text-blue-600">{seal.sealCode || seal.sealId}</p>
              </div>
              <Tag color={getSealStatusColor(seal.status)} className="ml-2">
                {formatSealStatus(seal.status)}
              </Tag>
            </div>

            <div className="space-y-1 mb-2 pb-2 border-b border-blue-200">
              <div>
                <p className="text-xs text-gray-500">Mô tả</p>
                <p className="text-xs text-gray-700">{seal.description || "Không có mô tả"}</p>
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
              <div className="mt-2 pt-2 border-t border-blue-200">
                <p className="text-xs text-gray-500 mb-1">Hình ảnh niêm phong</p>
                <Image
                  src={seal.sealAttachedImage}
                  alt={`Seal ${seal.sealCode}`}
                  className="w-full h-16 object-cover rounded"
                />
              </div>
            )}

            {seal.sealRemovalReason && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <p className="text-xs text-gray-500">Lý do gỡ niêm phong</p>
                <p className="text-xs text-red-600 font-medium">{seal.sealRemovalReason}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Tab 6: Penalties - Clone from VehicleAssignmentDetail
  function renderPenaltiesTab() {
    if (!va) return null;

    if (!va.penalties || va.penalties.length === 0) {
      return <Empty description="Không có vi phạm nào được ghi nhận" />;
    }

    return (
      <div className="space-y-3">
        {va.penalties.map((penalty: any, index: number) => (
          <Card
            key={penalty.id || index}
            className="shadow-sm hover:shadow-md transition-shadow rounded-lg border-l-4 border-l-red-500"
            size="small"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 font-medium">Loại vi phạm</div>
                  <div className="text-sm font-bold text-gray-900">
                    {penalty.type || "Không xác định"}
                  </div>
                </div>
                <Tag color="red" className="ml-2">
                  {penalty.amount ? `${penalty.amount.toLocaleString('vi-VN')} VND` : 'Chưa có'}
                </Tag>
              </div>
              <div className="border-t border-gray-100"></div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Mô tả:</span>
                  <span className="text-gray-900 text-right max-w-xs">
                    {penalty.description || "Không có mô tả"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-semibold text-gray-900">
                    {penalty.createdAt ? formatDate(penalty.createdAt) : "Chưa có"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Tab 7: Fuel Consumption - Clone from VehicleAssignmentDetail
  function renderFuelTab() {
    if (!va) return null;

    if (!va.fuelConsumption) {
      return <Empty description="Không có thông tin tiêu thụ nhiên liệu" />;
    }

    const fuel = va.fuelConsumption;
    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow rounded-lg border-l-4 border-l-blue-500" size="small">
        <div className="space-y-3">
          <div className="flex items-center">
            <FireOutlined className="text-xl text-blue-500 mr-2" />
            <div>
              <div className="text-sm font-bold text-gray-900">
                Thông tin tiêu thụ nhiên liệu
              </div>
              <div className="text-xs text-gray-500">
                Ghi nhận lúc: {fuel.dateRecorded ? formatDate(fuel.dateRecorded) : "Chưa có"}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 font-medium">Odometer đầu chuyến</p>
                <p className="text-sm font-bold text-gray-900">
                  {fuel.odometerReadingAtStart ? `${fuel.odometerReadingAtStart.toLocaleString('vi-VN')} km` : "Chưa có"}
                </p>
              </div>
              {fuel.odometerReadingAtEnd && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">Odometer cuối chuyến</p>
                  <p className="text-sm font-bold text-gray-900">
                    {fuel.odometerReadingAtEnd.toLocaleString('vi-VN')} km
                  </p>
                </div>
              )}
              {fuel.distanceTraveled && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">Quãng đường đã đi</p>
                  <p className="text-sm font-bold text-gray-900">
                    {fuel.distanceTraveled.toLocaleString('vi-VN')} km
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {fuel.fuelVolume && (
                <div>
                  <p className="text-xs text-gray-500 font-medium">Lượng nhiên liệu</p>
                  <p className="text-sm font-bold text-gray-900">
                    {fuel.fuelVolume} lít
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 font-medium">Ghi chú</p>
                <p className="text-xs text-gray-900">
                  {fuel.notes || "Không có ghi chú"}
                </p>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-2 gap-3">
            {fuel.odometerAtStartUrl && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Hình ảnh odometer đầu chuyến</p>
                <Image
                  src={fuel.odometerAtStartUrl}
                  alt="Odometer start"
                  className="w-full h-20 object-cover rounded border border-gray-200"
                />
              </div>
            )}
            {fuel.odometerAtEndUrl && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Hình ảnh odometer cuối chuyến</p>
                <Image
                  src={fuel.odometerAtEndUrl}
                  alt="Odometer end"
                  className="w-full h-20 object-cover rounded border border-gray-200"
                />
              </div>
            )}
          </div>

          {fuel.companyInvoiceImageUrl && (
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Hóa đơn nhiên liệu</p>
              <Image
                src={fuel.companyInvoiceImageUrl}
                alt="Company invoice"
                className="w-full h-32 object-cover rounded border border-gray-200"
              />
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Tab 8: Completion Photos - Clone from VehicleAssignmentDetail
  function renderPhotosTab() {
    if (!va) return null;

    if (!va.photoCompletions || va.photoCompletions.length === 0) {
      return <Empty description="Không có hình ảnh hoàn thành" />;
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Image.PreviewGroup>
          {va.photoCompletions.map((url: string, idx: number) => (
            <div key={idx} className="relative group">
              <Image
                src={url}
                alt={`Completion photo ${idx + 1}`}
                className="object-cover rounded w-full h-24"
              />
            </div>
          ))}
        </Image.PreviewGroup>
      </div>
    );
  }

  // Render content
  const renderContent = () => (
    <div className="flex-1 overflow-auto p-4">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Spin size="large" />
        </div>
      ) : va ? (
        <div className="space-y-4">
          {/* Order Info Card - Quick View (like VehicleAssignmentDetail) */}
          {va.order && (
            <Card 
              className="shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-orange-500"
              size="small"
              onClick={handleViewOrderDetail}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <ShoppingOutlined className="text-lg text-orange-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Đơn hàng liên quan</div>
                    <div className="text-base font-bold text-orange-600">{va.order.orderCode}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600 flex items-center">
                        <CalendarOutlined className="mr-1" />
                        {formatDate(va.order.createdAt)}
                      </span>
                      <OrderStatusTag status={va.order.status as OrderStatusEnum} size="small" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-blue-500 hover:text-blue-600">
                  <span className="text-xs mr-1">Chi tiết</span>
                  <RightOutlined />
                </div>
              </div>
            </Card>
          )}

          {/* Header Info */}
          <Card size="small" className="shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CarOutlined className="text-lg text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Mã theo dõi chuyến xe</div>
                <div className="text-base font-bold text-blue-600">{va.trackingCode || trackingCode || 'Chưa có'}</div>
                <div className="flex items-center gap-2 mt-1">
                  <VehicleAssignmentTag status={va.status as VehicleAssignmentEnum} />
                  <span className="text-xs text-gray-500">
                    {va.vehicle?.licensePlateNumber}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Card className="shadow-sm" size="small">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              type="card"
              size="small"
              items={tabItems}
            />
          </Card>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          Không thể tải thông tin chuyến xe
        </div>
      )}
    </div>
  );

  // Side-by-side mode - render as panel without backdrop
  if (isSideBySide) {
    return (
      <div className="flex-1 bg-white h-full overflow-hidden flex flex-col">
        {/* Header - height matched with overview modals */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0 min-h-[60px]">
          <div className="flex items-center gap-2">
            <CarOutlined className="text-white text-lg" />
            <div>
              <h2 className="text-base font-semibold text-white">Chi tiết chuyến xe</h2>
              {(trackingCode || va?.trackingCode) && (
                <p className="text-blue-100 text-xs">Mã: {trackingCode || va?.trackingCode}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="text"
              icon={<ExportOutlined />}
              onClick={handleViewVehicleAssignmentDetail}
              className="text-white hover:bg-white/20 text-xs"
              size="small"
            >
              Xem trang
            </Button>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              className="text-white hover:bg-white/20"
              size="small"
            />
            {onCloseAll && (
              <Button
                type="text"
                onClick={onCloseAll}
                className="text-white hover:bg-white/20 text-xs"
                size="small"
              >
                Đóng tất cả
              </Button>
            )}
          </div>
        </div>

        {renderContent()}
      </div>
    );
  }

  // Normal modal mode
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-[95vw] max-w-5xl h-[85vh] flex flex-col">
        {/* Header - height matched */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl min-h-[60px]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CarOutlined className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Chi tiết chuyến xe</h2>
              <p className="text-blue-100 text-sm">Mã: {trackingCode || va?.trackingCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="text"
              icon={<ExportOutlined />}
              onClick={handleViewVehicleAssignmentDetail}
              className="text-white hover:bg-white/20 text-xs"
              size="small"
            >
              Xem trang chi tiết
            </Button>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              className="text-white hover:bg-white/20"
              size="large"
            />
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default VehicleAssignmentQuickViewModal;
