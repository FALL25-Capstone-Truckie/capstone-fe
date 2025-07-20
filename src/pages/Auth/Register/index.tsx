import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card } from 'antd';
import { GoogleOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthPageLayout } from '../components';
import { isStrongPassword } from '../../../utils';

const RegisterPage: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: { fullName: string; email: string; password: string; agreeTerms: boolean }) => {
        try {
            setLoading(true);

            // In a real app, you would call your API to register the user
            console.log('Giá trị đăng ký:', values);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Redirect to login page after successful registration
            navigate('/auth/login', { state: { registered: true } });
        } catch (error) {
            console.error('Đăng ký thất bại:', error);
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

    return (
        <AuthPageLayout>
            <div className="text-center mb-4">
                <Link to="/">
                    <span className="text-blue-600 font-bold text-3xl">truckie</span>
                </Link>
            </div>

            <Card className="shadow-md border-0" bodyStyle={{ padding: '24px' }}>
                <div className="text-center mb-6">
                    <h1 className="text-xl font-bold mb-1">Tạo tài khoản mới</h1>
                    <p className="text-gray-500 text-sm">Chào mừng bạn đến với Truckie!</p>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                    requiredMark="optional"
                >
                    <Form.Item
                        name="fullName"
                        label={<span className="flex items-center"><span className="text-red-500 mr-1">*</span>Họ và tên</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                    >
                        <Input placeholder="Nhập họ tên của bạn" />
                    </Form.Item>

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
                        rules={[{ validator: validatePassword }]}
                    >
                        <Input.Password
                            placeholder="Nhập mật khẩu mới"
                            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    <div className="mb-4">
                        <div className="flex items-center mb-2">
                            <div className="w-2 h-2 rounded-full bg-gray-300 mr-1"></div>
                            <span className="text-xs text-gray-500">Tối thiểu 8 ký tự</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-gray-300 mr-1"></div>
                            <span className="text-xs text-gray-500">Chứa ít nhất một ký tự đặc biệt</span>
                        </div>
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
            </Card>
        </AuthPageLayout>
    );
};

export default RegisterPage; 