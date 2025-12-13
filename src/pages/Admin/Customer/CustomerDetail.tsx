import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { App, Typography, Card, Tabs, Button, Descriptions, Row, Col, Avatar, Divider, Tag, Skeleton } from 'antd';
import {
    ShopOutlined,
    HomeOutlined,
    BankOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    ManOutlined,
    WomanOutlined,
    CalendarOutlined,
    IdcardOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
    StopOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService from '../../../services/user';
import customerService from '../../../services/customer/customerService';
import type { UserModel } from '../../../services/user/types';
import type { Customer } from '../../../models/Customer';
import { format } from 'date-fns';
import { UserStatusEnum } from '@/constants/enums';
import { UserStatusTag } from '@/components/common/tags';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const CustomerDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { message } = App.useApp();
    const queryClient = useQueryClient();
    const [customerData, setCustomerData] = useState<Customer | null>(null);
    const [customerLoading, setCustomerLoading] = useState<boolean>(false);

    // Lấy thông tin user
    const { data: userData, isLoading: userLoading, error: userError } = useQuery({
        queryKey: ['user', id],
        queryFn: () => userService.getUserById(id as string),
        enabled: !!id
    });

    // Lấy thông tin customer khi có userData
    useEffect(() => {
        const fetchCustomerData = async () => {
            if (userData && id) {
                try {
                    setCustomerLoading(true);
                    const customerInfo = await customerService.getCustomerProfile(id);
                    setCustomerData(customerInfo);
                } catch (err) {
                    console.error('Error fetching customer data:', err);
                } finally {
                    setCustomerLoading(false);
                }
            }
        };

        fetchCustomerData();
    }, [userData, id]);

    const updateStatusMutation = useMutation({
        mutationFn: ({ status }: { status: string }) => {
            if (!customerData) {
                throw new Error('Customer data not loaded');
            }
            return customerService.updateCustomerStatus(customerData.id, status);
        },
        onSuccess: (updatedCustomer: Customer) => {
            // Cập nhật lại state local để UI phản ánh ngay trạng thái mới
            setCustomerData(updatedCustomer);

            message.success('Cập nhật trạng thái khách hàng thành công');
            queryClient.invalidateQueries({ queryKey: ['user', id] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
        onError: () => {
            message.error('Cập nhật trạng thái khách hàng thất bại');
        }
    });

    const handleStatusChange = (newStatus: string) => {
        updateStatusMutation.mutate({ status: newStatus });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'green';
            case 'inactive':
                return 'default';

            case 'banned':
                return 'red';
            default:
                return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'Hoạt động';
            case 'inactive':
                return 'Không hoạt động';

            case 'banned':
                return 'Bị cấm';
            default:
                return status;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (error) {
            return dateString;
        }
    };

    // Render skeleton loading
    const renderSkeletonLoading = () => {
        const currentStatus = (customerData?.status || '').toLowerCase();

        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                {/* Breadcrumb skeleton */}
                <div className="mb-4">
                    <Skeleton.Input style={{ width: 300 }} active size="small" />
                </div>

                {/* Header skeleton */}
                <div className="flex items-center mb-6">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/admin/customers')}
                        className="mr-4"
                    >
                        Quay lại
                    </Button>
                    <Skeleton.Input style={{ width: 300 }} active size="large" />
                </div>

                {/* Content skeleton */}
                <Row gutter={24}>
                    {/* Left card skeleton */}
                    <Col xs={24} lg={8}>
                        <Card className="shadow-sm mb-6">
                            <div className="flex flex-col items-center mb-4">
                                <Skeleton.Avatar active size={80} className="mb-4" />
                                <Skeleton.Input style={{ width: 150 }} active size="default" className="mb-2" />
                                <Skeleton.Input style={{ width: 100 }} active size="small" />
                            </div>
                            <Divider />
                            <Skeleton active paragraph={{ rows: 6 }} />
                        </Card>
                    </Col>

                    {/* Right card skeleton */}
                    <Col xs={24} lg={16}>
                        <Card className="shadow-sm">
                            <Skeleton.Input style={{ width: 200 }} active size="small" className="mb-4" />
                            <Tabs defaultActiveKey="1">
                                <TabPane tab="Thông tin doanh nghiệp" key="1">
                                    <Skeleton active paragraph={{ rows: 8 }} />
                                </TabPane>
                            </Tabs>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    // Hiển thị loading khi đang tải dữ liệu
    const isLoading = userLoading || customerLoading;
    if (isLoading) {
        return renderSkeletonLoading();
    }

    if (userError) {
        return (
            <div className="p-6 flex flex-col items-center justify-center h-64">
                <Text type="danger" className="text-xl mb-4">Đã xảy ra lỗi khi tải dữ liệu</Text>
                <Button type="primary" onClick={() => navigate('/admin/customers')} className="bg-blue-600 hover:bg-blue-700">
                    Quay lại danh sách khách hàng
                </Button>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="p-6 flex flex-col items-center justify-center h-64">
                <Text className="text-xl mb-4">Không tìm thấy thông tin khách hàng</Text>
                <Button type="primary" onClick={() => navigate('/admin/customers')}>
                    Quay lại danh sách khách hàng
                </Button>
            </div>
        );
    }

    const currentStatus = (customerData?.status || userData.status || '').toLowerCase();

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-4">
                <div className="flex items-center mb-1">
                    <Button
                        icon={<HomeOutlined />}
                        type="link"
                        onClick={() => navigate('/')}
                        className="p-0 mr-1"
                    />
                    <span className="text-gray-400 mx-1">/</span>
                    <Button
                        icon={<ShopOutlined />}
                        type="link"
                        onClick={() => navigate('/admin/customers')}
                        className="p-0 mr-1"
                    >
                        Quản lý khách hàng
                    </Button>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-gray-600">{userData.fullName}</span>
                </div>
            </div>

            <div className="flex items-center mb-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/admin/customers')}
                    className="mr-4"
                >
                    Quay lại
                </Button>
                <Title level={2} className="m-0 flex items-center">
                    <ShopOutlined className="mr-3 text-blue-500" />
                    Chi tiết khách hàng
                </Title>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col items-center text-center mb-6">
                            <Avatar
                                src={userData.imageUrl}
                                size={120}
                                icon={<ShopOutlined />}
                                className="mb-4 border-4 border-blue-100"
                            />
                            <Title level={3} className="mb-1">{userData.fullName}</Title>
                            <UserStatusTag status={(currentStatus.toUpperCase() || userData.status) as UserStatusEnum} />
                        </div>

                        <Divider className="my-4" />

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <MailOutlined className="text-blue-500 mr-3" />
                                <div>
                                    <Text type="secondary" className="block text-sm">Email</Text>
                                    <Text>{userData.email}</Text>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <PhoneOutlined className="text-blue-500 mr-3" />
                                <div>
                                    <Text type="secondary" className="block text-sm">Số điện thoại</Text>
                                    <Text>{userData.phoneNumber}</Text>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <UserOutlined className="text-blue-500 mr-3" />
                                <div>
                                    <Text type="secondary" className="block text-sm">Tên đăng nhập</Text>
                                    <Text>{userData.username}</Text>
                                </div>
                            </div>

                            <div className="flex items-center">
                                {userData.gender ? (
                                    <ManOutlined className="text-blue-500 mr-3" />
                                ) : (
                                    <WomanOutlined className="text-pink-500 mr-3" />
                                )}
                                <div>
                                    <Text type="secondary" className="block text-sm">Giới tính</Text>
                                    <Text>{userData.gender ? 'Nam' : 'Nữ'}</Text>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <CalendarOutlined className="text-blue-500 mr-3" />
                                <div>
                                    <Text type="secondary" className="block text-sm">Ngày sinh</Text>
                                    <Text>{formatDate(userData.dateOfBirth)}</Text>
                                </div>
                            </div>
                        </div>

                        <Divider className="my-4" />

                        <div className="flex justify-center">
                            {currentStatus === 'active' ? (
                                <Button
                                    danger
                                    icon={<StopOutlined />}
                                    onClick={() => handleStatusChange('INACTIVE')}

                                    size="large"
                                    className="w-full"
                                    loading={updateStatusMutation.isPending}
                                    disabled={updateStatusMutation.isPending}
                                >
                                    {updateStatusMutation.isPending ? 'Đang cập nhật...' : 'Vô hiệu hóa'}
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => handleStatusChange('ACTIVE')}
                                    size="large"
                                    className="w-full bg-green-500 hover:bg-green-600"
                                    loading={updateStatusMutation.isPending}
                                    disabled={updateStatusMutation.isPending}
                                >
                                    {updateStatusMutation.isPending ? 'Đang cập nhật...' : 'Kích hoạt'}
                                </Button>
                            )}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow mb-6">
                        <Tabs defaultActiveKey="company">
                            <TabPane
                                tab={
                                    <div className="flex items-center">
                                        <BankOutlined className="mr-2" />
                                        <span>Thông tin doanh nghiệp</span>
                                    </div>
                                }
                                key="company"
                            >
                                {customerLoading ? (
                                    <div className="py-8 flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : customerData ? (
                                    <Row gutter={[24, 16]}>
                                        <Col xs={24} md={12}>
                                            <Card className="bg-gray-50 border-0" size="small">
                                                <div className="flex items-center mb-2">
                                                    <BankOutlined className="text-blue-500 mr-2" />
                                                    <Text strong>Tên công ty</Text>
                                                </div>
                                                <Text className="text-lg">{customerData.companyName}</Text>
                                            </Card>
                                        </Col>

                                        <Col xs={24} md={12}>
                                            <Card className="bg-gray-50 border-0" size="small">
                                                <div className="flex items-center mb-2">
                                                    <IdcardOutlined className="text-blue-500 mr-2" />
                                                    <Text strong>Mã số doanh nghiệp</Text>
                                                </div>
                                                <Text className="text-lg">{customerData.businessLicenseNumber}</Text>
                                            </Card>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Card className="bg-gray-50 border-0" size="small">
                                                <div className="flex items-center mb-2">
                                                    <UserOutlined className="text-blue-500 mr-2" />
                                                    <Text strong>Người đại diện</Text>
                                                </div>
                                                <Text className="text-lg">{customerData.representativeName}</Text>
                                            </Card>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Card className="bg-gray-50 border-0" size="small">
                                                <div className="flex items-center mb-2">
                                                    <PhoneOutlined className="text-blue-500 mr-2" />
                                                    <Text strong>Số điện thoại đại diện</Text>
                                                </div>
                                                <Text className="text-lg">{customerData.representativePhone}</Text>
                                            </Card>
                                        </Col>
                                        <Col xs={24}>
                                            <Card className="bg-gray-50 border-0" size="small">
                                                <div className="flex items-center mb-2">
                                                    <EnvironmentOutlined className="text-blue-500 mr-2" />
                                                    <Text strong>Địa chỉ doanh nghiệp</Text>
                                                </div>
                                                <Text className="text-lg">{customerData.businessAddress}</Text>
                                            </Card>
                                        </Col>
                                    </Row>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Text type="secondary">Không tìm thấy thông tin doanh nghiệp</Text>
                                    </div>
                                )}
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default CustomerDetail; 