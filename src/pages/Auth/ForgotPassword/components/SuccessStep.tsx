import React from 'react';
import { Result, Button } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

interface SuccessStepProps {
    onGoToLogin: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = ({ onGoToLogin }) => {
    return (
        <Result
            icon={<CheckCircleOutlined className="text-green-500" style={{ fontSize: 64 }} />}
            title="Đổi mật khẩu thành công!"
            subTitle="Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập với mật khẩu mới."
            extra={
                <Button
                    type="primary"
                    size="large"
                    onClick={onGoToLogin}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Đăng nhập ngay
                </Button>
            }
        />
    );
};

export default SuccessStep;
