import { useQuery } from "@tanstack/react-query";
import { getStats, getTradeEntries } from "../api/api";
import { Stats } from "../types/tradeEntry.types";
import TradeCalendar from "./TradeCalendar";

const StatsDashboard = () => {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  const { data: trades = [] } = useQuery({
    queryKey: ["trades"],
    queryFn: getTradeEntries,
  });

  if (isLoading)
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500">
          Loading trading stats details...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <svg
          className="w-12 h-12 text-red-500"
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
        <p className="text-sm text-red-500">Error: {error.message}</p>
      </div>
    );

  if (!stats) return null;

  const { totalPnl, winRate, avgWin, avgLoss } = stats;

  const statCardStyles =
    "flex-1 min-w-[160px] bg-white border border-gray-200 rounded-xl px-4 py-3.5 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:border-blue-500 hover:shadow-lg";

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
    <div className="p-8 px-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Your trading performance overview
        </p>
      </div>
      <div className="flex flex-wrap gap-5">
        <div className={statCardStyles}>
          <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">
            Total P&L
          </h3>
          <div
            className={`text-sm font-bold ${totalPnl >= 0 ? "text-emerald-500" : "text-red-500"}`}
          >
            {formatCurrency(totalPnl)}
          </div>
        </div>
        <div className={statCardStyles}>
          <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">
            Win Rate
          </h3>
          <div className="text-sm font-bold text-gray-900">
            {formatPercent(winRate)}
          </div>
        </div>
        <div className={statCardStyles}>
          <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">
            Avg Win
          </h3>
          <div className="text-sm font-bold text-emerald-500">
            {formatCurrency(avgWin)}
          </div>
        </div>
        <div className={statCardStyles}>
          <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">
            Avg Loss
          </h3>
          <div className="text-sm font-bold text-red-500">
            {formatCurrency(Math.abs(avgLoss))}
          </div>
        </div>
      </div>
      <TradeCalendar trades={trades} />
    </div>
  );
};
export default StatsDashboard;
