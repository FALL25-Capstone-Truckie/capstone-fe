import React from 'react';
import { Button } from 'antd';

interface TrialSectionProps { }

const TrialSection: React.FC<TrialSectionProps> = () => {
    return (
        <div className="py-12 bg-gray-100">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl font-bold mb-4">
                    Bắt đầu dùng thử miễn phí 30 ngày
                </h2>
                <p className="text-gray-600 mb-6">
                    Thiết lập và sử dụng trong chưa đầy 5 phút
                </p>
                <div className="flex justify-center gap-4">
                    <Button size="large">Tìm hiểu thêm</Button>
                    <Button type="primary" size="large" className="bg-blue-600">
                        Đăng ký ngay
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TrialSection; 