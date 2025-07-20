import React from 'react';
import { Layout, Row, Col, Typography, Input, Button, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { APP_NAME, SUPPORT_EMAIL } from '../../config';

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <AntFooter className="bg-white pt-12 pb-6">
            <div className="container mx-auto px-4">
                <Row gutter={[24, 32]}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <div className="mb-6">
                            <Link to="/" className="text-blue-600 font-bold text-xl">
                                {APP_NAME}
                            </Link>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Title level={5} className="mb-4">Trang chủ</Title>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-600 hover:text-blue-600">Trang chủ</Link></li>
                            <li><Link to="/gioi-thieu" className="text-gray-600 hover:text-blue-600">Giới thiệu</Link></li>
                            <li><Link to="/dich-vu" className="text-gray-600 hover:text-blue-600">Dịch vụ</Link></li>
                            <li><Link to="/lien-he" className="text-gray-600 hover:text-blue-600">Liên hệ</Link></li>
                        </ul>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Title level={5} className="mb-4">Hỗ trợ & Thông tin</Title>
                        <ul className="space-y-2">
                            <li><Link to="/ho-tro" className="text-gray-600 hover:text-blue-600">Trung tâm hỗ trợ</Link></li>
                            <li><Link to="/faq" className="text-gray-600 hover:text-blue-600">FAQ</Link></li>
                            <li><Link to="/chinh-sach" className="text-gray-600 hover:text-blue-600">Chính sách</Link></li>
                            <li><Link to="/dieu-khoan" className="text-gray-600 hover:text-blue-600">Điều khoản sử dụng</Link></li>
                        </ul>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Title level={5} className="mb-4">Đăng ký nhận tin</Title>
                        <Text className="block mb-4 text-gray-600">Đăng ký để nhận thông tin mới nhất từ chúng tôi</Text>
                        <div className="flex">
                            <Input placeholder="Email của bạn" className="mr-2" />
                            <Button type="primary" className="bg-blue-600">
                                Đăng ký
                            </Button>
                        </div>
                    </Col>
                </Row>

                <Divider className="my-6" />

                <div className="text-center text-gray-500 text-sm">
                    © {currentYear} {APP_NAME}. Đã đăng ký bản quyền.
                </div>
            </div>
        </AntFooter>
    );
};

export default Footer; 