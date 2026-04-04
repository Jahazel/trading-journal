const TradeCard = ({ createdAt, pnl }) => {
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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
