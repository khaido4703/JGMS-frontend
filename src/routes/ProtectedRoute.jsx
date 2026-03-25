import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROUTER_URL } from "../consts/router.const";
import { getDashboardPathByRole, normalizeRole } from "../utils/auth";
import { getUserRole } from "../utils/auth";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        replace
        state={{ from: location.pathname }}
        to={ROUTER_URL.COMMON.LOGIN}
      />
    );
  }

  const userRole = getUserRole(user);

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate replace to={getDashboardPathByRole(userRole)} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
