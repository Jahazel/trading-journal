import { useQuery } from "@tanstack/react-query";
import { getEntries } from "../api/api";
import TradeCard from "./TradeCard";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const {
    data: entries,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["entries"],
    queryFn: getEntries,
  });
  const navigate = useNavigate();

  const createEntry = () => {
    navigate("trades/new-entry");
  };

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
        <button className="new-entry-btn" onClick={createEntry}>
          +
        </button>
      </div>
      <div className="entries-container">
        {entries?.length === 0 ? (
          <p className="no-entries">No entries yet.</p>
        ) : (
          entries.map(({ direction, _id, createdAt, pnl }) => (
            <Link key={_id} to={`/dashboard/trades/${_id}`}>
              <TradeCard
                direction={direction}
                createdAt={createdAt}
                pnl={pnl}
              />
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
