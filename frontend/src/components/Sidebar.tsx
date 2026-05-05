import { useQuery } from "@tanstack/react-query";
import { getTradeEntries, getNoTradeEntries } from "../api/api";
import NoTradeEntryCard from "./NoTradeEntryCard.js";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { SidebarEntry } from "../types/common.types";
import TradeEntryCard from "./TradeEntryCard.js";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    data: allEntries,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["allEntries"],
    queryFn: async () => {
      const [tradeEntries, noTradeEntries] = await Promise.all([
        getTradeEntries(),
        getNoTradeEntries(),
      ]);

      const sorted: SidebarEntry[] = [...tradeEntries, ...noTradeEntries].sort(
        (a, b) =>
          new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime(),
      );
      return sorted;
    },
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading)
    return (
      <div className="w-60 p-4 text-sm text-ink-secondary">
        <p>Loading entries...</p>
      </div>
    );

  if (error)
    return (
      <div className="w-60 p-4 text-sm text-ink-secondary">
        <p>Error: {error.message}</p>
      </div>
    );

  return (
    <div className="w-60 min-w-60 bg-surface border-r border-border flex flex-col h-full">
      <div className="relative flex items-center justify-between px-5 py-3 border-b border-border">
        <h2 className="text-xs font-bold text-ink-primary uppercase tracking-wide">Entries</h2>
        <div ref={dropdownRef}>
          <button
            className="w-6 h-6 rounded-full bg-sage text-surface border-none text-base cursor-pointer flex items-center justify-center transition-colors hover:bg-sage-hover"
            onClick={() => setIsOpen(!isOpen)}
          >
            +
          </button>
          {isOpen && (
            <ul className="absolute top-10 right-2 bg-surface border border-border rounded-lg list-none z-50 min-w-[180px] shadow-dropdown overflow-hidden">
              <li
                className="px-3.5 py-2.5 text-sm text-ink-primary cursor-pointer border-b border-border transition-colors hover:bg-surface-alt hover:text-sage"
                onClick={() => {
                  navigate("trade-entries/new-entry");
                  setIsOpen(!isOpen);
                }}
              >
                Trade Entry
              </li>
              <li
                className="px-3.5 py-2.5 text-sm text-ink-primary cursor-pointer transition-colors hover:bg-surface-alt hover:text-sage"
                onClick={() => {
                  navigate("no-trade-entries/new-entry");
                  setIsOpen(!isOpen);
                }}
              >
                No Trade Entry
              </li>
            </ul>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {allEntries?.length === 0 ? (
          <p className="text-center text-ink-muted text-sm mt-5">
            No entries yet.
          </p>
        ) : (
          allEntries?.map((entry) =>
            "result" in entry ? (
              <Link
                key={entry._id}
                to={`/dashboard/trade-entries/${entry._id}`}
                className="no-underline"
              >
                <TradeEntryCard
                  createdAt={entry.entryTime}
                  pnl={entry.pnl}
                  result={entry.result}
                />
              </Link>
            ) : (
              <Link
                key={entry._id}
                to={`/dashboard/no-trade-entries/${entry._id}`}
                className="no-underline"
              >
                <NoTradeEntryCard entryTime={entry.entryTime} />
              </Link>
            ),
          )
        )}
      </div>
    </div>
  );
};

export default Sidebar;
