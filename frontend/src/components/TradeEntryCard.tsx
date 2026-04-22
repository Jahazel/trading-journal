import { formatDate } from "../utils/formatUtils";

export interface TradeCardProps {
  createdAt: string;
  pnl: number;
}

const TradeCard = ({ createdAt, pnl }: TradeCardProps) => {
  const formattedDate = formatDate(createdAt);
  const isProfit = pnl > 0;

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md mb-1.5 border border-gray-200 cursor-pointer hover:border-blue-500 hover:bg-gray-100 transition-colors">
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isProfit ? "text-emerald-500" : "text-red-500"}`}
      >
        $
        {Math.abs(pnl)?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
      <span className="text-xs text-gray-400">{formattedDate}</span>
    </div>
  );
};

export default TradeCard;
