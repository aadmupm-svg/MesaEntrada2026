import { Navigate, Outlet } from "react-router-dom";
import useAuth from "./useAuth";

function RequireAuth() {
  const { auth } = useAuth();

  return auth ? <Outlet /> : <Navigate to="/" replace />;
}

export default RequireAuth;
