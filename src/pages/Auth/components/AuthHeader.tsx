import React from 'react';
import { Layout } from 'antd';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { APP_NAME } from '../../../config';

const { Header } = Layout;

const AuthHeader: React.FC = () => {
    return (
        <Header className="bg-white shadow-sm px-4 md:px-6 h-16 flex items-center">
            <div className="flex items-center">
                <Link to="/" className="flex items-center">
                    <ArrowLeftOutlined className="mr-2" />
                    <span className="text-blue-600 font-bold text-lg">Trang chủ</span>
                </Link>
            </div>
            <div className="ml-auto">
                {window.location.pathname.includes('login') ? (
                    <div className="text-sm">
                        Chưa có tài khoản?
                        <Link to="/auth/register" className="text-blue-600 ml-1">
                            Đăng ký
                        </Link>
                    </div>
                ) : (
                    <div className="text-sm">
                        Đã có tài khoản?
                        <Link to="/auth/login" className="text-blue-600 ml-1">
                            Đăng nhập
                        </Link>
                    </div>
                )}
            </div>
        </Header>
    );
};

export default AuthHeader; 