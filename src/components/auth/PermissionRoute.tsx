import React from 'react';
import AuthRoute from './AuthRoute';
import RoleBasedRoute from './RoleBasedRoute';

type RedirectPathFunction = (auth: { user: any; isAuthenticated: boolean }) => string;

interface PermissionRouteProps {
    /**
     * Xác định liệu route này yêu cầu người dùng đã đăng nhập hay chưa đăng nhập
     * - 'authenticated': Yêu cầu người dùng đã đăng nhập
     * - 'unauthenticated': Yêu cầu người dùng chưa đăng nhập
     * - 'any': Không có yêu cầu về trạng thái xác thực
     */
    authenticationRequired: 'authenticated' | 'unauthenticated' | 'any';

    /**
     * Các vai trò được phép truy cập route này
     * Chỉ áp dụng khi authenticationRequired là 'authenticated'
     */
    allowedRoles?: ('admin' | 'customer' | 'staff' | 'driver')[];

    /**
     * Đường dẫn chuyển hướng khi không đáp ứng yêu cầu xác thực
     */
    authRedirectPath?: string | RedirectPathFunction;

    /**
     * Đường dẫn chuyển hướng khi không đáp ứng yêu cầu về vai trò
     */
    roleRedirectPath?: string | RedirectPathFunction;

    children?: React.ReactNode;
}

/**
 * Component kết hợp kiểm tra cả trạng thái xác thực và vai trò
 */
const PermissionRoute: React.FC<PermissionRouteProps> = ({
    authenticationRequired,
    allowedRoles = [],
    authRedirectPath = authenticationRequired === 'authenticated' ? '/auth/login' : '/',
    roleRedirectPath = '/',
    children
}) => {
    // Nếu yêu cầu người dùng đã đăng nhập và có chỉ định vai trò
    if (authenticationRequired === 'authenticated' && allowedRoles.length > 0) {
        return (
            <AuthRoute
                authenticationRequired={authenticationRequired}
                redirectPath={authRedirectPath}
            >
                <RoleBasedRoute
                    allowedRoles={allowedRoles}
                    redirectPath={roleRedirectPath}
                >
                    {children}
                </RoleBasedRoute>
            </AuthRoute>
        );
    }

    // Nếu chỉ kiểm tra trạng thái xác thực
    return (
        <AuthRoute
            authenticationRequired={authenticationRequired}
            redirectPath={authRedirectPath}
        >
            {children}
        </AuthRoute>
    );
};

export default PermissionRoute; 