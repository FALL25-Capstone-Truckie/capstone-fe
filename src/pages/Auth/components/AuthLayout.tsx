import React from 'react';
import { Layout, Card } from 'antd';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../../../config';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <Layout className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <Link to="/" className="text-blue-600 text-2xl font-bold">
                        {APP_NAME}
                    </Link>
                </div>

                <Card className="shadow-md">
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-bold mb-1">{title}</h1>
                        <p className="text-gray-500 text-sm">{subtitle}</p>
                    </div>

                    {children}
                </Card>
            </div>
        </Layout>
    );
};

export default AuthLayout; 