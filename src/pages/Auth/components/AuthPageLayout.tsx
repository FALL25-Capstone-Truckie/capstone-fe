import React from 'react';
import { Layout } from 'antd';
import { AuthHeader } from './';
import Footer from '../../../components/layout/Footer';

const { Content } = Layout;

interface AuthPageLayoutProps {
    children: React.ReactNode;
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ children }) => {
    return (
        <Layout className="min-h-screen bg-gray-50">
            <AuthHeader />
            <Content> {/* Height of auth header (64px) */}
                <div className="flex items-center justify-center py-8">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>
            </Content>
            <Footer />
        </Layout>
    );
};

export default AuthPageLayout; 