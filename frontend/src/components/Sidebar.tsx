import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const DashboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.25" />
    <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.25" />
    <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.25" />
    <rect x="9" y="9" width="5.5" height="5.5" rx="1.25" />
  </svg>
);

const JournalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2.5" y="1.5" width="11" height="13" rx="1.25" />
    <path d="M5 5.5h6M5 8h6M5 10.5h3.5" />
  </svg>
);

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M6.5 1.5v10M1.5 6.5h10" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9.5 10L12.5 7 9.5 4" />
    <path d="M12.5 7H5.5" />
    <path d="M5.5 1.5H2A.5.5 0 0 0 1.5 2v10a.5.5 0 0 0 .5.5h3.5" />
  </svg>
);

interface NavItemProps {
  to: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ to, active, icon, label }: NavItemProps) => (
  <Link
    to={to}
    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm no-underline transition-colors duration-[120ms] ease-out ${
      active
        ? "bg-accent-light text-accent font-semibold"
        : "text-ink-secondary font-medium hover:bg-surface-alt hover:text-ink-primary"
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/dashboard/";
  const isJournal =
    location.pathname.startsWith("/dashboard/journal") ||
    location.pathname.startsWith("/dashboard/trade-entries") ||
    location.pathname.startsWith("/dashboard/no-trade-entries");

  const initials = user
    ? user.split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase()).join("").slice(0, 2)
    : "?";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className="w-[220px] min-w-[220px] bg-surface-sidebar border-r border-border flex flex-col h-full"
      aria-label="Main navigation"
    >
      {/* Wordmark */}
      <div className="px-4 py-4 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2.5 no-underline">
          <div className="w-[26px] h-[26px] rounded-md bg-accent flex items-center justify-center shrink-0">
            <svg width="13" height="11" viewBox="0 0 13 11" fill="none" aria-hidden="true">
              <polyline
                points="1,9 5,4.5 8,6.5 12,1"
                stroke="white"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-[0.9375rem] font-semibold text-ink-primary tracking-tight leading-none">
            Trading Journal
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
        <NavItem to="/dashboard" active={isDashboard} icon={<DashboardIcon />} label="Dashboard" />
        <NavItem to="/dashboard/journal" active={isJournal} icon={<JournalIcon />} label="Journal" />
      </nav>

      {/* Log Entry */}
      <div className="px-3 pb-3" ref={menuRef}>
        {menuOpen && (
          <div className="mb-1.5 rounded-lg border border-border bg-surface shadow-dropdown py-1 overflow-y-auto">
            <button
              className="w-full cursor-pointer px-3.5 py-2.5 text-left text-sm text-ink-primary transition-colors duration-100 hover:bg-surface-alt select-none"
              onClick={() => {
                navigate("/dashboard/trade-entries/new-entry");
                setMenuOpen(false);
              }}
            >
              Trade Entry
            </button>
            <button
              className="w-full cursor-pointer px-3.5 py-2.5 text-left text-sm text-ink-primary transition-colors duration-100 hover:bg-surface-alt select-none"
              onClick={() => {
                navigate("/dashboard/no-trade-entries/new-entry");
                setMenuOpen(false);
              }}
            >
              No Trade Entry
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-accent text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors duration-150 hover:bg-accent-hover"
        >
          <PlusIcon />
          Log Entry
        </button>
      </div>

      {/* User */}
      <div className="px-3 pb-4 pt-3 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-accent-light flex items-center justify-center shrink-0">
            <span className="text-[11px] font-semibold text-accent leading-none">{initials}</span>
          </div>
          <span className="text-sm font-medium text-ink-secondary flex-1 min-w-0 truncate">{user}</span>
          <button
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="text-ink-muted hover:text-ink-primary transition-colors duration-150 cursor-pointer p-1 rounded shrink-0"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
