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

      const tradeWithType = tradeEntries.map((entry) => ({
        ...entry,
        type: "trades" as const,
        entryDate: entry.entryTime,
      }));
      const noTradeWithType = noTradeEntries.map((entry) => ({
        ...entry,
        type: "noTrades" as const,
        entryDate: entry.date,
      }));

      const sorted: SidebarEntry[] = [
        ...tradeWithType,
        ...noTradeWithType,
      ].sort(
        (a, b) =>
          new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime(),
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
      <div className="sidebar-loading">
        <p>Loading entries...</p>
      </div>
    );

  if (error)
    return (
      <div className="sidebar-error">
        <p>Error: {error.message}</p>
      </div>
    );

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h2>Entries</h2>
        <div className="dropdown-wrapper" ref={dropdownRef}>
          <button className="new-entry-btn" onClick={() => setIsOpen(!isOpen)}>
            +
          </button>
          {isOpen && (
            <ul className="drop-down">
              <li
                onClick={() => {
                  navigate("trade-entries/new-entry");
                  setIsOpen(!isOpen);
                }}
              >
                Trade Entry
              </li>
              <li
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
      <div className="entries-container">
        {allEntries?.length === 0 ? (
          <p className="no-entries">No entries yet.</p>
        ) : (
          allEntries?.map((entry) =>
            entry.type === "trades" ? (
              <Link
                key={entry._id}
                to={`/dashboard/trade-entries/${entry._id}`}
              >
                <TradeEntryCard createdAt={entry.entryTime} pnl={entry.pnl} />
              </Link>
            ) : (
              <Link
                key={entry._id}
                to={`/dashboard/no-trade-entries/${entry._id}`}
              >
                <NoTradeEntryCard date={entry.date} />
              </Link>
            ),
          )
        )}
      </div>
    </div>
  );
};

export default Sidebar;
