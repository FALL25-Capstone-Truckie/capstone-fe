import React, { useState } from 'react';
import { Alert, List, Avatar, Button, Tag, Typography, Pagination, Space } from 'antd';
import {
    UserOutlined,
    WarningOutlined,
    ExclamationCircleOutlined,
    EditOutlined,
    PhoneOutlined,
    IdcardOutlined
} from '@ant-design/icons';
import type { DriverModel } from '../../../../services/driver';
import { getDaysUntilExpiry, getLicenseExpiryWarningLevel } from '@/utils/licenseClassHelper';

const { Text } = Typography;

interface LicenseExpiryWarningListProps {
    expiredDrivers: DriverModel[];
    criticalDrivers: DriverModel[];
    warningDrivers: DriverModel[];
    onRenewLicense: (driver: DriverModel) => void;
    formatDate: (dateString: string) => string;
}

const PAGE_SIZE = 3;

const LicenseExpiryWarningList: React.FC<LicenseExpiryWarningListProps> = ({
    expiredDrivers,
    criticalDrivers,
    warningDrivers,
    onRenewLicense,
    formatDate
}) => {
    const [expiredPage, setExpiredPage] = useState(1);
    const [criticalPage, setCriticalPage] = useState(1);
    const [warningPage, setWarningPage] = useState(1);

    const renderDriverItem = (driver: DriverModel, type: 'expired' | 'critical' | 'warning') => {
        const daysUntil = getDaysUntilExpiry(driver.dateOfExpiry);
        const tagColor = type === 'expired' ? 'red' : type === 'critical' ? 'orange' : 'gold';
        const tagText = type === 'expired' 
            ? `Hết hạn ${Math.abs(daysUntil)} ngày trước`
            : `Còn ${daysUntil} ngày`;

        return (
            <List.Item
                key={driver.id}
                className="bg-white rounded-lg mb-2 px-4 py-3 border border-gray-100"
                actions={[
                    <Button
                        key="renew"
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => onRenewLicense(driver)}
                        className={type === 'expired' ? 'bg-red-500 hover:bg-red-600' : type === 'critical' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-yellow-500 hover:bg-yellow-600'}
                    >
                        Gia hạn
                    </Button>
                ]}
            >
                <List.Item.Meta
                    avatar={
                        <Avatar
                            src={driver.userResponse.imageUrl}
                            icon={<UserOutlined />}
                            size={48}
                            className="border-2 border-gray-200"
                        />
                    }
                    title={
                        <div className="flex items-center gap-2 flex-wrap">
                            <Text strong className="text-base">{driver.userResponse.fullName}</Text>
                            <Tag color={tagColor} className="m-0">{tagText}</Tag>
                        </div>
                    }
                    description={
                        <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center gap-4 text-gray-500 text-sm flex-wrap">
                                <span className="flex items-center gap-1">
                                    <PhoneOutlined /> {driver.userResponse.phoneNumber}
                                </span>
                                <span className="flex items-center gap-1">
                                    <IdcardOutlined /> {driver.driverLicenseNumber}
                                </span>
                            </div>
                            <Text type="secondary" className="text-sm">
                                Hạn bằng lái: <Text strong type={type === 'expired' ? 'danger' : 'warning'}>{formatDate(driver.dateOfExpiry)}</Text>
                            </Text>
                        </div>
                    }
                />
            </List.Item>
        );
    };

    const renderSection = (
        drivers: DriverModel[],
        type: 'expired' | 'critical' | 'warning',
        currentPage: number,
        setPage: (page: number) => void
    ) => {
        if (drivers.length === 0) return null;

        const alertType = type === 'expired' ? 'error' : type === 'critical' ? 'error' : 'warning';
        const icon = type === 'expired' || type === 'critical' ? <ExclamationCircleOutlined /> : <WarningOutlined />;
        const title = type === 'expired'
            ? `${drivers.length} tài xế có bằng lái đã hết hạn`
            : type === 'critical'
                ? `${drivers.length} tài xế có bằng lái sắp hết hạn (còn dưới 1 tuần)`
                : `${drivers.length} tài xế có bằng lái sắp hết hạn (còn dưới 2 tháng)`;

        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const paginatedDrivers = drivers.slice(startIndex, endIndex);

        return (
            <Alert
                key={type}
                message={title}
                description={
                    <div className="mt-3">
                        <List
                            dataSource={paginatedDrivers}
                            renderItem={(driver) => renderDriverItem(driver, type)}
                            className="bg-transparent"
                        />
                        {drivers.length > PAGE_SIZE && (
                            <div className="flex justify-center mt-3">
                                <Pagination
                                    current={currentPage}
                                    pageSize={PAGE_SIZE}
                                    total={drivers.length}
                                    onChange={setPage}
                                    size="small"
                                    showSizeChanger={false}
                                    showTotal={(total, range) => `${range[0]}-${range[1]} / ${total} tài xế`}
                                />
                            </div>
                        )}
                    </div>
                }
                type={alertType}
                showIcon
                icon={icon}
                className="mb-4"
            />
        );
    };

    const hasAnyWarnings = expiredDrivers.length > 0 || criticalDrivers.length > 0 || warningDrivers.length > 0;

    if (!hasAnyWarnings) return null;

    return (
        <div className="mb-4">
            {renderSection(expiredDrivers, 'expired', expiredPage, setExpiredPage)}
            {renderSection(criticalDrivers, 'critical', criticalPage, setCriticalPage)}
            {renderSection(warningDrivers, 'warning', warningPage, setWarningPage)}
        </div>
    );
};

export default LicenseExpiryWarningList;
