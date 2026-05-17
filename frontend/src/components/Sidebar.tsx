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
    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm no-underline transition-colors duration-[120ms] ease-out md:px-0 md:justify-center lg:px-3 lg:justify-start ${
      active
        ? "bg-accent-light text-accent font-semibold"
        : "text-ink-secondary font-medium hover:bg-surface-alt hover:text-ink-primary"
    }`}
  >
    {icon}
    <span className="hidden lg:inline">{label}</span>
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
      className="hidden md:flex md:flex-col md:w-14 md:min-w-14 lg:w-[220px] lg:min-w-[220px] bg-surface-sidebar border-r border-border h-full"
      aria-label="Main navigation"
    >
      {/* Wordmark */}
      <div className="px-3 py-3 lg:px-4 lg:py-4 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2.5 no-underline md:justify-center lg:justify-start">
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
          <span className="hidden lg:inline text-[0.9375rem] font-semibold text-ink-primary tracking-tight leading-none">
            Trading Journal
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 md:px-1.5 lg:px-3 flex flex-col gap-0.5">
        <NavItem to="/dashboard" active={isDashboard} icon={<DashboardIcon />} label="Dashboard" />
        <NavItem to="/dashboard/journal" active={isJournal} icon={<JournalIcon />} label="Journal" />
      </nav>

      {/* Log Entry */}
      <div className="px-2 pb-2 lg:px-3 lg:pb-3 relative" ref={menuRef}>
        {menuOpen && (
          <div className="mb-1.5 min-w-max rounded-lg border border-border bg-surface shadow-dropdown py-1 overflow-y-auto">
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
          className="w-full flex items-center justify-center gap-2 px-3 py-2 md:w-10 md:h-10 md:p-0 md:mx-auto lg:w-full lg:h-auto lg:px-3 lg:py-2 bg-accent text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors duration-150 hover:bg-accent-hover"
        >
          <PlusIcon />
          <span className="hidden lg:inline">Log Entry</span>
        </button>
      </div>

      {/* User */}
      <div className="px-2 pb-3 pt-3 lg:px-3 lg:pb-4 border-t border-border">
        <div className="flex items-center gap-2.5 md:flex-col md:items-center md:gap-1.5 lg:flex-row lg:items-center lg:gap-2.5">
          <div className="w-7 h-7 rounded-full bg-accent-light flex items-center justify-center shrink-0">
            <span className="text-[11px] font-semibold text-accent leading-none">{initials}</span>
          </div>
          <span className="hidden lg:inline text-sm font-medium text-ink-secondary flex-1 min-w-0 truncate">{user}</span>
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

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
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

  const navItemBase = "flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-colors duration-[120ms] no-underline";

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border flex items-center justify-around h-16 px-2"
      aria-label="Mobile navigation"
    >
      <Link
        to="/dashboard"
        className={`${navItemBase} ${isDashboard ? "text-accent" : "text-ink-secondary"}`}
      >
        <DashboardIcon />
        <span className="text-[10px] font-medium">Dashboard</span>
      </Link>

      <div className="relative" ref={menuRef}>
        {menuOpen && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 min-w-[160px] rounded-lg border border-border bg-surface shadow-dropdown py-1">
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
          className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg text-accent transition-colors duration-[120ms] cursor-pointer"
          aria-label="Log entry"
        >
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white">
            <PlusIcon />
          </div>
          <span className="text-[10px] font-medium">Log</span>
        </button>
      </div>

      <Link
        to="/dashboard/journal"
        className={`${navItemBase} ${isJournal ? "text-accent" : "text-ink-secondary"}`}
      >
        <JournalIcon />
        <span className="text-[10px] font-medium">Journal</span>
      </Link>

      <div className="relative" ref={userMenuRef}>
        {userMenuOpen && (
          <div className="absolute bottom-full right-0 mb-2 min-w-[140px] rounded-lg border border-border bg-surface shadow-dropdown py-1">
            <button
              className="w-full cursor-pointer px-3.5 py-2.5 text-left text-sm text-ink-primary transition-colors duration-100 hover:bg-surface-alt select-none"
              onClick={() => {
                handleLogout();
                setUserMenuOpen(false);
              }}
            >
              Sign out
            </button>
          </div>
        )}
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg text-ink-secondary transition-colors duration-[120ms] cursor-pointer"
          aria-label="Account menu"
        >
          <div className="w-6 h-6 rounded-full bg-accent-light flex items-center justify-center">
            <span className="text-[9px] font-semibold text-accent leading-none">{initials}</span>
          </div>
          <span className="text-[10px] font-medium">Account</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
