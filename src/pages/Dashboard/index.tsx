import React from 'react';
import { Spin } from 'antd';
import { useAuth } from '../../context';
import { NewStaffDashboard, NewCustomerDashboard } from './components';

/**
 * Dashboard page that renders role-specific dashboard
 * - Admin: Has dedicated route at /admin/dashboard
 * - Staff: Operations-focused with trips, issues, fleet status
 * - Customer: Order tracking with delivery performance and actions
 */
const Dashboard: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" tip="Đang tải..." />
            </div>
        );
    }

    // Render specific dashboard based on user role
    switch (user?.role?.toLowerCase()) {
        case 'staff':
            return <NewStaffDashboard />;
        
        case 'customer':
            return <NewCustomerDashboard />;
        
        default:
            // Fallback for unknown roles or not logged in
            return (
                <div className="p-6 flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">
                            Chào mừng đến với Truckie
                        </h2>
                        <p className="text-gray-500">
                            Vui lòng đăng nhập để xem dashboard của bạn
                        </p>
                    </div>
                </div>
            );
    }
};

export default Dashboard;