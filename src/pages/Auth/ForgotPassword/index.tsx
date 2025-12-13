import React, { useState } from 'react';
import { Card, Steps, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AuthPageLayout } from '../components';
import { authService } from '../../../services';
import EmailStep from './components/EmailStep';
import OtpStep from './components/OtpStep';
import ResetPasswordStep from './components/ResetPasswordStep';
import SuccessStep from './components/SuccessStep';

type ForgotPasswordStep = 'email' | 'otp' | 'reset' | 'success';

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>('email');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');

    const getStepIndex = () => {
        switch (currentStep) {
            case 'email': return 0;
            case 'otp': return 1;
            case 'reset': return 2;
            case 'success': return 3;
            default: return 0;
        }
    };

    const handleSendOtp = async (emailValue: string) => {
        setLoading(true);
        try {
            await authService.sendForgotPasswordOtp(emailValue);
            setEmail(emailValue);
            setCurrentStep('otp');
            message.success('Mã OTP đã được gửi đến email của bạn');
        } catch (error: any) {
            message.error(error.message || 'Gửi mã OTP thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (otp: string) => {
        setLoading(true);
        try {
            const result = await authService.verifyForgotPasswordOtp(email, otp);
            setResetToken(result.resetToken);
            setCurrentStep('reset');
            message.success('Xác thực OTP thành công');
        } catch (error: any) {
            message.error(error.message || 'Mã OTP không hợp lệ hoặc đã hết hạn');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (newPassword: string, confirmPassword: string) => {
        setLoading(true);
        try {
            await authService.resetPassword(email, resetToken, newPassword, confirmPassword);
            setCurrentStep('success');
            message.success('Đổi mật khẩu thành công!');
        } catch (error: any) {
            message.error(error.message || 'Đổi mật khẩu thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            await authService.sendForgotPasswordOtp(email);
            message.success('Mã OTP mới đã được gửi đến email của bạn');
        } catch (error: any) {
            message.error(error.message || 'Gửi lại mã OTP thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToEmail = () => {
        setCurrentStep('email');
        setEmail('');
        setResetToken('');
    };

    const handleGoToLogin = () => {
        navigate('/auth/login');
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'email':
                return (
                    <EmailStep
                        loading={loading}
                        onSubmit={handleSendOtp}
                    />
                );
            case 'otp':
                return (
                    <OtpStep
                        email={email}
                        loading={loading}
                        onSubmit={handleVerifyOtp}
                        onResend={handleResendOtp}
                        onBack={handleBackToEmail}
                    />
                );
            case 'reset':
                return (
                    <ResetPasswordStep
                        loading={loading}
                        onSubmit={handleResetPassword}
                    />
                );
            case 'success':
                return (
                    <SuccessStep
                        onGoToLogin={handleGoToLogin}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <AuthPageLayout maxWidth="max-w-md">
            <div className="text-center mb-4">
                <Link to="/">
                    <span className="text-blue-600 font-bold text-3xl">truckie</span>
                </Link>
            </div>

            <Card className="shadow-lg border-0 w-full" styles={{ body: { padding: '32px' } }}>
                <div className="text-center mb-6">
                    <h1 className="text-xl font-bold mb-1">Quên mật khẩu</h1>
                    <p className="text-gray-500 text-sm">
                        {currentStep === 'email' && 'Nhập email để nhận mã xác thực'}
                        {currentStep === 'otp' && 'Nhập mã OTP đã gửi đến email của bạn'}
                        {currentStep === 'reset' && 'Nhập mật khẩu mới cho tài khoản'}
                        {currentStep === 'success' && 'Đổi mật khẩu thành công!'}
                    </p>
                </div>

                {currentStep !== 'success' && (
                    <Steps 
                        current={getStepIndex()} 
                        size="small" 
                        className="mb-6"
                        items={[
                            { title: 'Email' },
                            { title: 'Xác thực' },
                            { title: 'Mật khẩu mới' }
                        ]}
                    />
                )}

                {renderStepContent()}

                {currentStep === 'email' && (
                    <div className="text-center mt-4">
                        <Link to="/auth/login" className="text-blue-600 text-sm">
                            ← Quay lại đăng nhập
                        </Link>
                    </div>
                )}
            </Card>
        </AuthPageLayout>
    );
};

export default ForgotPasswordPage;
