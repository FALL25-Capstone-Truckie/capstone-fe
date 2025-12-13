import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface OtpStepProps {
    email: string;
    loading: boolean;
    onSubmit: (otp: string) => void;
    onResend: () => void;
    onBack: () => void;
}

const OtpStep: React.FC<OtpStepProps> = ({ email, loading, onSubmit, onResend, onBack }) => {
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
    const [error, setError] = useState<string>('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleInputChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtpValues = [...otpValues];
        newOtpValues[index] = value;
        setOtpValues(newOtpValues);
        setError('');

        // Auto focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === 'Backspace') {
            if (!otpValues[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
        // Handle left arrow
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        // Handle right arrow
        if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData) {
            const newOtpValues = [...otpValues];
            for (let i = 0; i < pastedData.length && i < 6; i++) {
                newOtpValues[i] = pastedData[i];
            }
            setOtpValues(newOtpValues);
            setError('');
            // Focus last filled input or last input
            const focusIndex = Math.min(pastedData.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleSubmit = () => {
        const otp = otpValues.join('');
        if (otp.length !== 6) {
            setError('Vui lòng nhập đủ 6 số');
            return;
        }
        onSubmit(otp);
    };

    const handleResend = () => {
        setCountdown(60);
        setCanResend(false);
        setOtpValues(['', '', '', '', '', '']);
        setError('');
        onResend();
        inputRefs.current[0]?.focus();
    };

    // Mask email for display
    const maskEmail = (emailStr: string) => {
        const [localPart, domain] = emailStr.split('@');
        if (localPart.length <= 3) {
            return `${localPart[0]}***@${domain}`;
        }
        return `${localPart.slice(0, 3)}***@${domain}`;
    };

    const isComplete = otpValues.every(v => v !== '');

    return (
        <div>
            <div className="text-center mb-4">
                <Text type="secondary">
                    Mã OTP đã được gửi đến <strong>{maskEmail(email)}</strong>
                </Text>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã OTP <span className="text-red-500">*</span>
                </label>
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                    {otpValues.map((value, index) => (
                        <input
                            key={index}
                            ref={el => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={value}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            disabled={loading}
                            className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg 
                                focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                                transition-all duration-200
                                ${error ? 'border-red-400' : 'border-gray-300'}
                                ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                                ${value ? 'border-blue-400' : ''}`}
                        />
                    ))}
                </div>
                {error && (
                    <p className="text-red-500 text-sm text-center mt-2">{error}</p>
                )}
            </div>

            <Button
                type="primary"
                size="large"
                block
                loading={loading}
                disabled={!isComplete}
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 mb-2"
            >
                Xác nhận OTP
            </Button>

            <div className="flex justify-between items-center">
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={onBack}
                    disabled={loading}
                    className="p-0"
                >
                    Quay lại
                </Button>

                <Button
                    type="link"
                    onClick={handleResend}
                    disabled={!canResend || loading}
                    className="p-0"
                >
                    {canResend ? 'Gửi lại mã OTP' : `Gửi lại sau ${countdown}s`}
                </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <Text type="secondary" className="text-xs">
                    💡 Mã OTP có hiệu lực trong 5 phút. Nếu không nhận được email, 
                    vui lòng kiểm tra thư mục spam hoặc thử gửi lại.
                </Text>
            </div>
        </div>
    );
};

export default OtpStep;
