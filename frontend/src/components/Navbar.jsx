import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="nav-bar">
      <div className="nav-left">
        <span className="nav-logo">Trading Journal</span>
      </div>
      <div className="nav-right">
        <span className="nav-username">Welcome back, {user}</span>
        <button className="logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
