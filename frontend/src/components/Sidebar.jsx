import { useQuery } from "@tanstack/react-query";
import { getEntries } from "../api/api";
import TradeCard from "./TradeCard";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const {
    data: entries,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["entries"],
    queryFn: getEntries,
  });

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
        <button className="new-entry-btn">+</button>
      </div>
      <div className="entries-container">
        {entries?.trades?.length === 0 ? (
          <p className="no-entries">No entries yet.</p>
        ) : (
          entries.trades.map(({ direction, pnl, _id }) => (
            <Link key={_id} to={`/dashboard/trades/${_id}`}>
              <TradeCard direction={direction} pnl={pnl} _id={_id} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
