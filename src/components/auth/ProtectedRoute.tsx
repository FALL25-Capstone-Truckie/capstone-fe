import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

/**
 * Component bảo vệ các route yêu cầu người dùng đã đăng nhập
 * Nếu người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Hiển thị loading nếu đang kiểm tra trạng thái xác thực
    if (isLoading) {
        return <div>Đang tải...</div>; // Có thể thay thế bằng loading spinner
    }

    // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // Nếu đã đăng nhập, hiển thị nội dung được bảo vệ
    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute; 