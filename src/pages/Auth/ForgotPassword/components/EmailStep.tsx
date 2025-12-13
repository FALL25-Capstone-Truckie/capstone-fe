import React from 'react';
import { Form, Input, Button } from 'antd';
import { MailOutlined } from '@ant-design/icons';

interface EmailStepProps {
    loading: boolean;
    onSubmit: (email: string) => void;
}

const EmailStep: React.FC<EmailStepProps> = ({ loading, onSubmit }) => {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values.email);
        } catch (error) {
            // Form validation failed
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
                name="email"
                label="Email"
                rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' }
                ]}
            >
                <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="Nhập email của bạn"
                    size="large"
                    disabled={loading}
                />
            </Form.Item>

            <Form.Item className="mb-0">
                <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Gửi mã OTP
                </Button>
            </Form.Item>
        </Form>
    );
};

export default EmailStep;
