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
        <nav className="flex items-center justify-between px-5 h-13 bg-surface border-b border-border">
          <div>
            <Link to="/">
              <span className="text-base font-bold text-ink-primary tracking-tight">
                Trading Journal
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="text-sm font-medium text-ink-secondary">
              Welcome back, {user}
            </span>
            <button
              className="px-3.5 py-1.5 bg-transparent text-sage border border-sage rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-sage hover:text-surface"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </nav>
      ) : (
        <nav className="flex items-center justify-between px-5 h-13 bg-surface border-b border-border">
          <div>
            <span className="text-base font-bold text-ink-primary tracking-tight">
              Trading Journal
            </span>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;
