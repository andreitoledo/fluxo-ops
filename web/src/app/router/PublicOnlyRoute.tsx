import { Navigate, Outlet } from "react-router-dom";
import { authStorage } from "../../utils/auth-storage";

export function PublicOnlyRoute() {
  const isAuthenticated = authStorage.isAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/orders" replace />;
  }

  return <Outlet />;
}
