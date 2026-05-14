import { useQuery } from "@tanstack/react-query";
import { getTradeEntries, getNoTradeEntries, getAccounts } from "../api/api";
import AccountModal from "../components/AccountModal";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { SidebarEntry } from "../types/common.types";
import { TradeEntry } from "../types/tradeEntry.types";
import { NoTradeEntry } from "../types/noTradeEntry.types";
import { format } from "date-fns";
import { formatCurrency, pnlColor, resultColorClass } from "../utils/formatUtils";
import LoadingSpinner from "../components/LoadingSpinner";

const RECENT_COUNT = 6;

const isTradeEntry = (entry: SidebarEntry): entry is TradeEntry =>
  "result" in entry;

const entryPath = (entry: SidebarEntry) =>
  isTradeEntry(entry)
    ? `/dashboard/trade-entries/${entry._id}`
    : `/dashboard/no-trade-entries/${entry._id}`;

// --- Icons ---

const ChevronDownIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2.5 4.5L6 8l3.5-3.5" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4.5 2.5L8 6l-3.5 3.5" />
  </svg>
);

const BookIcon = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="8" y="4" width="20" height="28" rx="3" />
    <line x1="8" y1="4" x2="8" y2="32" strokeWidth="3" />
    <line x1="14" y1="13" x2="22" y2="13" />
    <line x1="14" y1="18" x2="22" y2="18" />
    <line x1="14" y1="23" x2="18" y2="23" />
  </svg>
);

// --- Empty State ---

const EmptyState = ({ onNavigate }: { onNavigate: (path: string) => void }) => (
  <div className="flex flex-col items-center justify-center gap-5 py-32 text-center">
    <div className="text-ink-muted opacity-40">
      <BookIcon />
    </div>
    <div className="flex flex-col gap-1.5">
      <h2 className="text-lg font-semibold text-ink-primary">
        Your journal is empty
      </h2>
      <p className="max-w-[38ch] text-sm leading-relaxed text-ink-secondary">
        Log a trade or a deliberate pass to start building your record.
      </p>
    </div>
    <div className="mt-1 flex flex-col items-center gap-2.5">
      <button
        onClick={() => onNavigate("/dashboard/trade-entries/new-entry")}
        className="cursor-pointer rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover"
      >
        Log your first trade
      </button>
      <button
        onClick={() => onNavigate("/dashboard/no-trade-entries/new-entry")}
        className="cursor-pointer text-sm text-ink-muted transition-colors duration-100 hover:text-ink-secondary"
      >
        Or log a no-trade →
      </button>
    </div>
  </div>
);

// --- New Entry Dropdown ---

interface NewEntryDropdownProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onNavigate: (path: string) => void;
}

const NewEntryDropdown = ({
  isOpen,
  setIsOpen,
  containerRef,
  onNavigate,
}: NewEntryDropdownProps) => (
  <div className="relative" ref={containerRef}>
    <button
      onClick={() => setIsOpen(!isOpen)}
      aria-haspopup="true"
      aria-expanded={isOpen}
      className="flex cursor-pointer items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover"
    >
      New Entry
      <ChevronDownIcon />
    </button>
    {isOpen && (
      <div
        role="menu"
        className="absolute right-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-lg border border-border bg-surface shadow-dropdown"
      >
        <button
          role="menuitem"
          className="w-full cursor-pointer border-b border-border px-3.5 py-2.5 text-left text-sm text-ink-primary transition-colors duration-100 hover:bg-surface-alt"
          onClick={() => {
            onNavigate("/dashboard/trade-entries/new-entry");
            setIsOpen(false);
          }}
        >
          Trade Entry
        </button>
        <button
          role="menuitem"
          className="w-full cursor-pointer px-3.5 py-2.5 text-left text-sm text-ink-primary transition-colors duration-100 hover:bg-surface-alt"
          onClick={() => {
            onNavigate("/dashboard/no-trade-entries/new-entry");
            setIsOpen(false);
          }}
        >
          No Trade Entry
        </button>
      </div>
    )}
  </div>
);

// --- Recent Entry Cards ---

const TradeCard = ({ entry }: { entry: TradeEntry }) => {
  const date = format(new Date(entry.entryTime), "MMM d");
  const year = format(new Date(entry.entryTime), "yyyy");

  return (
    <div className="flex h-40 flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-shadow duration-150 ease-out hover:shadow-ambient">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-accent-light px-2 py-0.5 text-[10px] font-medium text-accent">
          Trade
        </span>
        <span className={`text-xs font-medium ${resultColorClass(entry.result)}`}>
          {entry.result}
        </span>
      </div>
      <div>
        <div className="text-xl font-semibold leading-none text-ink-primary">
          {date}
        </div>
        <div className="mt-0.5 text-xs text-ink-muted">{year}</div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-ink-muted">
          {entry.contract} · {entry.direction}
        </span>
        <span className={`text-sm font-semibold tabular-nums ${pnlColor(entry.pnl)}`}>
          {entry.pnl > 0 ? "+" : ""}
          {formatCurrency(entry.pnl)}
        </span>
      </div>
    </div>
  );
};

