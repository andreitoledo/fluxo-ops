import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../../components/common/ProtectedRoute";
import { AppLayout } from "../../components/layout/AppLayout";
import { LoginPage } from "../../pages/auth/LoginPage";
import { OrderDetailPage } from "../../pages/orders/OrderDetailPage";
import { OrdersListPage } from "../../pages/orders/OrdersListPage";
import { NotFoundPage } from "../../pages/system/NotFoundPage";
import { PublicOnlyRoute } from "./PublicOnlyRoute";

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/",
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
]);
