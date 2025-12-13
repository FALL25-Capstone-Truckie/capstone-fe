import React, { useEffect, useState } from 'react';
import { Modal, Form, DatePicker, Button, Alert, Space, Typography, Descriptions, App } from 'antd';
import { SafetyCertificateOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { DriverModel } from '../../../../services/driver';
import driverService from '../../../../services/driver';

const { Text } = Typography;

interface LicenseRenewalModalProps {
    visible: boolean;
    driver: DriverModel | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export interface LicenseRenewalFormValues {
    dateOfPassing: string;
    dateOfIssue: string;
    dateOfExpiry: string;
}

const LicenseRenewalModal: React.FC<LicenseRenewalModalProps> = ({
    visible,
    driver,
    onSuccess,
    onCancel
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { message } = App.useApp();

    useEffect(() => {
        if (visible && driver) {
            form.setFieldsValue({
                dateOfPassing: driver.dateOfPassing ? dayjs(driver.dateOfPassing) : null,
                dateOfIssue: driver.dateOfIssue ? dayjs(driver.dateOfIssue) : null,
                dateOfExpiry: driver.dateOfExpiry ? dayjs(driver.dateOfExpiry) : null,
            });
        }
    }, [visible, driver, form]);

    const handleSubmit = async () => {
        if (!driver) return;
        
        try {
            const values = await form.validateFields();
            setLoading(true);
            
            await driverService.renewDriverLicense(driver.id, {
                dateOfPassing: values.dateOfPassing?.format('YYYY-MM-DD'),
                dateOfIssue: values.dateOfIssue?.format('YYYY-MM-DD'),
                dateOfExpiry: values.dateOfExpiry?.format('YYYY-MM-DD'),
            });
            
            message.success('Gia hạn bằng lái thành công');
            onSuccess();
        } catch (error) {
            console.error('Renewal failed:', error);
            message.error('Gia hạn bằng lái thất bại');
        } finally {
            setLoading(false);
        }
    };

    const validateDateOrder = (_: any, value: any) => {
        if (!value) return Promise.resolve();

        const dateOfPassing = form.getFieldValue('dateOfPassing');
        const dateOfIssue = form.getFieldValue('dateOfIssue');

        if (_.field === 'dateOfIssue' && dateOfPassing && value.isBefore(dateOfPassing)) {
            return Promise.reject('Ngày cấp phải sau hoặc bằng ngày sát hạch');
        }

        if (_.field === 'dateOfExpiry') {
            if (dateOfIssue && value.isBefore(dateOfIssue)) {
                return Promise.reject('Ngày hết hạn phải sau ngày cấp');
            }

            if (value.isBefore(dayjs())) {
                return Promise.reject('Ngày hết hạn phải sau ngày hiện tại');
            }
        }

        return Promise.resolve();
    };

    return (
        <Modal
            title={
                <div className="flex items-center text-blue-600">
                    <SafetyCertificateOutlined className="mr-2 text-xl" />
                    <span>Gia hạn bằng lái xe</span>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
            destroyOnClose
        >
            {driver && (
                <>
                    <Alert
                        message="Thông tin tài xế"
                        description={
                            <div>
                                <Text strong>{driver.userResponse.fullName}</Text>
                                <Text className="ml-2">({driver.userResponse.phoneNumber})</Text>
                            </div>
                        }
                        type="info"
                        showIcon
                        className="mb-4"
                    />

                    <Descriptions bordered size="small" column={1} className="mb-4">
                        <Descriptions.Item label="Số giấy phép lái xe">{driver.driverLicenseNumber}</Descriptions.Item>
                        <Descriptions.Item label="Số seri thẻ">{driver.cardSerialNumber}</Descriptions.Item>
                        <Descriptions.Item label="Hạng giấy phép">{driver.licenseClass}</Descriptions.Item>
                        <Descriptions.Item label="Nơi cấp">{driver.placeOfIssue}</Descriptions.Item>
                    </Descriptions>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            name="dateOfPassing"
                            label={
                                <span>
                                    <CalendarOutlined className="mr-1" />
                                    Ngày sát hạch
                                </span>
                            }
                            rules={[
                                { required: true, message: 'Vui lòng chọn ngày sát hạch' }
                            ]}
                        >
                            <DatePicker
                                className="w-full"
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày sát hạch"
                                disabledDate={(current) => current && current > dayjs().endOf('day')}
                            />
                        </Form.Item>

                        <Form.Item
                            name="dateOfIssue"
                            label={
                                <span>
                                    <CalendarOutlined className="mr-1" />
                                    Ngày cấp
                                </span>
                            }
                            rules={[
                                { required: true, message: 'Vui lòng chọn ngày cấp' },
                                { validator: validateDateOrder }
                            ]}
                        >
                            <DatePicker
                                className="w-full"
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày cấp"
                                disabledDate={(current) => current && current > dayjs().endOf('day')}
                            />
                        </Form.Item>

                        <Form.Item
                            name="dateOfExpiry"
                            label={
                                <span>
                                    <CalendarOutlined className="mr-1" />
                                    Ngày hết hạn
                                </span>
                            }
                            rules={[
                                { required: true, message: 'Vui lòng chọn ngày hết hạn' },
                                { validator: validateDateOrder }
                            ]}
                        >
                            <DatePicker
                                className="w-full"
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày hết hạn"
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                            />
                        </Form.Item>

                        <Form.Item className="mb-0 mt-6">
                            <Space className="w-full justify-end">
                                <Button onClick={onCancel}>
                                    Hủy
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Gia hạn bằng lái
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </>
            )}
        </Modal>
    );
};

export default LicenseRenewalModal;
