import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onSubmit = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <h1>Hello {user}</h1>
      <button onClick={onSubmit}>Logout</button>
    </>
  );
};

export default Dashboard;
