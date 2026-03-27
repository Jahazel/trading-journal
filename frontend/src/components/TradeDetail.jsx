import { useQuery } from "@tanstack/react-query";
import { getEntry } from "../api/api";
import { useParams } from "react-router-dom";

const TradeDetail = () => {
  const { id } = useParams();

  const {
    data: entry,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["entry", id],
    queryFn: () => getEntry(id),
    enabled: !!id,
  });

  if (isLoading)
    return (
      <div className="entry-loading">
        <div className="loading-spinner"></div>
        <p>Loading trade details...</p>
      </div>
    );

  if (error)
    return (
      <div className="entry-error">
        <svg
          className="error-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>Error: {error.message}</p>
      </div>
    );

  const {
    contract,
    direction,
    contracts,
    entryPrice,
    exitPrice,
    stopLoss,
    target,
    entryTime,
    exitTime,
    pnl,
    setup,
    notes,
  } = entry || {};

  const isProfit = pnl > 0;
  const formattedEntry =
    entryTime &&
    new Date(entryTime).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  const formattedExit =
    exitTime &&
    new Date(exitTime).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="entry-container">
      <div className="nd-journal">
        {/* Header */}
        <div className="nd-header">
          <div className="nd-breadcrumb">Trading Journal</div>
          <div className="nd-title-row">
            <span className="nd-ticker">{contract}</span>
            <span className={`nd-badge ${direction?.toLowerCase()}`}>
              {direction}
            </span>
            <span className={`nd-pnl ${isProfit ? "profit" : "loss"}`}>
              {isProfit ? "+" : ""}${pnl?.toLocaleString()}
            </span>
          </div>
          <div className="nd-meta">
            Entry: {formattedEntry} &nbsp;&middot;&nbsp; Exit: {formattedExit}
          </div>
        </div>

        <div className="nd-body">
          {/* Position Section */}
          <div className="nd-section">
            <div className="nd-section-label">Position</div>
            <div className="nd-stats-row">
              <div className="nd-stat">
                <span className="nd-stat-label">Contracts</span>
                <span className="nd-stat-value">{contracts}</span>
              </div>
              <div className="nd-stat">
                <span className="nd-stat-label">Entry Price</span>
                <span className="nd-stat-value">
                  ${entryPrice?.toLocaleString()}
                </span>
              </div>
              <div className="nd-stat">
                <span className="nd-stat-label">Exit Price</span>
                <span className="nd-stat-value">
                  ${exitPrice?.toLocaleString()}
                </span>
              </div>
              <div className="nd-stat">
                <span className="nd-stat-label">Stop Loss</span>
                <span className="nd-stat-value">
                  ${stopLoss?.toLocaleString()}
                </span>
              </div>
              <div className="nd-stat">
                <span className="nd-stat-label">Target</span>
                <span className="nd-stat-value">
                  ${target?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Setup Section */}
          <div className="nd-section">
            <div className="nd-section-label">Setup</div>
            {setup ? (
              <div className="nd-prose-block">{setup}</div>
            ) : (
              <div className="nd-prose-block nd-prose-empty">
                No setup recorded.
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="nd-section">
            <div className="nd-section-label">Notes</div>
            {notes ? (
              <div className="nd-prose-block">{notes}</div>
            ) : (
              <div className="nd-prose-block nd-prose-empty">
                No notes added.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeDetail;
