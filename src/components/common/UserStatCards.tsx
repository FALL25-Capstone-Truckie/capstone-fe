import React from 'react';
import { Card, Typography, Skeleton, Row, Col } from 'antd';
import {
    CheckCircleOutlined,
    StopOutlined,
    DeleteOutlined,
    ClockCircleOutlined,
    LockOutlined
} from '@ant-design/icons';
import { UserStatusEnum, UserStatusLabels } from '../../constants/enums/UserStatusEnum';

const { Text } = Typography;

interface User {
    id: string;
    status: string;
    [key: string]: any;
}

interface UserStatCardsProps {
    users: User[];
    loading: boolean;
    userType?: 'customer' | 'staff' | 'driver';
}

interface StatCardConfig {
    status: UserStatusEnum;
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
}

const statCardConfigs: StatCardConfig[] = [
    {
        status: UserStatusEnum.ACTIVE,
        label: UserStatusLabels[UserStatusEnum.ACTIVE],
        icon: <CheckCircleOutlined />,
        color: '#22c55e',
        bgColor: '#f0fdf4',
        borderColor: '#22c55e'
    },
    {
        status: UserStatusEnum.INACTIVE,
        label: UserStatusLabels[UserStatusEnum.INACTIVE],
        icon: <StopOutlined />,
        color: '#6b7280',
        bgColor: '#f9fafb',
        borderColor: '#6b7280'
    },
    {
        status: UserStatusEnum.OTP_PENDING,
        label: UserStatusLabels[UserStatusEnum.OTP_PENDING],
        icon: <ClockCircleOutlined />,
        color: '#eab308',
        bgColor: '#fefce8',
        borderColor: '#eab308'
    },
    {
        status: UserStatusEnum.BANNED,
        label: UserStatusLabels[UserStatusEnum.BANNED],
        icon: <LockOutlined />,
        color: '#ef4444',
        bgColor: '#fef2f2',
        borderColor: '#ef4444'
    },
    {
        status: UserStatusEnum.DELETED,
        label: UserStatusLabels[UserStatusEnum.DELETED],
        icon: <DeleteOutlined />,
        color: '#1f2937',
        bgColor: '#f3f4f6',
        borderColor: '#1f2937'
    }
];

const CARD_MIN_HEIGHT = 80;

const UserStatCards: React.FC<UserStatCardsProps> = ({ users, loading, userType = 'customer' }) => {
    const getCountByStatus = (status: UserStatusEnum): number => {
        return users.filter(user => 
            user.status?.toUpperCase() === status
        ).length;
    };

    const getUserTypeLabel = (): string => {
        switch (userType) {
            case 'customer':
                return 'khách hàng';
            case 'staff':
                return 'nhân viên';
            case 'driver':
                return 'tài xế';
            default:
                return 'người dùng';
        }
    };

    if (loading) {
        return (
            <Row gutter={[12, 12]} className="mb-6">
                {statCardConfigs.map((config, index) => (
                    <Col xs={12} sm={8} md={6} lg={4} xl={4} key={index}>
                        <Card 
                            className="shadow-sm" 
                            bodyStyle={{ padding: '12px 16px', minHeight: CARD_MIN_HEIGHT }}
                        >
                            <Skeleton active paragraph={{ rows: 1 }} />
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    }

    return (
        <Row gutter={[12, 12]} className="mb-6">
            {statCardConfigs.map((config) => {
                const count = getCountByStatus(config.status);
                return (
                    <Col xs={12} sm={8} md={6} lg={4} xl={4} key={config.status}>
                        <Card
                            className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            style={{
                                borderLeft: `4px solid ${config.borderColor}`,
                                backgroundColor: config.bgColor
                            }}
                            bodyStyle={{ 
                                padding: '12px 16px', 
                                minHeight: CARD_MIN_HEIGHT,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex-1 min-w-0">
                                    <Text type="secondary" className="text-xs block mb-1 truncate">
                                        {config.label}
                                    </Text>
                                    <div className="flex items-center gap-2">
                                        <Text 
                                            strong 
                                            style={{ 
                                                fontSize: '20px', 
                                                color: config.color,
                                                lineHeight: 1
                                            }}
                                        >
                                            {count}
                                        </Text>
                                        <Text className="text-xs text-gray-500 truncate">
                                            {getUserTypeLabel()}
                                        </Text>
                                    </div>
                                </div>
                                <div
                                    className="text-2xl flex-shrink-0 ml-2"
                                    style={{ color: config.color }}
                                >
                                    {config.icon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
};

export default UserStatCards;
