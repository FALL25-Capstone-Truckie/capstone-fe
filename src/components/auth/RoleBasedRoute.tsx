import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';
import AuthRoute from './AuthRoute';

type RedirectPathFunction = (auth: { user: any; isAuthenticated: boolean }) => string;

interface RoleBasedRouteProps {
    /**
     * Các vai trò được phép truy cập route này
     */
    allowedRoles: ('admin' | 'customer' | 'staff' | 'driver')[];
    children?: React.ReactNode;
    redirectPath?: string | RedirectPathFunction;
}

/**
 * Component bảo vệ các route dựa trên vai trò người dùng
 * Lưu ý: Component này giả định người dùng đã đăng nhập
 * Nên kết hợp với AuthRoute để kiểm tra trạng thái xác thực
 */
const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
    allowedRoles,
    children,
    redirectPath = '/'
}) => {
    const auth = useAuth();
    const { user, isAuthenticated } = auth;
    const location = useLocation();

    // Kiểm tra nếu người dùng có vai trò được phép
    const hasRequiredRole = () => {
        // Nếu chưa đăng nhập, không có vai trò
        if (!isAuthenticated || !user) {
            return false;
        }

        // Kiểm tra vai trò
        return allowedRoles.includes(user.role);
    };

    if (!hasRequiredRole()) {
        // Xác định đường dẫn chuyển hướng
        const redirectTo = typeof redirectPath === 'function'
            ? redirectPath(auth)
            : redirectPath;

        // Chuyển hướng đến trang được chỉ định
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Nếu có quyền truy cập, hiển thị nội dung
    return children ? <>{children}</> : <Outlet />;
};

export default RoleBasedRoute; 