import React, { useEffect } from 'react';
import {
    Modal,
    Button,
    Descriptions,
    Divider,
    Card,
    Badge,
    Tag,
    Image,
    Space,
    Typography,
    Flex,
    Collapse,
    Avatar,
    Tooltip
} from 'antd';
import type { BadgeProps } from 'antd';
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    IdcardOutlined,
    CarOutlined,
    CalendarOutlined,
    ExclamationCircleOutlined,
    CameraOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Penalty, VehicleAssignmentSummary, DriverSummary } from '@/models/Penalty';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface PenaltyModalProps {
    visible: boolean;
    onCancel: () => void;
    penalty: Penalty | null;
}

const PenaltyModal: React.FC<PenaltyModalProps> = ({
    visible,
    onCancel,
    penalty
}) => {

    const translateRoleName = (roleName?: string) => {
        if (!roleName) return undefined;
        const key = roleName.toUpperCase();
        switch (key) {
            case 'ADMIN':
                return 'Quản trị hệ thống';
            case 'STAFF':
                return 'Nhân viên vận hành';
            case 'DRIVER':
                return 'Tài xế';
            case 'CUSTOMER':
                return 'Khách hàng';
            default:
                return roleName;
        }
    };

    const translateUserStatus = (status?: string) => {
        if (!status) return undefined;
        const key = status.toUpperCase();
        switch (key) {
            case 'ACTIVE':
                return 'Đang hoạt động';
            case 'INACTIVE':
                return 'Không hoạt động';
            case 'LOCKED':
                return 'Đã khóa tài khoản';
            default:
                return status;
        }
    };

    const translateDriverStatus = (status?: string) => {
        if (!status) return undefined;
        const key = status.toUpperCase();
        switch (key) {
            case 'ACTIVE':
                return 'Đang lái';
            case 'INACTIVE':
                return 'Ngưng hoạt động';
            case 'SUSPENDED':
                return 'Tạm dừng';
            default:
                return status;
        }
    };

    const getViolationSeverity = (violationType: string) => {
        const seriousViolations = ['Vượt tốc độ', 'Đi ngược chiều', 'Uống rượu bia', 'Đi sai làn'];
        return seriousViolations.some(type => violationType.toLowerCase().includes(type.toLowerCase()))
            ? 'error'
            : 'warning';
    };

    const renderDriverInfo = (driver: {
        id?: string;
        name?: string;
        phone?: string;
        licenseNumber?: string;
    }, driverLabel: string) => {
        if (!driver.name) return null;
        
        return (
            <Card 
                size="small" 
                className="mb-3"
                title={
                    <Space>
                        <Avatar icon={<UserOutlined />} size="small" />
                        <Text strong>{driverLabel}</Text>
                    </Space>
                }
            >
                <Space direction="vertical" size="small" className="w-full">
                    <Flex justify="space-between" align="center">
                        <Text type="secondary">Họ tên:</Text>
                        <Text strong>{driver.name}</Text>
                    </Flex>
                    {driver.phone && (
                        <Flex justify="space-between" align="center">
                            <Space>
                                <PhoneOutlined className="text-gray-400" />
                                <Text type="secondary">SĐT:</Text>
                            </Space>
                            <Text>{driver.phone}</Text>
                        </Flex>
                    )}
                    {driver.licenseNumber && (
                        <Flex justify="space-between" align="center">
                            <Space>
                                <IdcardOutlined className="text-gray-400" />
                                <Text type="secondary">Số GPLX:</Text>
                            </Space>
                            <Text>{driver.licenseNumber}</Text>
                        </Flex>
                    )}
                </Space>
            </Card>
        );
    };

    const renderVehicleAssignment = (vehicleAssignment: VehicleAssignmentSummary) => {
        const getStatusColor = (status?: string): BadgeProps['status'] => {
            if (!status) return 'default';

            const statusMap: { [key: string]: BadgeProps['status'] } = {
                ACTIVE: 'processing',
                COMPLETED: 'success',
                CANCELLED: 'error',
                PENDING: 'warning'
            };

            return statusMap[status.toUpperCase()] ?? 'default';
        };

        return (
            <Card 
                title={
                    <Space>
                        <CarOutlined className="text-blue-600" />
                        <Text strong>Thông tin chuyến xe</Text>
                    </Space>
                }
                className="mb-4"
            >
                <Descriptions column={2} size="small">
                    <Descriptions.Item label="Mã chuyến xe">
                        <Tag color="blue">{vehicleAssignment.trackingCode}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái chuyến">
                        <Badge status={getStatusColor(vehicleAssignment.status)} text={vehicleAssignment.status} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Biển số xe">
                        <Text strong className="text-blue-600">{vehicleAssignment.vehiclePlateNumber}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại xe">
                        <Tag color="green">{vehicleAssignment.vehicleTypeDescription}</Tag>
                    </Descriptions.Item>
                    {vehicleAssignment.description && (
                        <Descriptions.Item label="Mô tả chuyến" span={2}>
                            <Text italic>{vehicleAssignment.description}</Text>
                        </Descriptions.Item>
                    )}
                </Descriptions>

                <Divider className="my-4">
                    <Text type="secondary">Thông tin tài xế</Text>
                </Divider>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {renderDriverInfo(
                        {
                            id: vehicleAssignment.driver1Id,
                            name: vehicleAssignment.driver1Name,
                            phone: vehicleAssignment.driver1Phone,
                            licenseNumber: vehicleAssignment.driver1LicenseNumber
                        },
                        "Tài xế chính"
                    )}
                    {renderDriverInfo(
                        {
                            id: vehicleAssignment.driver2Id,
                            name: vehicleAssignment.driver2Name,
                            phone: vehicleAssignment.driver2Phone,
                            licenseNumber: vehicleAssignment.driver2LicenseNumber
                        },
                        "Tài xế phụ"
                    )}
                </div>
            </Card>
        );
    };

    const renderDriverSummary = (driver?: DriverSummary) => {
        if (!driver) return null;

        const roleLabel = translateRoleName(driver.roleName);
        const userStatusLabel = translateUserStatus(driver.userStatus);
        const driverStatusLabel = translateDriverStatus(driver.driverStatus);

        const getUserStatusColor = (status?: string): BadgeProps['status'] => {
            if (!status) return 'default';

            const statusMap: { [key: string]: BadgeProps['status'] } = {
                ACTIVE: 'success',
                INACTIVE: 'default',
                LOCKED: 'error'
            };

            return statusMap[status.toUpperCase()] ?? 'default';
        };

        const getDriverStatusColor = (status?: string): BadgeProps['status'] => {
            if (!status) return 'default';

            const statusMap: { [key: string]: BadgeProps['status'] } = {
                ACTIVE: 'processing',
                INACTIVE: 'default',
                SUSPENDED: 'warning'
            };

            return statusMap[status.toUpperCase()] ?? 'default';
        };

        return (
            <>
                <Card 
                    title={
                        <Space>
                            <UserOutlined className="text-blue-600" />
                            <Text strong>Thông tin tài xế</Text>
                        </Space>
                    }
                    className="mb-4"
                >
                    <Descriptions column={2} size="small">
                        <Descriptions.Item label="Họ tên">
                            <Text strong className="text-lg">{driver.fullName}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên đăng nhập">
                            <Text code>{driver.username}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="SĐT">
                            <Space>
                                <PhoneOutlined className="text-green-600" />
                                <Text>{driver.phoneNumber}</Text>
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            <Space>
                                <MailOutlined className="text-blue-600" />
                                <Text>{driver.email}</Text>
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Vai trò">
                            <Tag color="blue">{roleLabel}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái tài khoản">
                            <Badge status={getUserStatusColor(driver.userStatus)} text={userStatusLabel} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày sinh" span={2}>
                            <Space>
                                <CalendarOutlined className="text-gray-400" />
                                <Text>{driver.dateOfBirth ? dayjs(driver.dateOfBirth).format('DD/MM/YYYY') : 'N/A'}</Text>
                            </Space>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Collapse className="mb-4" ghost>
                    <Panel 
                        header={
                            <Space>
                                <IdcardOutlined className="text-orange-600" />
                                <Text strong>Thông tin GPLX</Text>
                                <InfoCircleOutlined className="text-gray-400" />
                            </Space>
                        } 
                        key="license"
                    >
                        <Descriptions column={2} size="small" className="px-4">
                            <Descriptions.Item label="Số GPLX">
                                <Text strong copyable className="text-blue-600">{driver.driverLicenseNumber}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Hạng GPLX">
                                <Tag color="orange">{driver.licenseClass}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="CMND/CCCD">
                                <Text code>{driver.identityNumber}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số thẻ">
                                <Text code>{driver.cardSerialNumber}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Nơi cấp" span={2}>
                                <Text>{driver.placeOfIssue}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày cấp">
                                <Space>
                                    <CalendarOutlined className="text-gray-400" />
                                    <Text>{driver.dateOfIssue ? dayjs(driver.dateOfIssue).format('DD/MM/YYYY') : 'N/A'}</Text>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày hết hạn">
                                <Space>
                                    <ExclamationCircleOutlined className="text-orange-500" />
                                    <Text type={driver.dateOfExpiry && dayjs(driver.dateOfExpiry).isBefore(dayjs()) ? 'danger' : 'secondary'}>
                                        {driver.dateOfExpiry ? dayjs(driver.dateOfExpiry).format('DD/MM/YYYY') : 'N/A'}
                                    </Text>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày sát hạch" span={2}>
                                <Text>{driver.dateOfPassing ? dayjs(driver.dateOfPassing).format('DD/MM/YYYY') : 'N/A'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái lái xe" span={2}>
                                <Badge status={getDriverStatusColor(driver.driverStatus)} text={driverStatusLabel} />
                            </Descriptions.Item>
                        </Descriptions>
                    </Panel>
                </Collapse>
            </>
        );
    };

    // Render view mode
    if (penalty) {
        return (
            <Modal
                title={
                    <Space>
                        <ExclamationCircleOutlined className="text-red-500" />
                        <Title level={4} className="m-0">Chi tiết vi phạm</Title>
                    </Space>
                }
                open={visible}
                onCancel={onCancel}
                footer={[
                    <Button key="back" onClick={onCancel} size="large">
                        Đóng
                    </Button>
                ]}
                width={1000}
                styles={{
                    body: { padding: '24px' },
                    header: { borderBottom: '2px solid #f0f0f0' }
                }}
            >
                <Space direction="vertical" size="large" className="w-full">
                    {/* Penalty Information Card */}
                    <Card 
                        title={
                            <Space>
                                <ExclamationCircleOutlined className="text-red-500" />
                                <Text strong>Thông tin vi phạm</Text>
                            </Space>
                        }
                        className="shadow-sm"
                    >
                        <Descriptions column={2} size="small">
                            <Descriptions.Item label="Loại vi phạm">
                                <Tag color={getViolationSeverity(penalty.violationType)}>
                                    {penalty.violationType}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày vi phạm">
                                <Space>
                                    <CalendarOutlined className="text-blue-600" />
                                    <Text>{dayjs(penalty.penaltyDate).format('DD/MM/YYYY')}</Text>
                                </Space>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Driver Information */}
                    {renderDriverSummary(penalty.driverSummary)}

                    {/* Violation Image */}
                    {penalty.trafficViolationRecordImageUrl && (
                        <Card 
                            title={
                                <Space>
                                    <CameraOutlined className="text-green-600" />
                                    <Text strong>Hình ảnh vi phạm</Text>
                                </Space>
                            }
                            className="shadow-sm"
                        >
                            <Image.PreviewGroup
                                preview={{
                                    countRender: (current, total) => `${current} / ${total}`,
                                }}
                            >
                                <Image
                                    src={penalty.trafficViolationRecordImageUrl}
                                    alt="Hình ảnh vi phạm"
                                    className="rounded-lg"
                                    style={{ 
                                        maxWidth: '300px', 
                                        maxHeight: '300px', 
                                        objectFit: 'cover',
                                        border: '1px solid #d9d9d9'
                                    }}
                                    placeholder={
                                        <div className="flex items-center justify-center h-48 bg-gray-100 rounded">
                                            <Space direction="vertical" align="center">
                                                <CameraOutlined className="text-4xl text-gray-400" />
                                                <Text type="secondary">Đang tải hình ảnh...</Text>
                                            </Space>
                                        </div>
                                    }
                                />
                            </Image.PreviewGroup>
                        </Card>
                    )}
                    
                    {/* Vehicle Assignment Information */}
                    {penalty.vehicleAssignment ? (
                        renderVehicleAssignment(penalty.vehicleAssignment)
                    ) : (
                        <Card 
                            title={
                                <Space>
                                    <InfoCircleOutlined className="text-orange-500" />
                                    <Text strong>Thông tin tham chiếu</Text>
                                </Space>
                            }
                            className="shadow-sm bg-orange-50"
                        >
                            <Descriptions column={2} size="small">
                                <Descriptions.Item label="ID Tài xế">
                                    <Text code copyable>{penalty.driverId}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="ID Phân công xe">
                                    <Text code copyable>{penalty.vehicleAssignmentId}</Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    )}
                </Space>
            </Modal>
        );
    }

    return null;
};

export default PenaltyModal; 