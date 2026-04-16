import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading === false) {
    return user ? (
      <Navigate to="/dashboard" replace />
    ) : (
      <Navigate to="/login" replace />
    );
  } else {
    return <h1>Loading</h1>;
  }
};

export default RootRedirect;
