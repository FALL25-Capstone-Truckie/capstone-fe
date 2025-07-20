import React from 'react';
import { Collapse } from 'antd';

const { Panel } = Collapse;

interface FAQSectionProps { }

const FAQSection: React.FC<FAQSectionProps> = () => {
    const faqItems = [
        {
            question: 'Có phiên bản dùng thử miễn phí không?',
            answer: 'Có, chúng tôi cung cấp phiên bản dùng thử hoàn toàn miễn phí trong 30 ngày. Nếu cần, chúng tôi sẽ hỗ trợ bạn với cuộc gọi hướng dẫn cá nhân hóa miễn phí để giúp bạn tận dụng tối đa thời gian dùng thử.'
        },
        {
            question: 'Tôi có thể thay đổi gói dịch vụ sau này không?',
            answer: 'Có, bạn có thể nâng cấp hoặc hạ cấp gói dịch vụ của mình bất cứ lúc nào thông qua cài đặt tài khoản.'
        },
        {
            question: 'Chính sách hủy đăng ký của bạn là gì?',
            answer: 'Bạn có thể hủy đăng ký bất cứ lúc nào. Không có hợp đồng dài hạn hoặc phí hủy.'
        },
        {
            question: 'Có thể thêm hoặc theo dõi đơn hàng không?',
            answer: 'Có, bạn có thể thêm đơn hàng mới và theo dõi các đơn hàng hiện có theo thời gian thực thông qua nền tảng của chúng tôi.'
        },
        {
            question: 'Thanh toán hoạt động như thế nào?',
            answer: 'Chúng tôi tính phí hàng tháng dựa trên gói đăng ký của bạn. Tất cả thông tin thanh toán được xử lý an toàn.'
        },
        {
            question: 'Làm thế nào để thay đổi email tài khoản của tôi?',
            answer: 'Bạn có thể cập nhật địa chỉ email trong cài đặt tài khoản ở mục hồ sơ.'
        }
    ];

    return (
        <div className="py-16">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-3 text-blue-600">
                        Câu hỏi thường gặp
                    </h2>
                    <p className="text-center text-gray-600 mb-10">
                        Tất cả những gì bạn cần biết về sản phẩm và thanh toán của chúng tôi
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <Collapse
                        bordered={false}
                        className="bg-transparent"
                        expandIconPosition="end"
                    >
                        {faqItems.map((item, index) => (
                            <Panel
                                header={
                                    <div className="py-2">
                                        <span className="font-medium">{item.question}</span>
                                    </div>
                                }
                                key={index}
                                className="mb-2 bg-white rounded shadow-sm border border-gray-100"
                            >
                                <p className="text-gray-600 pb-2">{item.answer}</p>
                            </Panel>
                        ))}
                    </Collapse>
                </div>
            </div>
        </div>
    );
};

export default FAQSection; 