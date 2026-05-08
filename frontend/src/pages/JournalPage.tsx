import { useQuery } from "@tanstack/react-query";
import { getTradeEntries, getNoTradeEntries } from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { SidebarEntry } from "../types/common.types";
import { TradeEntry } from "../types/tradeEntry.types";
import { format } from "date-fns";
import {
  formatCurrency,
  resultColorClass,
  pnlColor,
} from "../utils/formatUtils";
import LoadingSpinner from "../components/LoadingSpinner";

const RECENT_COUNT = 6;

const isTradeEntry = (entry: SidebarEntry): entry is TradeEntry =>
  "result" in entry;

const ChevronIcon = () => (
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

interface EntryCardProps {
  entry: SidebarEntry;
}

const EntryCard = ({ entry }: EntryCardProps) => {
  const isTrade = isTradeEntry(entry);
  const date = format(new Date(entry.entryTime), "MMM d");
  const year = format(new Date(entry.entryTime), "yyyy");

  return (
    <div className="flex h-40 cursor-pointer flex-col justify-between rounded-lg border border-border bg-surface p-4 transition-all hover:border-sage hover:shadow-lift">
      <div className="flex items-start justify-between gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            isTrade
              ? "bg-sage-light text-sage"
              : "border border-border bg-surface-alt text-ink-secondary"
          }`}
        >
          {isTrade ? "Trade" : "No Trade"}
        </span>
        {isTrade && (
          <span
            className={`text-xs font-medium ${resultColorClass(entry.result)}`}
          >
            {entry.result}
          </span>
        )}
      </div>

      <div>
        <div className="text-xl font-semibold leading-tight text-ink-primary">
          {date}
        </div>
        <div className="mt-0.5 text-xs text-ink-muted">{year}</div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {isTrade ? (
          <>
            <span className="text-xs text-ink-secondary">
              {entry.contract} · {entry.direction}
            </span>
            <span
              className={`text-sm font-semibold tabular-nums ${
                entry.pnl >= 0 ? "text-pnl-positive" : "text-pnl-negative"
              }`}
            >
              {formatCurrency(entry.pnl)}
            </span>
          </>
        ) : (
          <span className="text-xs text-ink-muted">No trade taken</span>
        )}
      </div>
    </div>
  );
};

interface EntryRowProps {
  entry: SidebarEntry;
}

const EntryRow = ({ entry }: EntryRowProps) => {
  const isTrade = isTradeEntry(entry);
  const formattedDate = format(new Date(entry.entryTime), "MMM d, yyyy");

  return (
    <div className="flex cursor-pointer items-center gap-4 border-b border-border px-1 py-3 last:border-b-0 transition-colors hover:bg-surface-alt">
      <span className="w-28 shrink-0 text-sm text-ink-secondary">
        {formattedDate}
      </span>
      <span
        className={`w-20 shrink-0 rounded-full px-2 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wide ${
          isTrade
            ? "bg-sage-light text-sage"
            : "border border-border bg-surface-alt text-ink-secondary"
        }`}
      >
        {isTrade ? "Trade" : "No Trade"}
      </span>
      {isTrade ? (
        <>
          <span className="w-16 shrink-0 text-sm font-medium text-ink-primary">
            {entry.contract}
          </span>
          <span className="w-14 shrink-0 text-sm text-ink-secondary">
            {entry.direction}
          </span>
          <span
            className={`ml-auto text-sm font-semibold tabular-nums ${pnlColor(entry.pnl)}`}
          >
            {formatCurrency(entry.pnl)}
          </span>
        </>
      ) : (
        <span className="ml-auto text-sm text-ink-muted">No trade taken</span>
      )}
    </div>
  );
};

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
      className="flex cursor-pointer items-center gap-1.5 rounded-md bg-sage px-4 py-2 text-sm font-medium text-surface transition-colors hover:bg-sage-hover"
    >
      New Entry
      <ChevronIcon />
    </button>
    {isOpen && (
      <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-lg border border-border bg-surface shadow-dropdown">
        <button
          className="w-full cursor-pointer border-b border-border px-3.5 py-2.5 text-left text-sm text-ink-primary transition-colors hover:bg-surface-alt hover:text-sage"
          onClick={() => {
            onNavigate("/dashboard/trade-entries/new-entry");
            setIsOpen(false);
          }}
        >
          Trade Entry
        </button>
        <button
          className="w-full cursor-pointer px-3.5 py-2.5 text-left text-sm text-ink-primary transition-colors hover:bg-surface-alt hover:text-sage"
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

const JournalPage = () => {
  const navigate = useNavigate();
  const [newEntryOpen, setNewEntryOpen] = useState(false);
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

  const entryPath = (entry: SidebarEntry) =>
    isTradeEntry(entry)
      ? `/dashboard/trade-entries/${entry._id}`
      : `/dashboard/no-trade-entries/${entry._id}`;

  if (isLoading) return <LoadingSpinner />;

  if (allEntries.length === 0) {
    return (
      <div className="p-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-ink-primary">Journal</h1>
          <NewEntryDropdown
            isOpen={newEntryOpen}
            setIsOpen={setNewEntryOpen}
            containerRef={newEntryRef}
            onNavigate={navigate}
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <p className="text-sm text-ink-secondary">No entries yet.</p>
          <button
            onClick={() => navigate("/dashboard/trade-entries/new-entry")}
            className="cursor-pointer text-sm font-medium text-sage hover:underline"
          >
            Log your first trade →
          </button>
        </div>
      </div>
    );
  }

  const recent = allEntries.slice(0, RECENT_COUNT);
  const older = allEntries.slice(RECENT_COUNT);

  return (
    <div className="p-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink-primary">Journal</h1>
        <NewEntryDropdown
          isOpen={newEntryOpen}
          setIsOpen={setNewEntryOpen}
          containerRef={newEntryRef}
          onNavigate={navigate}
        />
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
          Recent
        </h2>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {recent.map((entry) => (
            <Link
              key={entry._id}
              to={entryPath(entry)}
              className="no-underline"
            >
              <EntryCard entry={entry} />
            </Link>
          ))}
        </div>
      </section>

      {older.length > 0 && (
        <section>
          <div className="mb-4 border-t border-border" />
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
            Earlier
          </h2>
          <div>
            {older.map((entry) => (
              <Link
                key={entry._id}
                to={entryPath(entry)}
                className="no-underline"
              >
                <EntryRow entry={entry} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default JournalPage;
