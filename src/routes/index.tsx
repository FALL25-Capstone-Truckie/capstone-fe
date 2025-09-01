import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import HomePage from '../pages/Home';
import { LoginPage, RegisterPage } from '../pages/Auth';
import VietMapPage from '../pages/VietMap';
import OpenMapPage from '../pages/OpenMap';
import TrackAsiaMapPage from '../pages/TrackAsiaMap';
import Dashboard from '../pages/Dashboard';
import { PermissionRoute } from '../components/auth';

// Định nghĩa các route với bảo vệ dựa trên vai trò và trạng thái xác thực
const router = createBrowserRouter([
    // Trang chủ - ai cũng có thể truy cập
    {
        path: '/',
        element: <HomePage />,
    },

    // Các trang xác thực - chỉ dành cho người chưa đăng nhập
    {
        path: '/auth/login',
        element: (
            <PermissionRoute
                authenticationRequired="unauthenticated"
                authRedirectPath={(auth) => {
                    // Chuyển hướng dựa trên vai trò nếu đã đăng nhập
                    if (auth?.user?.role === 'admin') return '/admin/dashboard';
                    if (auth?.user?.role === 'staff') return '/staff/dashboard';
                    if (auth?.user?.role === 'driver') return '/driver/dashboard';
                    return '/'; // Mặc định cho customer
                }}
            >
                <LoginPage />
            </PermissionRoute>
        ),
    },
    {
        path: '/auth/register',
        element: (
            <PermissionRoute
                authenticationRequired="unauthenticated"
                authRedirectPath={(auth) => {
                    // Chuyển hướng dựa trên vai trò nếu đã đăng nhập
                    if (auth?.user?.role === 'admin') return '/admin/dashboard';
                    if (auth?.user?.role === 'staff') return '/staff/dashboard';
                    if (auth?.user?.role === 'driver') return '/driver/dashboard';
                    return '/'; // Mặc định cho customer
                }}
            >
                <RegisterPage />
            </PermissionRoute>
        ),
    },

    // Route cho khách hàng - yêu cầu đăng nhập và vai trò customer
    {
        path: '/customer',
        element: (
            <PermissionRoute
                authenticationRequired="authenticated"
                allowedRoles={['customer']}
                authRedirectPath="/auth/login"
                roleRedirectPath="/"
            >
                <Outlet />
            </PermissionRoute>
        ),
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />,
            },
            {
                path: 'orders',
                element: <div>Customer Orders</div>, // Thay thế bằng component thực tế
            },
        ]
    },

    // Route cho nhân viên - yêu cầu đăng nhập và vai trò staff
    {
        path: '/staff',
        element: (
            <PermissionRoute
                authenticationRequired="authenticated"
                allowedRoles={['staff']}
                authRedirectPath="/auth/login"
                roleRedirectPath="/"
            >
                <Outlet />
            </PermissionRoute>
        ),
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />,
            },
            {
                path: 'orders',
                element: <div>Manage Orders</div>, // Thay thế bằng component thực tế
            },
        ]
    },

    // Route cho admin - yêu cầu đăng nhập và vai trò admin
    {
        path: '/admin',
        element: (
            <PermissionRoute
                authenticationRequired="authenticated"
                allowedRoles={['admin']}
                authRedirectPath="/auth/login"
                roleRedirectPath="/"
            >
                <Outlet />
            </PermissionRoute>
        ),
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />,
            },
            {
                path: 'users',
                element: <div>Manage Users</div>, // Thay thế bằng component thực tế
            },
            {
                path: 'settings',
                element: <div>System Settings</div>, // Thay thế bằng component thực tế
            },
        ]
    },

    // Route cho tài xế - yêu cầu đăng nhập và vai trò driver
    {
        path: '/driver',
        element: (
            <PermissionRoute
                authenticationRequired="authenticated"
                allowedRoles={['driver']}
                authRedirectPath="/auth/login"
                roleRedirectPath="/"
            >
                <Outlet />
            </PermissionRoute>
        ),
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />,
            },
            {
                path: 'deliveries',
                element: <div>Driver Deliveries</div>, // Thay thế bằng component thực tế
            },
        ]
    },

    // Các route bản đồ - yêu cầu đăng nhập (không kiểm tra vai trò)
    {
        path: '/viet-map',
        element: (
            <PermissionRoute authenticationRequired="authenticated">
                <VietMapPage />
            </PermissionRoute>
        ),
    },
    {
        path: '/open-map',
        element: (
            <PermissionRoute authenticationRequired="authenticated">
                <OpenMapPage />
            </PermissionRoute>
        ),
    },
    {
        path: '/trackasia-map',
        element: (
            <PermissionRoute authenticationRequired="authenticated">
                <TrackAsiaMapPage />
            </PermissionRoute>
        ),
    },

    // Route mặc định khi không tìm thấy trang
    {
        path: '*',
        element: <div>Không tìm thấy trang</div>, // Thay thế bằng component 404 thực tế
    }
]);

const AppRoutes = () => {
    return <RouterProvider router={router} />;
};

export default AppRoutes; 