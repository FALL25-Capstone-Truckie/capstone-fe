import React from 'react';
import { Button, Carousel } from 'antd';
import heroShip from '../../../assets/images/home-page/hero-ship.jpg';

interface HeroSectionProps { }

const HeroSection: React.FC<HeroSectionProps> = () => {
    return (
        <div className="relative">
            <Carousel autoplay className="w-full">
                <div>
                    <div
                        className="h-[550px] bg-cover bg-center flex items-center"
                        style={{
                            backgroundImage: `url(${heroShip})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="container mx-auto px-4">
                            <div className="max-w-lg bg-white/80 p-8 rounded-lg">
                                <h1 className="text-4xl font-bold mb-4 text-blue-800">
                                    Vận tải xe tải nội thành TP.HCM nhanh, đúng hẹn
                                </h1>
                                <p className="mb-6 text-lg">
                                    Đặt chuyến dễ dàng, theo dõi hành trình theo thời gian thực và quản lý trạng thái giao nhận minh bạch cho mọi đơn hàng.
                                </p>
                                <div className="flex space-x-4">
                                    <Button type="primary" size="large" className="bg-blue-600 h-12 px-8 text-base">
                                        Nhận báo giá
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Carousel>
            <div className="absolute bottom-0 left-0 w-full flex justify-center pb-6">
                <div className="flex space-x-3">
                    {[1, 2, 3].map((dot) => (
                        <div
                            key={dot}
                            className={`h-3 w-3 rounded-full ${dot === 1 ? 'bg-blue-600' : 'bg-gray-300'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroSection;