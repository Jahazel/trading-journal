import { useQuery } from "@tanstack/react-query";
import { getTradeEntries, getNoTradeEntries } from "../api/api";
import TradeCard from "./TradeCard";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import NoTradeEntryCard from "./NoTradeEntryCard";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

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
        type: "trades",
      }));
      const noTradeWithType = noTradeEntries.map((entry) => ({
        ...entry,
        type: "noTrades",
      }));

      const sorted = [...tradeWithType, ...noTradeWithType].sort(
        (a, b) => new Date(b.entryTime) - new Date(a.date),
      );
      return sorted;
    },
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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
                  navigate("trades/new-entry");
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
          allEntries.map((entry) =>
            entry.type === "trades" ? (
              <Link key={entry._id} to={`/dashboard/trades/${entry._id}`}>
                <TradeCard createdAt={entry.entryTime} pnl={entry.pnl} />
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
