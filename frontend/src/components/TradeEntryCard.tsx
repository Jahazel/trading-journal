import { formatDate, formatCurrency, resultColorClass } from "../utils/formatUtils";

export interface TradeCardProps {
  createdAt: string;
  result: string;
  pnl: number;
}

const TradeCard = ({ createdAt, pnl, result }: TradeCardProps) => {
  const formattedDate = formatDate(createdAt);

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-surface-alt rounded-md mb-1.5 border border-border cursor-pointer hover:border-accent hover:bg-surface transition-colors">
      <span
        className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full ${resultColorClass(result)}`}
      >
        {formatCurrency(Math.abs(pnl))}
      </span>
      <span className="text-xs text-ink-muted">{formattedDate}</span>
    </div>
  );
};

export default TradeCard;
