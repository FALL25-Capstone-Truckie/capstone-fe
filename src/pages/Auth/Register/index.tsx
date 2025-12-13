import React, { useState } from 'react';
import { Form, Card, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AuthPageLayout } from '../components';
import { authService } from '../../../services';
import axios from 'axios';
import RegisterForm from './components/RegisterForm';
import SocialSignup from './components/SocialSignup';
import StatusMessages from './components/StatusMessages';

const RegisterPage: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            // Validate form fields first
            const values = await form.validateFields();

            setLoading(true);
            setError(null);
            setSuccess(null);

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
                imageUrl: values.imageUrl || 'string', // Đảm bảo luôn có giá trị
                // Thông tin công ty
                companyName: values.companyName,
                representativeName: values.representativeName,
                representativePhone: values.representativePhone,
                businessLicenseNumber: values.businessLicenseNumber,
                businessAddress: values.businessAddress || 'string', // Đảm bảo luôn có giá trị
            };

            try {
                // Gọi API đăng ký
                const response = await authService.register(registerData);

                if (response.success) {
                    // Lấy thông tin user từ customer.userResponse thay vì trực tiếp từ userResponse
                    const username = response.data.customer?.userResponse?.username || response.data.userResponse?.username || '';
                    message.success(`Đăng ký thành công! Tài khoản ${username} đã được tạo.`);

                    // Kiểm tra xem có yêu cầu nhập OTP không
                    if (response.data.otpRequired) {
                        // Hiển thị thông báo
                        message.info(response.data.otpMessage || 'Vui lòng kiểm tra email để xác thực tài khoản.');
                        
                        // Chuyển hướng đến trang nhập OTP ngay lập tức
                        navigate('/auth/verify-otp', { 
                            state: { 
                                email: response.data.email || values.email 
                            } 
                        });
                    } else {
                        // Hiển thị thông báo thành công
                        const username = response.data.customer?.userResponse?.username || response.data.userResponse?.username || '';
                        let successMessage = `Tài khoản ${username} đã được tạo thành công!`;

                        // Nếu status là OTP_PENDING, thông báo cho người dùng
                        if (response.data.status === 'OTP_PENDING') {
                            successMessage += ' Vui lòng kiểm tra email để xác thực tài khoản.';
                            message.info('Vui lòng kiểm tra email để xác thực tài khoản.');
                        }

                        setSuccess(successMessage);

                        // Chuyển hướng đến trang đăng nhập sau 3 giây
                        setTimeout(() => {
                            navigate('/auth/login', { state: { registered: true, username: values.username } });
                        }, 3000);
                    }
                } else {
                    // Xử lý trường hợp API trả về success: false
                    message.error(response.message || 'Đăng ký thất bại');
                    setError(response.message || 'Đăng ký thất bại. Vui lòng thử lại sau.');
                }
            } catch (error) {
                // Extract error message
                let errorMsg = 'Đăng ký thất bại. Vui lòng thử lại sau.';

                if (axios.isAxiosError(error)) {
                    if (error.response?.data?.message) {
                        errorMsg = error.response.data.message;
                    } else if (error.response?.status) {
                        errorMsg = `Lỗi ${error.response.status}: Đăng ký thất bại`;
                    } else if (error.message) {
                        errorMsg = error.message;
                    }
                } else if (error instanceof Error) {
                    errorMsg = error.message;
                }

                message.error(errorMsg);
                setError(errorMsg);
            }
        } catch (error) {
            // Form validation failed, do nothing
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        // Implement Google signup logic here
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

                <StatusMessages
                    error={error}
                    success={success}
                    onErrorClose={() => setError(null)}
                />

                <RegisterForm
                    form={form}
                    loading={loading}
                    onSubmit={handleRegister}
                />
            </Card>
        </AuthPageLayout>
    );
};

export default RegisterPage; 