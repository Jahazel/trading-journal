import { formatDate } from "../utils/formatUtils";
export interface TradeCardProps {
  createdAt: string;
  pnl: number;
}

const TradeCard = ({ createdAt, pnl }: TradeCardProps) => {
  const formattedDate = formatDate(createdAt);

  const isProfit = pnl > 0;

  return (
    <div className="trade-card">
      <span className={` ${isProfit ? "profit" : "loss"}`}>
        $
        {Math.abs(pnl)?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
      <span className="trade-card-date">{formattedDate}</span>
    </div>
  );
};

export default TradeCard;
