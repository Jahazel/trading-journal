import { useQuery } from "@tanstack/react-query";
import { getStats } from "../api/api";
import { Stats } from "../types/tradeEntry.types";

const StatsDashboard = () => {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  if (isLoading)
    return (
      <div className="stats-loading">
        <div className="loading-spinner"></div>
        <p>Loading trading stats details...</p>
      </div>
    );

  if (error)
    return (
      <div className="stats-error">
        <svg
          className="stats-icon"
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

  if (!stats) return null;

  const { totalPnl, winRate, avgWin, avgLoss } = stats;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const formatPercent = (value: number) => {
    return `${(value || 0).toFixed(2)}%`;
  };

  return (
    <div className="stats-main">
      <div className="stats-header">
        <h1>Dashboard</h1>
        <p>Your trading performance overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total P&L</h3>
          <div className={`stat-value ${totalPnl >= 0 ? "profit" : "loss"}`}>
            {formatCurrency(totalPnl)}
          </div>
        </div>

        <div className="stat-card">
          <h3>Win Rate</h3>
          <div className="stat-value">{formatPercent(winRate)}</div>
        </div>

        <div className="stat-card">
          <h3>Avg Win</h3>
          <div className="stat-value profit">{formatCurrency(avgWin)}</div>
        </div>

        <div className="stat-card">
          <h3>Avg Loss</h3>
          <div className="stat-value loss">
            {formatCurrency(Math.abs(avgLoss))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
