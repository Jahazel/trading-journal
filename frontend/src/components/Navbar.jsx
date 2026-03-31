import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {user ? (
        <nav className="nav-bar">
          <div className="nav-left">
            <Link to="/">
              <span className="nav-logo">Trading Journal</span>
            </Link>
          </div>
          <div className="nav-right">
            <span className="nav-username">Welcome back, {user}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </nav>
      ) : (
        <nav className="nav-bar">
          <div className="nav-left">
            <span className="nav-logo">Trading Journal</span>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;
