import React from "react";
import { Card, Tag, Statistic, Row, Col } from "antd";
import { SafetyCertificateOutlined, DollarOutlined } from "@ant-design/icons";

interface InsuranceInfoProps {
    hasInsurance?: boolean;
    totalInsuranceFee?: number;
    totalDeclaredValue?: number;
}

const InsuranceInfo: React.FC<InsuranceInfoProps> = ({
    hasInsurance = false,
    totalInsuranceFee = 0,
    totalDeclaredValue = 0,
}) => {
    if (!hasInsurance) {
        return (
            <Card
                title={
                    <div className="flex items-center">
                        <SafetyCertificateOutlined className="mr-2 text-gray-500" />
                        <span>Thông tin bảo hiểm</span>
                    </div>
                }
                className="shadow-md mb-6 rounded-xl"
            >
                <div className="text-center py-4">
                    <Tag color="default" className="mb-2">
                        Không có bảo hiểm
                    </Tag>
                    <p className="text-gray-500 text-sm">
                        Đơn hàng này không được mua bảo hiểm
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card
            title={
                <div className="flex items-center">
                    <SafetyCertificateOutlined className="mr-2 text-green-500" />
                    <span>Thông tin bảo hiểm</span>
                    <Tag color="success" className="ml-2">
                        Đã bảo hiểm
                    </Tag>
                </div>
            }
            className="shadow-md mb-6 rounded-xl"
        >
            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Statistic
                        title="Tổng giá trị khai báo"
                        value={totalDeclaredValue}
                        prefix={<DollarOutlined />}
                        suffix="VNĐ"
                        precision={0}
                        valueStyle={{ color: "#1890ff" }}
                        formatter={(value) => `${Number(value).toLocaleString("vi-VN")}`}
                    />
                </Col>
                <Col xs={24} sm={12}>
                    <Statistic
                        title="Phí bảo hiểm"
                        value={totalInsuranceFee}
                        prefix={<SafetyCertificateOutlined />}
                        suffix="VNĐ"
                        precision={0}
                        valueStyle={{ color: "#52c41a" }}
                        formatter={(value) => `${Number(value).toLocaleString("vi-VN")}`}
                    />
                </Col>
            </Row>
            {totalDeclaredValue > 0 && totalInsuranceFee > 0 && (
                <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 text-center">
                        Tỷ lệ bảo hiểm: {((totalInsuranceFee / totalDeclaredValue) * 100).toFixed(3)}%
                    </p>
                </div>
            )}
        </Card>
    );
};

export default InsuranceInfo;
