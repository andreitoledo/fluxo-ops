import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../../components/common/ProtectedRoute";
import { AppLayout } from "../../components/layout/AppLayout";
import { LoginPage } from "../../pages/auth/LoginPage";
import { ClientsPage } from "../../pages/clients/ClientsListPage";
import { DashboardPage } from "../../pages/dashboard/DashboardPage";
import { OrderCreatePage } from "../../pages/orders/OrderCreatePage";
import { OrderDetailPage } from "../../pages/orders/OrderDetailPage";
import { OrdersListPage } from "../../pages/orders/OrdersListPage";
import { ProductsPage } from "../../pages/products/ProductsListPage";
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
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/orders",
            element: <OrdersListPage />,
          },
          {
            path: "/orders/new",
            element: <OrderCreatePage />,
          },
          {
            path: "/orders/:id",
            element: <OrderDetailPage />,
          },
          {
            path: "/clients",
            element: <ClientsPage />,
          },
          {
            path: "/products",
            element: <ProductsPage />,
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
