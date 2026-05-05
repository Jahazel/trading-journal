import { formatDate } from "../utils/formatUtils";

export interface TradeCardProps {
  createdAt: string;
  result: string;
  pnl: number;
}

const TradeCard = ({ createdAt, pnl, result }: TradeCardProps) => {
  const formattedDate = formatDate(createdAt);

  const resultColors: Record<string, string> = {
    Win: "text-emerald-600",
    Loss: "text-red-600",
    "Break Even": "text-blue-500",
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-surface-alt rounded-md mb-1.5 border border-border cursor-pointer hover:border-sage hover:bg-[#EEF0EC] transition-colors">
      <span
        className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full ${resultColors[result]}`}
      >
        $
        {Math.abs(pnl)?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
      <span className="text-xs text-ink-muted">{formattedDate}</span>
    </div>
  );
};

export default TradeCard;
