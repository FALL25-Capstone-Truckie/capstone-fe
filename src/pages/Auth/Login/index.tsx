import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Select } from 'antd';
import { GoogleOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthPageLayout } from '../components';
import { useAuth } from '../../../context';

const { Option } = Select;

const LoginPage: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Lấy đường dẫn chuyển hướng từ state (nếu có)
    const from = (location.state as any)?.from?.pathname || '/dashboard';

    const onFinish = async (values: { email: string; password: string; remember: boolean; role: string }) => {
        try {
            setLoading(true);
            await login(values.email, values.password, values.role);

            // Chuyển hướng dựa trên vai trò
            let redirectPath = from;

            if (values.role === 'admin') {
                redirectPath = '/admin/dashboard';
            } else if (values.role === 'staff') {
                redirectPath = '/staff/dashboard';
            } else if (values.role === 'customer') {
                redirectPath = '/customer/dashboard';
            } else if (values.role === 'driver') {
                redirectPath = '/driver/dashboard';
            }

            navigate(redirectPath, { replace: true });
        } catch (error) {
            console.error('Đăng nhập thất bại:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Implement Google login logic here
        console.log('Đăng nhập với Google được nhấp');
    };

    return (
        <AuthPageLayout>
            <div className="text-center mb-4">
                <Link to="/">
                    <span className="text-blue-600 font-bold text-3xl">truckie</span>
                </Link>
            </div>

            <Card className="shadow-md border-0" bodyStyle={{ padding: '24px' }}>
                <div className="text-center mb-6">
                    <h1 className="text-xl font-bold mb-1">Đăng nhập</h1>
                    <p className="text-gray-500 text-sm">Chào mừng bạn quay lại!</p>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                    requiredMark="optional"
                    initialValues={{ remember: true, role: 'customer' }}
                >
                    <Form.Item
                        name="email"
                        label={<span className="flex items-center"><span className="text-red-500 mr-1">*</span>Email</span>}
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input placeholder="Nhập email của bạn" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={<span className="flex items-center"><span className="text-red-500 mr-1">*</span>Mật khẩu</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                    >
                        <Input.Password
                            placeholder="Nhập mật khẩu"
                            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    {/* Thêm lựa chọn vai trò cho mục đích demo */}
                    <Form.Item
                        name="role"
                        label="Đăng nhập với vai trò (Demo)"
                    >
                        <Select>
                            <Option value="customer">Khách hàng</Option>
                            <Option value="staff">Nhân viên</Option>
                            <Option value="admin">Quản trị viên</Option>
                            <Option value="driver">Tài xế</Option>
                        </Select>
                    </Form.Item>

                    <div className="flex justify-between items-center mb-4">
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>Ghi nhớ đăng nhập 30 ngày</Checkbox>
                        </Form.Item>
                        <Link to="/auth/forgot-password" className="text-blue-600 text-sm">
                            Quên mật khẩu
                        </Link>
                    </div>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="w-full bg-blue-600 h-10"
                            loading={loading}
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center my-4">hoặc</div>

                <Button
                    icon={<GoogleOutlined />}
                    className="w-full flex items-center justify-center h-10"
                    onClick={handleGoogleLogin}
                >
                    Đăng nhập với Google
                </Button>
            </Card>
        </AuthPageLayout>
    );
};

export default LoginPage; 