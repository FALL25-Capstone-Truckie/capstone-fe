import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "../pages/Home";
import { LoginPage, RegisterPage } from "../pages/Auth";
import {
  AdminDashboard,
  AdminCustomers,
  AdminStaff,
  AdminDrivers,
  AdminVehicles,
  AdminDevices,
  AdminOrders,
} from "../pages/Admin";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/register",
    element: <RegisterPage />,
  },
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/users/customers",
    element: <AdminCustomers />,
  },
  {
    path: "/admin/users/staff",
    element: <AdminStaff />,
  },
  {
    path: "/admin/users/drivers",
    element: <AdminDrivers />,
  },
  {
    path: "/admin/vehicles",
    element: <AdminVehicles />,
  },
  {
    path: "/admin/devices",
    element: <AdminDevices />,
  },
  {
    path: "/admin/orders",
    element: <AdminOrders />,
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
