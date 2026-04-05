import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authStorage } from "../../utils/auth-storage";

export function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = authStorage.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
