import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {user ? (
        <nav className="flex items-center justify-between px-5 h-13 bg-white border-b border-gray-200">
          <div>
            <Link to="/">
              <span className="text-base font-bold text-blue-600 tracking-tight">
                Trading Journal
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="text-sm font-medium text-gray-500">
              Welcome back, {user}
            </span>
            <button
              className="px-3.5 py-1.5 bg-transparent text-blue-600 border border-blue-600 rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-blue-600 hover:text-white"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </nav>
      ) : (
        <nav className="flex items-center justify-between px-5 h-13 bg-white border-b border-gray-200">
          <div>
            <span className="text-base font-bold text-blue-600 tracking-tight">
              Trading Journal
            </span>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;
