import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PublicRouteGuard = () => {
  const { user, token } = useSelector((state) => state.auth);

  if (user && token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRouteGuard;