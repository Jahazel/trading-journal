import { useQuery } from "@tanstack/react-query";
import { getStats, getTradeEntries, getAccounts } from "../api/api";
import { Stats, TradeEntry } from "../types/tradeEntry.types";
import TradeCalendar from "./TradeCalendar";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { formatCurrency, pnlColor } from "../utils/formatUtils";
import { useAuth } from "../contexts/AuthContext";
import { computeStreak } from "../utils/tradeUtils";
import AccountModal from "./AccountModal";
import Select from "./Select";
import { useState } from "react";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}


const ActivityDots = ({ trades }: { trades: TradeEntry[] }) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = now.getDate();

  const tradedDays = new Set(
    trades
      .filter((t) => {
        const d = new Date(t.exitTime);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map((t) => new Date(t.exitTime).getDate())
  );

  return (
    <div className="flex flex-wrap gap-[3px]" aria-hidden="true">
      {Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const future = day > todayDate;
        const traded = tradedDays.has(day);
        return (
          <div
            key={day}
            className={`w-[7px] h-[7px] rounded-[2px] transition-opacity ${
              future
                ? "bg-border opacity-25"
                : traded
                ? "bg-accent"
                : "bg-border"
            }`}
          />
        );
      })}
    </div>
  );
};

interface ArcGaugeProps {
  value: number;
}

