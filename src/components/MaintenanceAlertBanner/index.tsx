import React, { useState, useEffect } from 'react';
import { Alert, Button, Space, Typography, Divider, Spin, Card, Row, Col, Tag, Tabs, Badge, Collapse } from 'antd';
import { 
    ExclamationCircleOutlined, 
    CalendarOutlined, 
    CarOutlined,
    PlusOutlined,
    CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import vehicleService from '../../services/vehicle/vehicleService';
import type { VehicleServiceRecord } from '../../models';

const { Text, Title } = Typography;

// Service type mapping - centralized for consistency
const SERVICE_TYPE_MAP: { [key: string]: string } = {
    'INSPECTION': 'Đăng kiểm định kỳ',
    'MAINTENANCE_PERIODIC': 'Bảo dưỡng định kỳ',
    'INSURANCE_RENEWAL': 'Gia hạn bảo hiểm',
    'MAINTENANCE_REPAIR': 'Sửa chữa',
    'OTHER': 'Khác'
};

// Helper function to get display name from service type code
const getServiceTypeDisplayName = (serviceType: string | undefined): string => {
    if (!serviceType) return 'Bảo dưỡng định kỳ';
    
    // If it's a code, map it to display name
    if (SERVICE_TYPE_MAP[serviceType]) {
        return SERVICE_TYPE_MAP[serviceType];
    }
    
    // Already a display name or unknown, return as-is
    return serviceType;
};

interface MaintenanceAlertBannerProps {
    onCreateSchedule?: (vehicleId: string, serviceType: string) => void;
    className?: string;
    refreshBanner?: number; // Counter to trigger refresh when incremented
}

const MaintenanceAlertBanner: React.FC<MaintenanceAlertBannerProps> = ({
    onCreateSchedule,
    className,
    refreshBanner = 0
}) => {
    const [dueSoonServices, setDueSoonServices] = useState<VehicleServiceRecord[]>([]);
    const [overdueServices, setOverdueServices] = useState<VehicleServiceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [expanded, setExpanded] = useState<boolean>(true);

    useEffect(() => {
        fetchAlertData();
    }, [refreshBanner]); // Re-fetch when refreshBanner changes

    const fetchAlertData = async () => {
        setLoading(true);
        try {
            // Fetch all necessary data in parallel
            const [dueSoonResponse, overdueResponse, allMaintenanceResponse] = await Promise.all([
                vehicleService.getServicesDueSoon(30), // 30 days warning (includes both 7-day critical and 30-day warning)
                vehicleService.getOverdueServices(),
                vehicleService.getVehicleMaintenances() // Get all maintenance records to check for planned schedules
            ]);

            // Extract all planned maintenance records
            const plannedRecords = allMaintenanceResponse.success ? 
                (allMaintenanceResponse.data || []).filter(record => 
                    record.serviceStatus === 'PLANNED') : [];

            if (dueSoonResponse.success) {
                // Filter out vehicles that already have a planned record for the same service type
                const filteredDueSoonServices = (dueSoonResponse.data || []).filter((service: VehicleServiceRecord) => {
                    // Only include services that don't have a corresponding planned maintenance
                    return !plannedRecords.some(planned => 
                        planned.vehicleEntity?.id === service.vehicleEntity?.id && 
                        planned.serviceType === service.serviceType);
                });
                
                setDueSoonServices(filteredDueSoonServices);
            }
            
            if (overdueResponse.success) {
                // Filter out vehicles that already have a planned record for the same service type
                const filteredOverdueServices = (overdueResponse.data || []).filter((service: VehicleServiceRecord) => {
                    // Only include services that don't have a corresponding planned maintenance
                    return !plannedRecords.some(planned => 
                        planned.vehicleEntity?.id === service.vehicleEntity?.id && 
                        planned.serviceType === service.serviceType);
                });
                
                setOverdueServices(filteredOverdueServices);
            }
        } catch (error) {
            console.error('Error fetching maintenance alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSchedule = (vehicle: any, serviceType: string) => {
        // Debug: Log what we're sending to parent
        console.log('🔍 DEBUG MaintenanceAlertBanner handleCreateSchedule:', {
            vehicleId: vehicle?.id,
            vehicleLicensePlate: vehicle?.licensePlateNumber,
            serviceTypeReceived: serviceType,
            isCodeInMap: SERVICE_TYPE_MAP[serviceType] !== undefined,
            mappedDisplayName: SERVICE_TYPE_MAP[serviceType] || 'NOT_FOUND'
        });
        
        if (onCreateSchedule && vehicle?.id) {
            onCreateSchedule(vehicle.id, serviceType);
        }
    };

    const getServiceTypeFromVehicle = (vehicle: any) => {
        if (!vehicle) return 'MAINTENANCE_PERIODIC';
        
        const today = dayjs();
        const inspectionExpiry = vehicle.inspectionExpiryDate ? dayjs(vehicle.inspectionExpiryDate) : null;
        const insuranceExpiry = vehicle.insuranceExpiryDate ? dayjs(vehicle.insuranceExpiryDate) : null;
        const maintenanceNext = vehicle.nextMaintenanceDate ? dayjs(vehicle.nextMaintenanceDate) : null;

        // Priority: Inspection > Insurance > Maintenance
        if (inspectionExpiry && (inspectionExpiry.isBefore(today) || inspectionExpiry.diff(today, 'day') <= 30)) {
            return 'INSPECTION';
        }
        if (insuranceExpiry && (insuranceExpiry.isBefore(today) || insuranceExpiry.diff(today, 'day') <= 30)) {
            return 'INSURANCE_RENEWAL';
        }
        if (maintenanceNext && (maintenanceNext.isBefore(today) || maintenanceNext.diff(today, 'day') <= 30)) {
            return 'MAINTENANCE_PERIODIC';
        }
        
        return 'MAINTENANCE_PERIODIC';
    };

    const getDaysUntilDue = (date: string) => {
        const dueDate = dayjs(date);
        const today = dayjs();
        const days = dueDate.diff(today, 'day');
        return days;
    };

    const getAlertLevel = (daysUntil: number) => {
        if (daysUntil < 0) return 'overdue'; // Quá hạn
        if (daysUntil <= 7) return 'critical'; // Đỏ - còn 7 ngày
        if (daysUntil <= 30) return 'warning'; // Vàng - còn 30 ngày
        return 'normal';
    };

    const getAlertStyle = (alertLevel: string) => {
        switch (alertLevel) {
            case 'overdue':
                return { border: 'border-red-500 bg-red-100', color: 'text-red-700', icon: 'text-red-600' };
            case 'critical':
                return { border: 'border-red-400 bg-red-50', color: 'text-red-700', icon: 'text-red-600' };
            case 'warning':
                return { border: 'border-yellow-400 bg-yellow-50', color: 'text-yellow-700', icon: 'text-yellow-600' };
            default:
                return { border: 'border-gray-300 bg-gray-50', color: 'text-gray-700', icon: 'text-gray-600' };
        }
    };

    const renderServiceItem = (service: VehicleServiceRecord, isOverdue: boolean = false) => {
        const vehicle = service.vehicleEntity;
        // Sử dụng nextServiceDate thay vì plannedDate để tính ngày còn lại
        const targetDate = service.nextServiceDate || service.plannedDate;
        const daysUntil = targetDate ? getDaysUntilDue(targetDate) : 0;
        
        // Use centralized helper function for service type display
        const serviceTypeDisplayName = getServiceTypeDisplayName(service.serviceType);
        const alertLevel = isOverdue ? 'overdue' : getAlertLevel(daysUntil);
        const alertStyle = getAlertStyle(alertLevel);

        return (
            <Card 
                key={service.id} 
                size="small" 
                className={`mb-2 ${alertStyle.border}`}
            >
                <Row align="middle" justify="space-between">
                    <Col flex="auto">
                        <Space direction="vertical" size="small" className="w-full">
                            <Space>
                                <CarOutlined className={alertStyle.icon} />
                                <Text strong>
                                    {vehicle?.licensePlateNumber || 'N/A'} - {vehicle?.model || 'N/A'}
                                </Text>
                                <Tag color={
                                    alertLevel === 'overdue' ? 'red' : 
                                    alertLevel === 'critical' ? 'red' : 
                                    alertLevel === 'warning' ? 'orange' : 'default'
                                }>
                                    {serviceTypeDisplayName}
                                </Tag>
                            </Space>
                            <Space>
                                <CalendarOutlined className={alertStyle.icon} />
                                <Text type="secondary" className={alertStyle.color}>
                                    {isOverdue 
                                        ? `Quá hạn ${Math.abs(daysUntil)} ngày` 
                                        : `Còn ${daysUntil} ngày`
                                    }
                                    {targetDate && ` (${dayjs(targetDate).format('DD/MM/YYYY')})`}
                                </Text>
                            </Space>
                        </Space>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => handleCreateSchedule(vehicle, service.serviceType || 'Bảo dưỡng định kỳ')}
                            className={
                                alertLevel === 'overdue' ? 'bg-red-600 hover:bg-red-700' :
                                alertLevel === 'critical' ? 'bg-red-500 hover:bg-red-600' :
                                alertLevel === 'warning' ? 'bg-orange-500 hover:bg-orange-600' :
                                'bg-blue-600 hover:bg-blue-700'
                            }
                        >
                            Tạo lịch ngay
                        </Button>
                    </Col>
                </Row>
            </Card>
        );
    };

    if (loading) {
        return (
            <Card className={`mb-4 ${className}`}>
                <div className="flex items-center justify-center py-4">
                    <Spin size="small" />
                    <Text className="ml-2">Đang kiểm tra lịch bảo trì...</Text>
                </div>
            </Card>
        );
    }

    // Separate services by alert level
    const criticalServices = dueSoonServices.filter(service => {
        const targetDate = service.nextServiceDate || service.plannedDate;
        const daysUntil = targetDate ? getDaysUntilDue(targetDate) : 0;
        return daysUntil <= 7 && daysUntil >= 0;
    });

    const warningServices = dueSoonServices.filter(service => {
        const targetDate = service.nextServiceDate || service.plannedDate;
        const daysUntil = targetDate ? getDaysUntilDue(targetDate) : 0;
        return daysUntil > 7 && daysUntil <= 30;
    });

    const totalAlerts = overdueServices.length + criticalServices.length + warningServices.length;

    if (!visible || totalAlerts === 0) {
        return null;
    }

    // Get filtered services based on active tab
    const getFilteredServices = () => {
        const allServices = [...overdueServices, ...criticalServices, ...warningServices];
        
        switch (activeTab) {
            case 'overdue':
                return overdueServices;
            case 'critical':
                return criticalServices;
            case 'warning':
                return warningServices;
            default:
                return allServices;
        }
    };

    const filteredServices = getFilteredServices();

    return (
        <Alert
            className={`mb-4 ${className}`}
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            banner
            message={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                        <Title level={5} className="m-0 text-orange-700 mb-0">
                            Cảnh báo bảo trì/đăng kiểm
                        </Title>
                        <Badge 
                            count={totalAlerts} 
                            showZero={false}
                            style={{ backgroundColor: '#fa8c16' }}
                        />
                    </div>
                    <Button
                        type="text"
                        size="small"
                        icon={expanded ? <CloseOutlined /> : <PlusOutlined />}
                        onClick={() => setExpanded(!expanded)}
                        className="text-orange-600 hover:text-orange-800 hover:bg-orange-50"
                        style={{ border: 'none' }}
                    >
                        {expanded ? "Thu gọn" : "Mở rộng"}
                    </Button>
                </div>
            }
            description={
                expanded && (
                    <div className="mt-4">
                        {/* Summary badges */}
                        <div className="flex flex-wrap gap-3 mb-4">
                            {overdueServices.length > 0 && (
                                <Alert
                                    type="error"
                                    showIcon
                                    icon={<ExclamationCircleOutlined />}
                                    message={
                                        <Badge 
                                            count={overdueServices.length} 
                                            color="red"
                                            text="Quá hạn"
                                        />
                                    }
                                    className="mb-0"
                                    style={{ padding: '4px 8px' }}
                                />
                            )}
                            {criticalServices.length > 0 && (
                                <Alert
                                    type="error"
                                    showIcon
                                    icon={<CalendarOutlined />}
                                    message={
                                        <Badge 
                                            count={criticalServices.length} 
                                            color="red"
                                            text="Gấp (≤7 ngày)"
                                        />
                                    }
                                    className="mb-0"
                                    style={{ padding: '4px 8px' }}
                                />
                            )}
                            {warningServices.length > 0 && (
                                <Alert
                                    type="warning"
                                    showIcon
                                    icon={<CalendarOutlined />}
                                    message={
                                        <Badge 
                                            count={warningServices.length} 
                                            color="orange"
                                            text="Cảnh báo (8-30 ngày)"
                                        />
                                    }
                                    className="mb-0"
                                    style={{ padding: '4px 8px' }}
                                />
                            )}
                        </div>

                        {/* Tabs for filtering */}
                        <Tabs 
                            activeKey={activeTab} 
                            onChange={setActiveTab}
                            size="small"
                            className="mb-4"
                            items={[
                                {
                                    key: 'all',
                                    label: (
                                        <Badge count={totalAlerts} size="small" offset={[10, 0]}>
                                            <span>Tất cả</span>
                                        </Badge>
                                    ),
                                },
                                {
                                    key: 'overdue',
                                    label: (
                                        <Badge count={overdueServices.length} size="small" offset={[10, 0]} color="red">
                                            <span>Quá hạn</span>
                                        </Badge>
                                    ),
                                },
                                {
                                    key: 'critical',
                                    label: (
                                        <Badge count={criticalServices.length} size="small" offset={[10, 0]} color="red">
                                            <span>Gấp</span>
                                        </Badge>
                                    ),
                                },
                                {
                                    key: 'warning',
                                    label: (
                                        <Badge count={warningServices.length} size="small" offset={[10, 0]} color="orange">
                                            <span>Cảnh báo</span>
                                        </Badge>
                                    ),
                                },
                            ]}
                        />

                        {/* Service items */}
                        {filteredServices.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded-lg">
                                <CalendarOutlined className="text-2xl text-gray-400 mb-2" />
                                <Text type="secondary" className="block">
                                    Không có xe nào cần bảo trì/đăng kiểm
                                </Text>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredServices.slice(0, 5).map(service => {
                                    const isOverdue = overdueServices.includes(service);
                                    return (
                                        <Alert
                                            key={service.id}
                                            type={isOverdue ? 'error' : 'warning'}
                                            showIcon
                                            icon={<CarOutlined />}
                                            message={
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <Text strong>
                                                            {service.vehicleEntity?.licensePlateNumber || 'N/A'} - {service.vehicleEntity?.model || 'N/A'}
                                                        </Text>
                                                        <Tag color={
                                                            isOverdue ? 'red' : 
                                                            getAlertLevel(getDaysUntilDue(service.nextServiceDate || service.plannedDate || '')) === 'critical' ? 'red' : 
                                                            'orange'
                                                        }>
                                                            {getServiceTypeDisplayName(service.serviceType)}
                                                        </Tag>
                                                    </div>
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        icon={<PlusOutlined />}
                                                        onClick={() => handleCreateSchedule(service.vehicleEntity, service.serviceType || 'Bảo dưỡng định kỳ')}
                                                        className={
                                                            isOverdue ? 'bg-red-600 hover:bg-red-700' :
                                                            getAlertLevel(getDaysUntilDue(service.nextServiceDate || service.plannedDate || '')) === 'critical' ? 'bg-red-500 hover:bg-red-600' :
                                                            'bg-orange-500 hover:bg-orange-600'
                                                        }
                                                    >
                                                        Tạo lịch ngay
                                                    </Button>
                                                </div>
                                            }
                                            description={
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <CalendarOutlined />
                                                    <Text>
                                                        {(() => {
                                                            const targetDate = service.nextServiceDate || service.plannedDate;
                                                            const daysUntil = targetDate ? getDaysUntilDue(targetDate) : 0;
                                                            const displayDays = Math.abs(daysUntil);
                                                            return (
                                                                <span>
                                                                    {isOverdue ? (
                                                                        <>
                                                                            Quá hạn <strong>{displayDays}</strong> ngày
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            Còn <strong>{displayDays}</strong> ngày
                                                                        </>
                                                                    )}
                                                                    {targetDate && ` (${dayjs(targetDate).format('DD/MM/YYYY')})`}
                                                                </span>
                                                            );
                                                        })()}
                                                    </Text>
                                                </div>
                                            }
                                        />
                                    );
                                })}
                                {filteredServices.length > 5 && (
                                    <Text type="secondary" className="block mt-3 text-center">
                                        Và {filteredServices.length - 5} xe khác...
                                    </Text>
                                )}
                            </div>
                        )}
                    </div>
                )
            }
        />
    );
};

export default MaintenanceAlertBanner;
