import { Navigate, Outlet } from "react-router-dom";
import useAuth from "./useAuth";

function RequireAdmin() {
  const { auth, isAdmin } = useAuth();

  if (!auth) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/home" replace />;

  return <Outlet />;
}

export default RequireAdmin;
