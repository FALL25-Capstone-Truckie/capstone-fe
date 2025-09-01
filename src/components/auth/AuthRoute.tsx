import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';

type RedirectPathFunction = (auth: { user: any; isAuthenticated: boolean }) => string;

interface AuthRouteProps {
    /**
     * Xác định liệu route này yêu cầu người dùng đã đăng nhập hay chưa đăng nhập
     * - 'authenticated': Yêu cầu người dùng đã đăng nhập
     * - 'unauthenticated': Yêu cầu người dùng chưa đăng nhập
     * - 'any': Không có yêu cầu về trạng thái xác thực
     */
    authenticationRequired: 'authenticated' | 'unauthenticated' | 'any';
    children?: React.ReactNode;
    redirectPath?: string | RedirectPathFunction;
}

/**
 * Component kiểm soát truy cập dựa trên trạng thái xác thực
 */
const AuthRoute: React.FC<AuthRouteProps> = ({
    authenticationRequired,
    children,
    redirectPath = authenticationRequired === 'authenticated' ? '/auth/login' : '/'
}) => {
    const auth = useAuth();
    const { isAuthenticated, isLoading } = auth;
    const location = useLocation();

    // Hiển thị loading nếu đang kiểm tra trạng thái xác thực
    if (isLoading) {
        return <div>Đang tải...</div>; // Có thể thay thế bằng loading spinner
    }

    // Kiểm tra trạng thái xác thực
    const hasRequiredAuthState = () => {
        if (authenticationRequired === 'any') {
            return true;
        }
        if (authenticationRequired === 'authenticated') {
            return isAuthenticated;
        }
        if (authenticationRequired === 'unauthenticated') {
            return !isAuthenticated;
        }
        return false;
    };

    if (!hasRequiredAuthState()) {
        // Xác định đường dẫn chuyển hướng
        const redirectTo = typeof redirectPath === 'function'
            ? redirectPath(auth)
            : redirectPath;

        // Chuyển hướng đến trang được chỉ định
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Nếu đáp ứng yêu cầu xác thực, hiển thị nội dung
    return children ? <>{children}</> : <Outlet />;
};

export default AuthRoute; 