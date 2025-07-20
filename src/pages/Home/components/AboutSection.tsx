import React from 'react';
import { Button } from 'antd';
import ourFocus from '../../../assets/images/home-page/our-focus.jpg';

interface AboutSectionProps { }

const AboutSection: React.FC<AboutSectionProps> = () => {
    return (
        <div className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="mb-3">
                    <p className="text-blue-600 uppercase font-medium text-sm">Thương hiệu của chúng tôi</p>
                </div>

                <div className="flex flex-col md:flex-row gap-10">
                    <div className="md:w-1/2">
                        <h2 className="text-3xl font-bold mb-6">
                            Thiết kế ảnh hưởng đến cách mọi người làm việc, học tập, sống và trải nghiệm thế giới
                        </h2>

                        <p className="text-gray-600 mb-4">
                            Tại Truckie, chúng tôi tập trung vào các thách thức kinh doanh của khách hàng.
                            Chúng tôi hợp tác với khách hàng để thiết kế giải pháp đáp ứng nhu cầu kinh doanh,
                            tạo giá trị cho khách hàng của họ và thúc đẩy tăng trưởng.
                        </p>

                        <p className="text-gray-600 mb-4">
                            Khi đã xây dựng kế hoạch, chúng tôi thực hiện. Luôn tỉ mỉ, với giao tiếp rõ ràng trong suốt quá trình. Và không dừng lại ở đó. Chúng tôi tiếp tục hỗ trợ khách hàng khi họ phát triển và thay đổi.
                        </p>

                        <p className="text-gray-600 mb-6">
                            Chúng tôi làm việc với khách hàng về kế hoạch phát triển, sử dụng các phân tích dựa trên dữ liệu để xác định cơ hội. Phương pháp hợp tác của chúng tôi đảm bảo thành công của khách hàng cũng là thành công của chúng tôi. Chúng tôi không chỉ là nhà cung cấp; chúng tôi là đối tác trong hành trình của họ.
                        </p>

                        <div className="flex items-center gap-4">
                            <Button type="default" className="border-blue-600 text-blue-600">
                                Liên hệ ngay
                            </Button>
                            <Button type="primary" className="bg-blue-600">
                                Liên hệ với chúng tôi
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