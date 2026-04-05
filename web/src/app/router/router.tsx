import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../../components/common/ProtectedRoute";
import { AppShell } from "../../components/layout/AppShell";
import { LoginPage } from "../../pages/auth/LoginPage";
import { OrderDetailPage } from "../../pages/orders/OrderDetailPage";
import { OrdersListPage } from "../../pages/orders/OrdersListPage";
import { NotFoundPage } from "../../pages/system/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <Navigate to="/orders" replace />,
          },
          {
            path: "/orders",
            element: <OrdersListPage />,
          },
          {
            path: "/orders/:id",
            element: <OrderDetailPage />,
          },
          {
            path: "*",
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/orders" replace />,
  },
]);
