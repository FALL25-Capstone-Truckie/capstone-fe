import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { AuthPageLayout } from '../components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../../../services/auth/authService';

const { Title, Text } = Typography;

interface LocationState {
  email?: string;
}

const VerifyOTPPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const email = state?.email || '';

  const OTP_LENGTH = 6;
  const [otpDigits, setOtpDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ''));
  const inputRefs = useRef<Array<any | null>>(Array.from({ length: OTP_LENGTH }, () => null));

  const otpValue = useMemo(() => otpDigits.join(''), [otpDigits]);

  useEffect(() => {
    form.setFieldValue('otp', otpValue);
  }, [form, otpValue]);

  const focusInput = (index: number) => {
    const ref = inputRefs.current[index];
    if (ref && typeof ref.focus === 'function') {
      ref.focus();
    }
  };

  const setDigitAt = (index: number, value: string) => {
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleOtpChange = (index: number, rawValue: string) => {
    const value = rawValue.replace(/\D/g, '');
    if (!value) {
      setDigitAt(index, '');
      return;
    }

    const lastChar = value[value.length - 1];
    setDigitAt(index, lastChar);

    if (index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otpDigits[index]) {
        setDigitAt(index, '');
        return;
      }

      if (index > 0) {
        setDigitAt(index - 1, '');
        focusInput(index - 1);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const nextDigits = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? '');
    setOtpDigits(nextDigits);

    const nextFocusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    focusInput(nextFocusIndex);
  };

  const handleVerifyOTP = async (values: { otp: string }) => {
    if (!email) {
      message.error('Không tìm thấy email. Vui lòng thử lại.');
      navigate('/auth/register');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyRegisterOtp(email, values.otp);

      if (response.success) {
        message.success('Xác thực OTP thành công!');
        message.info('Tài khoản của bạn đang chờ được kích hoạt bởi quản trị viên.');
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      } else {
        message.error(response.message || 'Xác thực OTP thất bại');
      }
    } catch (error) {
      message.error((error as any)?.message || 'Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      message.error('Không tìm thấy email. Vui lòng thử lại.');
      navigate('/auth/register');
      return;
    }

    try {
      const response = await authService.resendRegisterOtp(email);

      if (response.success) {
        message.success('Đã gửi lại mã OTP. Vui lòng kiểm tra email của bạn.');
      } else {
        message.error(response.message || 'Gửi lại OTP thất bại');
      }
    } catch (error) {
      message.error((error as any)?.message || 'Gửi lại OTP thất bại');
    }
  };

  return (
    <AuthPageLayout maxWidth="max-w-md">
      <div className="text-center mb-4">
        <Link to="/">
          <span className="text-blue-600 font-bold text-3xl">truckie</span>
        </Link>
      </div>

      <Card className="shadow-lg border-0" bodyStyle={{ padding: '32px' }}>
        <div className="text-center mb-6">
          <Title level={3}>Xác thực OTP</Title>
          <Text type="secondary">
            Vui lòng nhập mã OTP đã được gửi đến email {email}
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleVerifyOTP}
          requiredMark={false}
        >
          <Form.Item
            name="otp"
            rules={[
              { required: true, message: 'Vui lòng nhập mã OTP' },
              { len: 6, message: 'Mã OTP phải có 6 chữ số' }
            ]}
          >
            <Input type="hidden" />
          </Form.Item>

          <Form.Item shouldUpdate>
            {() => {
              const errors = form.getFieldError('otp');
              const hasError = errors.length > 0;

              return (
                <div>
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: OTP_LENGTH }, (_, index) => (
                      <Input
                        key={index}
                        ref={(ref) => {
                          inputRefs.current[index] = ref;
                        }}
                        value={otpDigits[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        inputMode="numeric"
                        maxLength={1}
                        size="large"
                        autoFocus={index === 0}
                        className="text-center text-lg"
                        style={{ width: 44 }}
                      />
                    ))}
                  </div>

                  {hasError ? (
                    <div className="mt-2">
                      <div className="text-red-500 text-sm">{errors[0]}</div>
                    </div>
                  ) : null}
                </div>
              );
            }}
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Xác thực
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Text type="secondary">Chưa nhận được mã OTP?</Text>
          <Button type="link" onClick={handleResendOTP}>
            Gửi lại mã
          </Button>
        </div>
      </Card>
    </AuthPageLayout>
  );
};

export default VerifyOTPPage;
