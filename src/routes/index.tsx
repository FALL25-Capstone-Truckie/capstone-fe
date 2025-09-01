import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import HomePage from '../pages/Home';
import { LoginPage, RegisterPage } from '../pages/Auth';
import VietMapPage from '../pages/VietMap';
import OpenMapPage from '../pages/OpenMap';
import TrackAsiaMapPage from '../pages/TrackAsiaMap';
import Dashboard from '../pages/Dashboard';
import { ProtectedRoute, RoleBasedRoute } from '../components/auth';

// Định nghĩa các route với bảo vệ dựa trên vai trò
const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/auth/login',
        element: <RoleBasedRoute allowedRoles={['guest']} redirectPath="/dashboard">
            <LoginPage />
        </RoleBasedRoute>,
    },
    {
        path: '/auth/register',
        element: <RoleBasedRoute allowedRoles={['guest']} redirectPath="/dashboard">
            <RegisterPage />
        </RoleBasedRoute>,
    },
    // Route cho khách hàng
    {
        path: '/customer',
        element: <RoleBasedRoute allowedRoles={['customer']} redirectPath="/">
            <Outlet />
        </RoleBasedRoute>,
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
    // Route cho nhân viên
    {
        path: '/staff',
        element: <RoleBasedRoute allowedRoles={['staff']} redirectPath="/">
            <Outlet />
        </RoleBasedRoute>,
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
    // Route cho admin
    {
        path: '/admin',
        element: <RoleBasedRoute allowedRoles={['admin']} redirectPath="/">
            <Outlet />
        </RoleBasedRoute>,
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
    // Route cho tài xế
    {
        path: '/driver',
        element: <RoleBasedRoute allowedRoles={['driver']} redirectPath="/">
            <Outlet />
        </RoleBasedRoute>,
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
    // Các route bản đồ - có thể giới hạn quyền truy cập nếu cần
    {
        path: '/viet-map',
        element: <ProtectedRoute>
            <VietMapPage />
        </ProtectedRoute>,
    },
    {
        path: '/open-map',
        element: <ProtectedRoute>
            <OpenMapPage />
        </ProtectedRoute>,
    },
    {
        path: '/trackasia-map',
        element: <ProtectedRoute>
            <TrackAsiaMapPage />
        </ProtectedRoute>,
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