const ArcGauge = ({ value }: ArcGaugeProps) => {
  const r = 26;
  const cx = 32;
  const cy = 34;
  const total = Math.PI * r;
  const fill = (Math.min(Math.max(value, 0), 100) / 100) * total;
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <svg width="64" height="36" viewBox="0 0 64 36" className="shrink-0" aria-hidden="true">
      <path d={d} fill="none" stroke="var(--color-border)" strokeWidth="5" strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${fill} ${total}`}
      />
    </svg>
  );
};

const CardSkeleton = () => (
  <div className="bg-surface rounded-xl p-6 animate-pulse">
    <div className="h-3 w-16 rounded bg-border mb-5" />
    <div className="h-8 w-24 rounded bg-border mb-3" />
    <div className="h-2.5 w-20 rounded bg-border" />
  </div>
);

const ChevronDownIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
    <path d="M2 3.5L5 6.5L8 3.5" />
  </svg>
);

const StatsDashboard = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["allAccounts"],
    queryFn: getAccounts,
  });

  const effectiveAccountId = selectedAccountId || accounts[0]?._id;

  const {
    data: stats,
    isLoading: statsLoading,
    error,
  } = useQuery<Stats>({
    queryKey: ["stats", effectiveAccountId],
    queryFn: () => getStats(effectiveAccountId),
    enabled: !!effectiveAccountId,
  });

  const { data: trades = [], isLoading: tradesLoading } = useQuery({
    queryKey: ["trades", effectiveAccountId],
    queryFn: () => getTradeEntries(effectiveAccountId),
    enabled: !!effectiveAccountId,
  });

  const isLoading = accountsLoading || statsLoading || tradesLoading;

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
  const pfArcValue = pf !== null ? Math.min(pf / 3, 1) * 100 : 0;

  const streak = computeStreak(trades);

  const recentTrades = [...trades]
    .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())
    .slice(0, 5);

  if (error)
    return (
      <div className="px-8 py-10">
        <p className="text-sm text-ink-secondary">
          Couldn't load stats. Try refreshing.
        </p>
      </div>
    );

  return (
    <div>
      {/* Content header */}
      <div className="px-4 py-4 md:px-8 md:py-5 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <p className="text-xs font-medium text-ink-muted tracking-wide mb-0.5">
            {format(new Date(), "MMMM yyyy")}
          </p>
          <h1 className="text-xl font-semibold text-ink-primary tracking-tight" style={{ textWrap: "balance" } as React.CSSProperties}>
            {getGreeting()}{user ? `, ${user}` : ""}
          </h1>
        </div>

        {accounts.length === 0 ? (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-ink-primary transition-colors duration-150 cursor-pointer whitespace-nowrap"
          >
            New Account
            <ChevronDownIcon />
          </button>
        ) : (
          <div className="w-full sm:w-48">
            <Select
              id="dashboard-account"
              value={selectedAccountId || (accounts[0]?._id ?? "")}
              onChange={(val) => {
                if (val === "__new__") {
                  setModalOpen(true);
                } else {
                  setSelectedAccountId(val);
                }
              }}
              options={[
                ...accounts.map((a) => ({ value: a._id, label: a.accountName })),
                { value: "__new__", label: "+ New account" },
              ]}
            />
          </div>
        )}
      </div>

      {modalOpen && <AccountModal onClose={() => setModalOpen(false)} onSuccess={(acc) => setSelectedAccountId(acc._id)} />}

      {/* KPI cards */}
      <div className="px-4 py-4 sm:px-6 md:px-8 md:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              {/* Net P&L */}
              <div className="bg-surface rounded-xl p-6 transition-shadow duration-150 hover:shadow-ambient flex flex-col gap-1.5">
                <span className="text-xs font-medium text-ink-muted tracking-wide">net p&l</span>
                <span className={`text-[1.75rem] font-semibold tabular-nums leading-none ${pnlColor(totalPnl)}`}>
                  {formatCurrency(totalPnl)}
                </span>
                <span className="text-xs text-ink-muted tabular-nums">
                  {tradeCount > 0 ? `avg ${formatCurrency(avgPerTrade)} / trade` : "no trades yet"}
                </span>
              </div>

              {/* Win Rate */}
              <div className="bg-surface rounded-xl p-6 transition-shadow duration-150 hover:shadow-ambient flex flex-col gap-1.5">
                <span className="text-xs font-medium text-ink-muted tracking-wide">win rate</span>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[1.75rem] font-semibold tabular-nums leading-none text-ink-primary">
                    {winRate.toFixed(1)}%
                  </span>
                  <ArcGauge value={winRate} />
                </div>
                <span className="text-xs text-ink-muted">
                  {wins}w · {losses}l
                </span>
              </div>

              {/* Profit Factor */}
              <div className="bg-surface rounded-xl p-6 transition-shadow duration-150 hover:shadow-ambient flex flex-col gap-1.5">
                <span className="text-xs font-medium text-ink-muted tracking-wide">profit factor</span>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[1.75rem] font-semibold tabular-nums leading-none text-ink-primary">
                    {pfDisplay}
                  </span>
                  <ArcGauge value={pfArcValue} />
                </div>
                <span className="text-xs text-ink-muted tabular-nums">
                  {losses > 0
                    ? `avg ${formatCurrency(avgWin)} / ${formatCurrency(Math.abs(avgLoss))}`
                    : "no losses"}
                </span>
              </div>

              {/* Trades */}
              <div className="bg-surface rounded-xl p-6 transition-shadow duration-150 hover:shadow-ambient flex flex-col gap-2">
                <span className="text-xs font-medium text-ink-muted tracking-wide">trades</span>
                <span className="text-[1.75rem] font-semibold tabular-nums leading-none text-ink-primary">
                  {tradeCount}
                </span>
                <ActivityDots trades={trades} />
                <span className="text-xs text-ink-muted tabular-nums">
                  {daysTraded} {daysTraded === 1 ? "day" : "days"} this month
                  {streak ? ` · ${streak.count} in a row` : ""}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Calendar + Recent Trades */}
      <div className="px-4 pt-2 pb-8 sm:px-6 md:px-8 md:pb-10 flex flex-col gap-8 items-start lg:flex-row lg:gap-6">
        <TradeCalendar trades={trades} />

        <div className="flex-1 min-w-0 w-full lg:w-auto">
          <h2 className="mb-4 text-[0.9375rem] font-semibold text-ink-primary">Recent Trades</h2>
          {trades.length === 0 ? (
            <p className="text-sm text-ink-secondary">
              No trades yet.{" "}
              <Link to="/dashboard/journal" className="text-accent no-underline hover:underline">
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
                    <div className="flex items-center justify-between gap-4 border-b border-border -mx-2 px-2 py-3 text-sm transition-colors duration-[120ms] ease-out last:border-b-0 hover:bg-surface rounded-lg">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-medium text-ink-primary truncate">
                          {trade.contract} · {trade.direction}
                        </span>
                        <span className="text-xs text-ink-muted">
                          {format(new Date(trade.entryTime), "MMM d, yyyy")}
                        </span>
                      </div>
                      <span className={`font-semibold tabular-nums shrink-0 ${pnlColor(trade.pnl)}`}>
                        {formatCurrency(trade.pnl)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="pt-4">
                <Link
                  to="/dashboard/journal"
                  className="text-sm text-ink-secondary no-underline transition-colors hover:text-accent"
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
