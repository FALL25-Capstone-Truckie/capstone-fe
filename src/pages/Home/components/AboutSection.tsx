import React from 'react';
import { Button } from 'antd';
import ourFocus from '../../../assets/images/home-page/our-focus.jpg';

interface AboutSectionProps { }

const AboutSection: React.FC<AboutSectionProps> = () => {
    return (
        <div className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="mb-3">
                    <p className="text-blue-600 uppercase font-medium text-sm">Giải pháp vận tải nội thành</p>
                </div>

                <div className="flex flex-col md:flex-row gap-10">
                    <div className="md:w-1/2">
                        <h2 className="text-3xl font-bold mb-6">
                            Tối ưu giao nhận nội thành TP.HCM bằng xe tải
                        </h2>

                        <p className="text-gray-600 mb-4">
                            Truckie giúp doanh nghiệp và chủ shop vận chuyển hàng hóa nội thành nhanh hơn với hệ thống điều phối và theo dõi theo thời gian thực.
                            Bạn có thể nắm rõ trạng thái lấy hàng, đang giao và hoàn tất ngay trên một nền tảng.
                        </p>

                        <p className="text-gray-600 mb-4">
                            Chúng tôi tập trung vào lộ trình tối ưu trong nội đô, thời gian giao nhận rõ ràng và cập nhật liên tục để giảm rủi ro trễ hẹn.
                        </p>

                        <p className="text-gray-600 mb-6">
                            Dù bạn cần chuyển hàng theo chuyến hay theo lịch cố định, Truckie hỗ trợ quản lý đơn, chứng từ và lịch sử giao nhận để vận hành ổn định.
                        </p>

                        <div className="flex items-center gap-4">
                            <Button type="default" className="border-blue-600 text-blue-600">
                                Tra cứu đơn hàng
                            </Button>
                            <Button type="primary" className="bg-blue-600">
                                Liên hệ tư vấn
                            </Button>
                        </div>
                    </div>

                    <div className="md:w-1/2">
                        <div className="h-full">
                            <img
                                src={ourFocus}
                                alt="Container hàng hóa"
                                className="w-full h-full object-cover rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutSection;