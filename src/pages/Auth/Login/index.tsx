import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Card } from "antd";
import {
  GoogleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { AuthPageLayout } from "../components";
import { useAuth } from "../../../context";

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: {
    username: string;
    password: string;
    remember: boolean;
  }) => {
    try {
      setLoading(true);
      await login(values.username, values.password);
      // Redirect to dashboard after successful login
      navigate("/");
    } catch (error) {
      console.error("Đăng nhập thất bại:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google login logic here
    console.log("Đăng nhập với Google được nhấp");
  };

  return (
    <AuthPageLayout>
      <div className="text-center mb-4">
        <Link to="/">
          <span className="text-blue-600 font-bold text-3xl">truckie</span>
        </Link>
      </div>

      <Card className="shadow-md border-0" bodyStyle={{ padding: "24px" }}>
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
        >
          <Form.Item
            name="username"
            label={
              <span className="flex items-center">
                <span className="text-red-500 mr-1">*</span>Tên đăng nhập
              </span>
            }
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
          >
            <Input placeholder="Nhập tên đăng nhập của bạn" />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              <span className="flex items-center">
                <span className="text-red-500 mr-1">*</span>Mật khẩu
              </span>
            }
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
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
