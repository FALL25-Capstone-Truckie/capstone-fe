import React from 'react';
import { Card, Row, Col } from 'antd';
import service1 from '../../../assets/images/home-page/service1.jpg';
import service2 from '../../../assets/images/home-page/service2.jpg';
import service3 from '../../../assets/images/home-page/service3.jpg';

interface ServicesSectionProps { }

const ServicesSection: React.FC<ServicesSectionProps> = () => {
    const services = [
        {
            image: service1,
            title: "Vận chuyển nội thành bằng xe tải",
            description: "Phù hợp giao nhận trong TP.HCM với nhiều tải trọng, linh hoạt theo chuyến hoặc theo lịch cố định."
        },
        {
            image: service2,
            title: "Theo dõi lộ trình theo thời gian thực",
            description: "Theo dõi vị trí xe và tiến độ giao nhận liên tục, giúp bạn chủ động kế hoạch và xử lý phát sinh."
        },
        {
            image: service3,
            title: "Quản lý đơn hàng & trạng thái minh bạch",
            description: "Cập nhật trạng thái lấy hàng, đang giao, đã giao và lịch sử hành trình rõ ràng cho từng đơn."
        }
    ];

    return (
        <div className="py-16">
            <div className="container mx-auto px-4">
                <div className="mb-2">
                    <p className="text-blue-600 uppercase font-medium text-sm">Dịch vụ của chúng tôi</p>
                </div>

                <h2 className="text-3xl font-bold mb-8">
                    Dịch vụ tối ưu cho vận tải nội thành TP.HCM
                </h2>

                <Row gutter={[24, 24]}>
                    {services.map((service, index) => (
                        <Col xs={24} sm={12} md={8} key={index}>
                            <Card
                                className="h-full"
                                cover={
                                    <div
                                        className="h-48 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${service.image})` }}
                                    />
                                }
                            >
                                <div className="mb-2">
                                    <span className="text-blue-600 font-medium">Tính năng {index + 1}</span>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                                <p className="text-gray-600">{service.description}</p>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
};

export default ServicesSection;