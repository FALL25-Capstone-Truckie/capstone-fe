import React, { useState } from 'react';
import { Card, Button, App, Typography, Breadcrumb, Result, Alert, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, HomeOutlined, IdcardOutlined, UserAddOutlined, KeyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import driverService from '../../../services/driver';
import type { AdminCreateDriverRequest, DriverCreatedResponse } from '../../../services/driver';
import DriverForm from './components/DriverForm';

const { Title, Text, Paragraph } = Typography;

const RegisterDriver: React.FC = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const queryClient = useQueryClient();
    const [isSuccess, setIsSuccess] = useState(false);
    const [createdDriverData, setCreatedDriverData] = useState<DriverCreatedResponse | null>(null);

    const createMutation = useMutation({
        mutationFn: (values: AdminCreateDriverRequest) => driverService.createDriver(values),
        onSuccess: (data) => {
            message.success('Tạo tài xế thành công');
            // Invalidate drivers query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
            setCreatedDriverData(data);
            setIsSuccess(true);
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Tạo tài xế thất bại');
        }
    });

    const handleSubmit = (values: any) => {
        // Format dates to ISO string - remove password field
        const { password, imageUrl, ...rest } = values;
        const formattedValues: AdminCreateDriverRequest = {
            ...rest,
            dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
            dateOfIssue: values.dateOfIssue.format('YYYY-MM-DD'),
            dateOfExpiry: values.dateOfExpiry.format('YYYY-MM-DD'),
            dateOfPassing: values.dateOfPassing.format('YYYY-MM-DD'),
        };

        createMutation.mutate(formattedValues);
    };

    const handleGoToDriversList = () => {
        navigate('/admin/drivers');
    };

    if (isSuccess && createdDriverData) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <Result
                    status="success"
                    title="Tạo tài xế thành công!"
                    subTitle={`Tài xế ${createdDriverData.driver.userResponse.fullName} đã được thêm vào hệ thống với trạng thái CHƯA KÍCH HOẠT.`}
                    extra={[
                        <Button
                            type="primary"
                            key="console"
                            onClick={handleGoToDriversList}
                            icon={<IdcardOutlined />}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Xem danh sách tài xế
                        </Button>,
                        <Button
                            key="register-another"
                            onClick={() => {
                                setIsSuccess(false);
                                setCreatedDriverData(null);
                            }}
                            icon={<UserAddOutlined />}
                        >
                            Tạo tài xế khác
                        </Button>,
                    ]}
                >
                    {/* Success Message */}
                    <div className="mt-6 max-w-lg mx-auto">
                        <Alert
                            message={
                                <Space>
                                    <KeyOutlined />
                                    <span className="font-semibold">Thông tin đăng nhập đã được gửi</span>
                                </Space>
                            }
                            description={
                                <div className="mt-3">
                                    <Paragraph className="text-sm text-gray-600">
                                        <InfoCircleOutlined className="mr-1" />
                                        Thông tin đăng nhập (tên đăng nhập và mật khẩu tạm thởi) đã được gửi đến email của tài xế. 
                                        Tài xế sẽ sử dụng thông tin này để đăng nhập lần đầu và hoàn tất kích hoạt tài khoản.
                                    </Paragraph>
                                </div>
                            }
                            type="success"
                            showIcon={false}
                            className="text-left"
                        />
                    </div>
                </Result>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Breadcrumb className="mb-4">
                <Breadcrumb.Item href="/">
                    <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item href="/admin/drivers">
                    <IdcardOutlined />
                    <span>Quản lý tài xế</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <UserAddOutlined />
                    <span>Đăng ký tài xế mới</span>
                </Breadcrumb.Item>
            </Breadcrumb>

            <div className="flex items-center mb-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/admin/drivers')}
                    className="mr-4"
                    disabled={createMutation.isPending}
                >
                    Quay lại
                </Button>
                <Title level={2} className="m-0 flex items-center">
                    <UserAddOutlined className="mr-3 text-blue-500" />
                    Đăng ký tài xế mới
                </Title>
            </div>

            <Text className="block mb-6 text-gray-500">
                Vui lòng điền đầy đủ thông tin để đăng ký tài xế mới vào hệ thống.
            </Text>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
                <DriverForm
                    loading={createMutation.isPending}
                    onSubmit={handleSubmit}
                    hidePasswordField={true}
                />
            </Card>
        </div>
    );
};

export default RegisterDriver; 