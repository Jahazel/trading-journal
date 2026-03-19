import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading === false) {
    if (user) {
      return <Outlet />;
    } else if (!user) {
      return <Navigate to="/login" replace />;
    }
  } else {
    return <h1>Loading</h1>;
  }
};

export default ProtectedRoute;
