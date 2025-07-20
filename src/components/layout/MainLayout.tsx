import React from 'react';
import { Layout } from 'antd';
import Header from './Header';
import Footer from './Footer';

const { Content } = Layout;

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <Layout className="min-h-screen">
            <Header />
            <Content className="pt-[104px]"> {/* Height of info bar (40px) + main header (64px) */}
                {children}
            </Content>
            <Footer />
        </Layout>
    );
};

export default MainLayout; 