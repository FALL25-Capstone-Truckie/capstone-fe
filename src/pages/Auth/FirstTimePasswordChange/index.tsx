import React, { useState, useEffect } from 'react';
import { Card, App, Typography, Form, Input, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { LockOutlined } from '@ant-design/icons';
import { AuthPageLayout } from '../components';
import axios from 'axios';
import httpClient from '@/services/api/httpClient';
import type { ChangePasswordRequest, ChangePasswordResponse } from '@/services/auth/types';
import type { ApiResponse } from '@/services/api/types';

const { Title, Text } = Typography;

const FirstTimePasswordChange: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { message: messageApi } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get state from location (passed from login page)
  const state = location.state as {
    firstTimeLogin?: boolean;
    username?: string;
    requiredActions?: string[];
  } | undefined;

  // If no state or not firstTimeLogin, redirect to login
  useEffect(() => {
    if (!state?.firstTimeLogin || !state?.username) {
      messageApi.error('Không thể truy cập trang này trực tiếp');
      navigate('/auth/login', { replace: true });
    }
  }, [state, navigate, messageApi]);

  const handleSubmit = (values: { newPassword: string; confirmNewPassword: string }) => {
    if (!state?.username) {
      messageApi.error('Không tìm thấy thông tin tài khoản');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    // Sử dụng API đổi mật khẩu thông thường với mật khẩu cũ trống
    // Backend đã được cập nhật để bỏ qua kiểm tra mật khẩu cũ khi user có status INACTIVE
    const changePasswordData: ChangePasswordRequest = {
      username: state.username,
      oldPassword: '', // Gửi mật khẩu cũ trống, backend sẽ bỏ qua kiểm tra cho trường hợp firstTimeLogin
      newPassword: values.newPassword,
      confirmNewPassword: values.confirmNewPassword
    };
    
    // Gọi trực tiếp API đổi mật khẩu thay vì sử dụng authService
    httpClient.put<ApiResponse<null>>('/auths/change-password', changePasswordData)
      .then((response) => {
        if (!response.data.success) {
          throw new Error(response.data.message || 'Đổi mật khẩu thất bại');
        }
        
        messageApi.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại với mật khẩu mới.');
        // Chuyển về trang login để staff tự đăng nhập lại
        navigate('/auth/login', { replace: true });
      })
      .catch((error) => {
        console.error('Đổi mật khẩu thất bại:', error);
        
        let errorMsg = 'Đổi mật khẩu thất bại';
        
        if (axios.isAxiosError(error) && error.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error instanceof Error) {
          errorMsg = error.message;
        }
        
        setErrorMessage(errorMsg);
        messageApi.error(errorMsg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AuthPageLayout>
      <div className="text-center mb-4">
        <span className="text-blue-600 font-bold text-3xl">truckie</span>
      </div>

      <Card className="shadow-md border-0" bodyStyle={{ padding: "24px" }}>
        <div className="text-center mb-6">
          <Title level={3}>Đổi mật khẩu</Title>
          <Text type="secondary">
            Đây là lần đăng nhập đầu tiên của bạn. Vui lòng đổi mật khẩu tạm thời để tiếp tục sử dụng hệ thống.
          </Text>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
          <p className="font-bold">Hướng dẫn</p>
          <p>Mật khẩu mới phải có ít nhất 6 ký tự và khác với mật khẩu tạm thời.</p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{errorMessage}</p>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {/* Không yêu cầu mật khẩu tạm thời */}

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Nhập mật khẩu mới"
            />
          </Form.Item>

          <Form.Item
            name="confirmNewPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Xác nhận mật khẩu mới"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full bg-blue-600"
            >
              Đổi mật khẩu và tiếp tục
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </AuthPageLayout>
  );
};

export default FirstTimePasswordChange;
