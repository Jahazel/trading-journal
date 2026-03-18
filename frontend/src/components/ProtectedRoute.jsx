import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const isAuthorized = localStorage.getItem("token");

  return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
