import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const DashboardIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="6.5" height="6.5" rx="1.5" />
    <rect x="9.5" y="2" width="6.5" height="6.5" rx="1.5" />
    <rect x="2" y="9.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="9.5" y="9.5" width="6.5" height="6.5" rx="1.5" />
  </svg>
);

const JournalIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="2" width="12" height="14" rx="1.5" />
    <path d="M6 6.5h6M6 9h6M6 11.5h4" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M7 2v10M2 7h10" />
  </svg>
);

interface NavItemProps {
  to: string;
  active: boolean;
  tooltip: string;
  icon: React.ReactNode;
}

const NavItem = ({ to, active, tooltip, icon }: NavItemProps) => (
  <div className="relative group">
    <Link
      to={to}
      aria-label={tooltip}
      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors no-underline ${
        active
          ? "bg-sage-light text-sage"
          : "text-ink-secondary hover:bg-surface-alt hover:text-ink-primary"
      }`}
    >
      {icon}
    </Link>
    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink-primary px-2 py-1 text-xs text-surface opacity-0 transition-opacity duration-150 group-hover:opacity-100">
      {tooltip}
    </span>
  </div>
);

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDashboard =
    location.pathname === "/dashboard" || location.pathname === "/dashboard/";
  const isJournal =
    location.pathname.startsWith("/dashboard/journal") ||
    location.pathname.startsWith("/dashboard/trade-entries") ||
    location.pathname.startsWith("/dashboard/no-trade-entries");

  return (
    <div className="w-14 min-w-14 bg-surface border-r border-border flex flex-col items-center py-3 h-full gap-1">
      <NavItem
        to="/dashboard"
        active={isDashboard}
        tooltip="Dashboard"
        icon={<DashboardIcon />}
      />
      <NavItem
        to="/dashboard/journal"
        active={isJournal}
        tooltip="Journal"
        icon={<JournalIcon />}
      />

      <div className="flex-1" />

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? undefined : "New Entry"}
          aria-label="New Entry"
          className="w-9 h-9 rounded-full bg-sage text-surface flex items-center justify-center cursor-pointer transition-colors hover:bg-sage-hover"
        >
          <PlusIcon />
        </button>
        {isOpen && (
          <div className="absolute top-0 left-full z-50 ml-2 min-w-[160px] overflow-hidden rounded-lg border border-border bg-surface shadow-dropdown">
            <button
              className="w-full cursor-pointer border-b border-border px-3.5 py-2.5 text-left text-sm text-ink-primary transition-colors hover:bg-surface-alt hover:text-sage"
              onClick={() => {
                navigate("/dashboard/trade-entries/new-entry");
                setIsOpen(false);
              }}
            >
              Trade Entry
            </button>
            <button
              className="w-full cursor-pointer px-3.5 py-2.5 text-left text-sm text-ink-primary transition-colors hover:bg-surface-alt hover:text-sage"
              onClick={() => {
                navigate("/dashboard/no-trade-entries/new-entry");
                setIsOpen(false);
              }}
            >
              No Trade Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
