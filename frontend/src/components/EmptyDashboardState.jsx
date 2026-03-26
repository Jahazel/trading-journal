import { useNavigate } from "react-router-dom";

const EmptyDashboardState = () => {
  const navigate = useNavigate();

  return (
    <div className="empty-state">
      <svg
        className="empty-state-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3>No Trade Selected</h3>
      <p>
        Select a trade from the sidebar to view its details, or create a new
        trade to get started.
      </p>
      <button
        className="empty-state-btn"
        onClick={() => navigate("trades/new-entry")}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Log New Trade
      </button>
    </div>
  );
};

export default EmptyDashboardState;
