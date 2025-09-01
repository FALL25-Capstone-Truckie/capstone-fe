import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Alert, DatePicker, Radio, Row, Col, Upload, message } from 'antd';
import { GoogleOutlined, EyeInvisibleOutlined, EyeTwoTone, UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined, BankOutlined, IdcardOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthPageLayout } from '../components';
import { isStrongPassword } from '../../../utils';
import authService from '../../../services/authService';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';

const RegisterPage: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            setError(null);

            // Chuyển đổi định dạng ngày sinh
            const formattedDateOfBirth = values.dateOfBirth.format('YYYY-MM-DD');

            // Chuẩn bị dữ liệu đăng ký
            const registerData = {
                username: values.username,
                email: values.email,
                password: values.password,
                fullName: values.fullName,
                phoneNumber: values.phoneNumber,
                gender: values.gender === 'male',
                dateOfBirth: formattedDateOfBirth,
                imageUrl: values.imageUrl || '',
                // Thông tin công ty (luôn có)
                companyName: values.companyName,
                representativeName: values.representativeName,
                representativePhone: values.representativePhone,
                businessLicenseNumber: values.businessLicenseNumber,
                businessAddress: values.businessAddress,
            };

            // Gọi API đăng ký
            const response = await authService.register(registerData);

            // Hiển thị thông báo thành công
            message.success('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');

            // Chuyển hướng đến trang đăng nhập
            navigate('/auth/login', { state: { registered: true } });
        } catch (error: any) {
            console.error('Đăng ký thất bại:', error);
            setError(error.message || 'Đăng ký thất bại. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        // Implement Google signup logic here
        console.log('Đăng ký với Google được nhấp');
    };

    const validatePassword = (_: any, value: string) => {
        if (!value) {
            return Promise.reject('Vui lòng nhập mật khẩu');
        }

        if (!isStrongPassword(value)) {
            return Promise.reject('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số');
        }

        return Promise.resolve();
    };

    const validateConfirmPassword = (_: any, value: string) => {
        if (!value) {
            return Promise.reject('Vui lòng xác nhận mật khẩu');
        }

        if (value !== form.getFieldValue('password')) {
            return Promise.reject('Mật khẩu xác nhận không khớp');
        }

        return Promise.resolve();
    };

    const uploadProps: UploadProps = {
        name: 'file',
        action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188', // Thay thế bằng API upload thực tế
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {
            if (info.file.status === 'done') {
                message.success(`${info.file.name} tải lên thành công`);
                // Trong thực tế, bạn sẽ lấy URL từ response của API upload
                form.setFieldsValue({ imageUrl: `https://example.com/images/${info.file.name}` });
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} tải lên thất bại.`);
            }
        },
    };

    return (
        <AuthPageLayout maxWidth="max-w-7xl">
            <div className="text-center mb-4">
                <Link to="/">
                    <span className="text-blue-600 font-bold text-3xl">truckie</span>
                </Link>
            </div>

            <Card className="shadow-lg border-0 w-full" bodyStyle={{ padding: '32px' }}>
                <div className="text-center mb-6">
                    <h1 className="text-xl font-bold mb-1">Tạo tài khoản doanh nghiệp</h1>
                    <p className="text-gray-500 text-sm">Chào mừng bạn đến với Truckie! Vui lòng điền đầy đủ thông tin để đăng ký tài khoản doanh nghiệp.</p>
                </div>

                {error && (
                    <Alert
                        message="Đăng ký thất bại"
                        description={error}
                        type="error"
                        showIcon
                        closable
                        className="mb-4"
                    />
                )}

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                    requiredMark="optional"
                    initialValues={{
                        gender: 'male',
                        dateOfBirth: dayjs().subtract(18, 'year')
                    }}
                >
                    <div className="bg-yellow-50 p-5 rounded-lg mb-6">
                        <h2 className="text-lg font-medium mb-4 flex items-center">
                            <LockOutlined className="mr-2" /> Thông tin tài khoản
                        </h2>

                        <Row gutter={24}>
                            <Col xs={24} md={24}>
                                <Form.Item
                                    name="username"
                                    label={<span className="flex items-center"><span className="text-red-500 mr-1">*</span>Tên đăng nhập</span>}
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                                        { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' }
                                    ]}
                                >
                                    <Input
                                        prefix={<UserOutlined className="text-gray-400" />}
                                        placeholder="Nhập tên đăng nhập"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="password"
                                    label={<span className="flex items-center"><span className="text-red-500 mr-1">*</span>Mật khẩu</span>}
                                    rules={[{ required: true, validator: validatePassword }]}
                                    hasFeedback
                                >
                                    <Input.Password
                                        prefix={<LockOutlined className="text-gray-400" />}
                                        placeholder="Nhập mật khẩu mới"
                                        iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="confirmPassword"
                                    label={<span className="flex items-center"><span className="text-red-500 mr-1">*</span>Xác nhận mật khẩu</span>}
                                    dependencies={['password']}
                                    rules={[{ required: true, validator: validateConfirmPassword }]}
                                    hasFeedback
                                >
                                    <Input.Password
                                        prefix={<LockOutlined className="text-gray-400" />}
                                        placeholder="Xác nhận mật khẩu"
                                        iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <div className="mb-2">
                            <div className="flex items-center mb-1">
                                <div className="w-2 h-2 rounded-full bg-gray-300 mr-1"></div>
                                <span className="text-xs text-gray-500">Tối thiểu 8 ký tự</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-gray-300 mr-1"></div>
                                <span className="text-xs text-gray-500">Chứa ít nhất một ký tự đặc biệt</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-5 rounded-lg mb-6">
                        <h2 className="text-lg font-medium mb-4 flex items-center">
                            <UserOutlined className="mr-2" /> Thông tin người đại diện
                        </h2>

                        <Row gutter={24}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="fullName"
                                    label={<span className="flex items-center"><span className="text-red-500 mr-1">*</span>Họ và tên</span>}
                                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                                >
                                    <Input
                                        prefix={<UserOutlined className="text-gray-400" />}
                                        placeholder="Nhập họ tên của bạn"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="email"
                                    label={<span className="flex items-center"><span className="text-red-500 mr-1">*</span>Email</span>}
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập email' },
                                        { type: 'email', message: 'Email không hợp lệ' }
                                    ]}
                                >
                                    <Input
                                        prefix={<MailOutlined className="text-gray-400" />}
                                        placeholder="Nhập email của bạn"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="phoneNumber"
                                    label={<span className="flex items-center"><span className="text-red-500 mr-1">*</span>Số điện thoại</span>}
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số điện thoại' },
                                        { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số' }
                                    ]}
                                >
                                    <Input
                                        prefix={<PhoneOutlined className="text-gray-400" />}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="dateOfBirth"
                                    label={<span className="flex items-center"><span className="text-red-500 mr-1">*</span>Ngày sinh</span>}
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
                                >
                                    <DatePicker
                                        className="w-full"
                                        format="DD/MM/YYYY"
                                        placeholder="Chọn ngày sinh"
                                        disabledDate={d => d.isAfter(dayjs().subtract(18, 'year'))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    name="gender"
                                    label="Giới tính"
                                >
                                    <Radio.Group>
                                        <Radio value="male">Nam</Radio>
                                        <Radio value="female">Nữ</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="imageUrl"
                            label="Ảnh đại diện"
                        >
                            <Upload {...uploadProps} maxCount={1}>
                                <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
                            </Upload>
                        </Form.Item>
                    </div>

                    <div className="bg-green-50 p-5 rounded-lg mb-6">
                        <h2 className="text-lg font-medium mb-4 flex items-center">
                            <BankOutlined className="mr-2" /> Thông tin doanh nghiệp
                        </h2>

                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item
                                    name="companyName"
                                    label={<span className="flex items-center"><span className="text-red-500 mr-1">*</span>Tên doanh nghiệp</span>}
                                    rules={[{ required: true, message: 'Vui lòng nhập tên doanh nghiệp' }]}
                                >
                                    <Input placeholder="Nhập tên doanh nghiệp" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="representativeName"
                                    label={<span className="flex items-center"><span className="text-red-500 mr-1">*</span>Người đại diện pháp luật</span>}
                                    rules={[{ required: true, message: 'Vui lòng nhập tên người đại diện' }]}
                                >
                                    <Input placeholder="Nhập tên người đại diện pháp luật" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="representativePhone"
                                    label={<span className="flex items-center"><span className="text-red-500 mr-1">*</span>Số điện thoại đại diện</span>}
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số điện thoại đại diện' },
                                        { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số' }
                                    ]}
                                >
                                    <Input placeholder="Nhập số điện thoại đại diện" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="businessLicenseNumber"
                                    label={<span className="flex items-center"><span className="text-red-500 mr-1">*</span>Số giấy phép kinh doanh</span>}
                                    rules={[{ required: true, message: 'Vui lòng nhập số giấy phép kinh doanh' }]}
                                >
                                    <Input prefix={<IdcardOutlined className="text-gray-400" />} placeholder="Nhập số giấy phép kinh doanh" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="businessAddress"
                                    label={<span className="flex items-center"><span className="text-red-500 mr-1">*</span>Địa chỉ doanh nghiệp</span>}
                                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ doanh nghiệp' }]}
                                >
                                    <Input.TextArea rows={1} placeholder="Nhập địa chỉ doanh nghiệp" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    <Form.Item
                        name="agreeTerms"
                        valuePropName="checked"
                        rules={[
                            {
                                validator: (_, value) =>
                                    value ? Promise.resolve() : Promise.reject('Bạn phải đồng ý với điều khoản sử dụng')
                            }
                        ]}
                    >
                        <Checkbox>Tôi đồng ý với <Link to="/terms" className="text-blue-600">điều khoản sử dụng</Link></Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="w-full bg-blue-600 h-10"
                            loading={loading}
                        >
                            Đăng ký
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center my-4">hoặc</div>

                <Button
                    icon={<GoogleOutlined />}
                    className="w-full flex items-center justify-center h-10"
                    onClick={handleGoogleSignup}
                >
                    Đăng ký với Google
                </Button>

                <div className="text-center mt-4">
                    <span className="text-gray-500">Đã có tài khoản? </span>
                    <Link to="/auth/login" className="text-blue-600">
                        Đăng nhập ngay
                    </Link>
                </div>
            </Card>
        </AuthPageLayout>
    );
};

export default RegisterPage; 