const NoTradeCard = ({ entry }: { entry: NoTradeEntry }) => {
  const date = format(new Date(entry.entryTime), "MMM d");
  const year = format(new Date(entry.entryTime), "yyyy");

  return (
    <div className="flex h-40 flex-col justify-between rounded-xl border border-border bg-surface p-4 transition-shadow duration-150 ease-out hover:shadow-ambient">
      <div>
        <span className="rounded-full border border-border bg-surface-alt px-2 py-0.5 text-[10px] font-medium text-ink-muted">
          No Trade
        </span>
      </div>
      <div>
        <div className="text-xl font-semibold leading-none text-ink-secondary">
          {date}
        </div>
        <div className="mt-0.5 text-xs text-ink-muted">{year}</div>
      </div>
      <div>
        <span className="text-xs text-ink-muted">No trade taken</span>
      </div>
    </div>
  );
};

const RecentCard = ({ entry }: { entry: SidebarEntry }) =>
  isTradeEntry(entry) ? (
    <TradeCard entry={entry} />
  ) : (
    <NoTradeCard entry={entry as NoTradeEntry} />
  );

// --- Earlier Entry Rows ---

const EntryRow = ({ entry }: { entry: SidebarEntry }) => {
  const isTrade = isTradeEntry(entry);
  const formattedDate = format(new Date(entry.entryTime), "MMM d, yyyy");
  const trade = isTrade ? (entry as TradeEntry) : null;

  return (
    <div className="group flex items-start justify-between gap-6 rounded-md px-3 py-4 transition-[background-color,box-shadow] duration-150 ease-out hover:bg-surface-alt hover:shadow-ambient">
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-[0.9375rem] font-medium leading-snug text-ink-primary">
          {formattedDate}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              isTrade
                ? "bg-accent-light text-accent"
                : "border border-border bg-surface-alt text-ink-muted"
            }`}
          >
            {isTrade ? "Trade" : "No Trade"}
          </span>
          <span className="truncate text-sm text-ink-muted">
            {trade ? `${trade.contract} · ${trade.direction}` : "No trade taken"}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
        <span
          className={`text-[0.9375rem] font-semibold tabular-nums ${
            trade ? pnlColor(trade.pnl) : "text-ink-muted"
          }`}
        >
          {trade
            ? `${trade.pnl > 0 ? "+" : ""}${formatCurrency(trade.pnl)}`
            : "—"}
        </span>
        <span className="text-ink-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <ChevronRightIcon />
        </span>
      </div>
    </div>
  );
};

// --- Page ---

const JournalPage = () => {
  const navigate = useNavigate();
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const newEntryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        newEntryRef.current &&
        !newEntryRef.current.contains(e.target as Node)
      ) {
        setNewEntryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["allAccounts"],
    queryFn: getAccounts,
  });

  const { data: allEntries = [], isLoading } = useQuery<SidebarEntry[]>({
    queryKey: ["allEntries"],
    queryFn: async () => {
      const [tradeEntries, noTradeEntries] = await Promise.all([
        getTradeEntries(),
        getNoTradeEntries(),
      ]);
      return [...tradeEntries, ...noTradeEntries].sort(
        (a, b) =>
          new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime(),
      );
    },
  });

  if (isLoading || accountsLoading) return <LoadingSpinner />;

  if (accounts.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-10 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-primary mb-8">Journal</h1>
        <p className="text-sm text-ink-secondary mb-4">
          You need a trading account before you can log entries.
        </p>
        <button
          onClick={() => setAccountModalOpen(true)}
          className="text-sm text-ink-muted hover:text-ink-primary transition-colors duration-150 cursor-pointer"
        >
          + New Account
        </button>
        {accountModalOpen && <AccountModal onClose={() => setAccountModalOpen(false)} />}
      </div>
    );
  }

  const recent = allEntries.slice(0, RECENT_COUNT);
  const older = allEntries.slice(RECENT_COUNT);

  return (
    <div className="mx-auto max-w-5xl px-10 py-10">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-primary">
          Journal
        </h1>
        <NewEntryDropdown
          isOpen={newEntryOpen}
          setIsOpen={setNewEntryOpen}
          containerRef={newEntryRef}
          onNavigate={navigate}
        />
      </div>

      {allEntries.length === 0 ? (
        <EmptyState onNavigate={navigate} />
      ) : (
        <>
          <section aria-label="Recent entries">
            <h2 className="mb-4 text-xs font-medium text-ink-muted">Recent</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {recent.map((entry) => (
                <Link
                  key={entry._id}
                  to={entryPath(entry)}
                  className="no-underline"
                  aria-label={`${isTradeEntry(entry) ? "Trade" : "No trade"} entry from ${format(new Date(entry.entryTime), "MMMM d, yyyy")}`}
                >
                  <RecentCard entry={entry} />
                </Link>
              ))}
            </div>
          </section>

          {older.length > 0 && (
            <section aria-label="Earlier entries" className="mt-12">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-medium text-ink-muted">Earlier</h2>
                <span className="text-xs text-ink-muted">
                  {older.length} {older.length === 1 ? "entry" : "entries"}
                </span>
              </div>
              <div className="border-t border-border">
                {older.map((entry) => (
                  <Link
                    key={entry._id}
                    to={entryPath(entry)}
                    className="block border-b border-border no-underline last:border-b-0"
                  >
                    <EntryRow entry={entry} />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default JournalPage;
