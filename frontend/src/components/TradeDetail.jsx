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
    _id,
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
  } = entry?.tradeEntry || {};

  const isProfit = pnl > 0;
  const profitClass = isProfit ? "profit" : "loss";

  return (
    <div className="entry-container">
      <div className="entry-header-section">
        <h1 className="entry-header">Trade Details</h1>
        <div className="trade-id">ID: {_id}</div>
      </div>
      <div className="entry-detail-container">
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-label">Contract</div>
            <div className="summary-value">{contract}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Direction</div>
            <div className={`direction-badge ${direction?.toLowerCase()}`}>
              {direction}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">P&L</div>
            <div className={`summary-value ${profitClass}`}>
              {isProfit ? "+" : ""}
              {pnl}
            </div>
          </div>
        </div>
        <div className="details-grid">
          <div className="details-section">
            <h3 className="section-title">
              <svg
                className="section-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              Entry Information
            </h3>
            <div className="detail-row">
              <span className="detail-label">Entry Price:</span>
              <span className="detail-value">
                ${entryPrice?.toLocaleString()}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Entry Time:</span>
              <span className="detail-value">
                {entryTime && new Date(entryTime).toLocaleString()}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Contracts:</span>
              <span className="detail-value">{contracts}</span>
            </div>
          </div>
          <div className="details-section">
            <h3 className="section-title">
              <svg
                className="section-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 13l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
              Exit Information
            </h3>
            <div className="detail-row">
              <span className="detail-label">Exit Price:</span>
              <span className="detail-value">
                ${exitPrice?.toLocaleString()}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Exit Time:</span>
              <span className="detail-value">
                {exitTime && new Date(exitTime).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="details-section">
            <h3 className="section-title">
              <svg
                className="section-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Risk Management
            </h3>
            <div className="detail-row">
              <span className="detail-label">Stop Loss:</span>
              <span className="detail-value">
                ${stopLoss?.toLocaleString()}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Target:</span>
              <span className="detail-value">${target?.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Setup:</span>
              <span className="detail-value">{setup || "N/A"}</span>
            </div>
          </div>
        </div>
        {notes && (
          <div className="notes-section">
            <h3 className="section-title">
              <svg
                className="section-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Trade Notes
            </h3>
            <div className="notes-content">{notes}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeDetail;
