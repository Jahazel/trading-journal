import { useQuery } from "@tanstack/react-query";
import { getStats, getTradeEntries } from "../api/api";
import { Stats } from "../types/tradeEntry.types";
import TradeCalendar from "./TradeCalendar";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { formatCurrency, pnlColor } from "../utils/formatUtils";
interface RingChartProps {
  value: number;
}

const RingChart = ({ value }: RingChartProps) => {
  const size = 52;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillLength = (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-sage)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${fillLength} ${circumference - fillLength}`}
        strokeDashoffset={circumference * 0.25}
      />
    </svg>
  );
};

interface TradePipsProps {
  count: number;
}

const TradePips = ({ count }: TradePipsProps) => {
  const displayCount = Math.min(count, 10);
  const extra = count > 10 ? count - 10 : 0;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Array.from({ length: displayCount }).map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-sage" />
      ))}
      {extra > 0 && (
        <span className="text-[10px] text-ink-muted">+{extra} more</span>
      )}
    </div>
  );
};

const CardSkeleton = () => (
  <div className="flex-1 min-w-[180px] bg-surface border border-border rounded-xl p-5 animate-pulse">
    <div className="h-2.5 w-16 rounded bg-border mb-4" />
    <div className="h-8 w-24 rounded bg-border mb-3" />
    <div className="h-2.5 w-20 rounded bg-border" />
  </div>
);

const StatsDashboard = () => {
  const {
    data: stats,
    isLoading: statsLoading,
    error,
  } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  const { data: trades = [], isLoading: tradesLoading } = useQuery({
    queryKey: ["trades"],
    queryFn: getTradeEntries,
  });

  const isLoading = statsLoading || tradesLoading;

  const tradeCount = trades.length;
  const wins = trades.filter((t) => t.result === "Win").length;
  const losses = trades.filter((t) => t.result === "Loss").length;
  const daysTraded = new Set(trades.map((t) => t.exitTime.split("T")[0])).size;

  const totalPnl = stats?.totalPnl ?? 0;
  const winRate = stats?.winRate ?? 0;
  const avgWin = stats?.avgWin ?? 0;
  const avgLoss = stats?.avgLoss ?? 0;
  const avgPerTrade = tradeCount > 0 ? totalPnl / tradeCount : 0;

  const pf = losses > 0 && avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : null;
  const pfDisplay = pf !== null ? pf.toFixed(2) : "—";
  const pfRingValue = pf !== null ? Math.min(pf / 3, 1) * 100 : 0;

  const recentTrades = [...trades]
    .sort(
      (a, b) =>
        new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime(),
    )
    .slice(0, 5);

  const periodLabel = format(new Date(), "MMMM yyyy").toUpperCase();

  if (error)
    return (
      <div className="p-10">
        <p className="text-sm text-ink-secondary">
          Couldn't load your stats. Try refreshing.
        </p>
      </div>
    );

  return (
    <div className="p-10">
      <p className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
        {periodLabel}
      </p>

      <div className="flex flex-wrap gap-4 mb-10">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {/* Total P&L */}
            <div className="flex-1 min-w-[180px] bg-surface border border-border rounded-xl shadow-ambient p-5 flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                Total P&L
              </span>
              <span
                className={`text-3xl font-semibold tabular-nums leading-none ${pnlColor(totalPnl)}`}
              >
                {formatCurrency(totalPnl)}
              </span>
              <span className="text-xs text-ink-muted tabular-nums">
                {tradeCount > 0
                  ? `avg ${formatCurrency(avgPerTrade)}/trade`
                  : "No trades yet"}
              </span>
            </div>

            {/* Win Rate */}
            <div className="flex-1 min-w-[180px] bg-surface border border-border rounded-xl shadow-ambient p-5 flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                Win Rate
              </span>
              <div className="flex items-center justify-between gap-3">
                <span className="text-3xl font-semibold tabular-nums leading-none text-ink-primary">
                  {winRate.toFixed(1)}%
                </span>
                <RingChart value={winRate} />
              </div>
              <span className="text-xs text-ink-muted">
                {wins}w · {losses}l
              </span>
            </div>

            {/* Profit Factor */}
            <div className="flex-1 min-w-[180px] bg-surface border border-border rounded-xl shadow-ambient p-5 flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                Profit Factor
              </span>
              <div className="flex items-center justify-between gap-3">
                <span className="text-3xl font-semibold tabular-nums leading-none text-ink-primary">
                  {pfDisplay}
                </span>
                <RingChart value={pfRingValue} />
              </div>
              <span className="text-xs text-ink-muted tabular-nums">
                {losses > 0
                  ? `${formatCurrency(avgWin)} / ${formatCurrency(Math.abs(avgLoss))}`
                  : "No losses"}
              </span>
            </div>

            {/* Trades */}
            <div className="flex-1 min-w-[180px] bg-surface border border-border rounded-xl shadow-ambient p-5 flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                Trades
              </span>
              <span className="text-3xl font-semibold tabular-nums leading-none text-ink-primary">
                {tradeCount}
              </span>
              <TradePips count={tradeCount} />
              <span className="text-xs text-ink-muted">
                {daysTraded} day{daysTraded !== 1 ? "s" : ""} traded
              </span>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-8 items-start lg:flex-row">
        <TradeCalendar trades={trades} />

        <div className="flex-1 min-w-0">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
            Recent
          </h2>
          {trades.length === 0 ? (
            <p className="py-3 text-sm text-ink-secondary">
              No trades logged yet.{" "}
              <Link
                to="/dashboard/journal"
                className="text-sage no-underline hover:underline"
              >
                Start in the Journal.
              </Link>
            </p>
          ) : (
            <>
              <div>
                {recentTrades.map((trade) => (
                  <Link
                    key={trade._id}
                    to={`/dashboard/trade-entries/${trade._id}`}
                    className="no-underline"
                  >
                    <div className="flex flex-col gap-1 border-b border-border px-1 py-3 text-sm transition-colors last:border-b-0 hover:bg-surface-alt">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-ink-primary">
                          {trade.contract} · {trade.direction}
                        </span>
                        <span
                          className={`font-semibold tabular-nums ${pnlColor(trade.pnl)}`}
                        >
                          {formatCurrency(trade.pnl)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-ink-secondary">
                          {format(new Date(trade.entryTime), "MMM d, yyyy")}
                        </span>
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide text-ink-muted`}
                        >
                          {trade.result}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="pt-4">
                <Link
                  to="/dashboard/journal"
                  className="text-sm text-ink-secondary no-underline transition-colors hover:text-sage"
                >
                  View all in Journal →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
