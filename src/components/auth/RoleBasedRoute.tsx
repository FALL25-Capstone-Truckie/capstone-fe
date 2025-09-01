import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';

interface RoleBasedRouteProps {
    allowedRoles: ('admin' | 'customer' | 'staff' | 'driver' | 'guest')[];
    children?: React.ReactNode;
    redirectPath?: string;
}

/**
 * Component bảo vệ các route dựa trên vai trò người dùng
 * Nếu người dùng không có quyền truy cập, chuyển hướng đến trang được chỉ định
 */
const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
    allowedRoles,
    children,
    redirectPath = '/'
}) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Hiển thị loading nếu đang kiểm tra trạng thái xác thực
    if (isLoading) {
        return <div>Đang tải...</div>; // Có thể thay thế bằng loading spinner
    }

    // Kiểm tra nếu vai trò hiện tại được phép
    const hasRequiredRole = () => {
        if (allowedRoles.includes('guest')) {
            return true; // Guest role luôn được phép
        }

        if (!isAuthenticated) {
            return false; // Nếu không đăng nhập và không cho phép guest
        }

        return user && allowedRoles.includes(user.role);
    };

    if (!hasRequiredRole()) {
        // Chuyển hướng đến trang được chỉ định hoặc trang chủ
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    // Nếu có quyền truy cập, hiển thị nội dung
    return children ? <>{children}</> : <Outlet />;
};

export default RoleBasedRoute; 