const TradeCard = ({ direction, pnl }) => {
  const isWin = pnl > 0;

  const formatPnL = (value) => {
    return `${isWin ? "+" : ""}$${Math.abs(value).toFixed(2)}`;
  };

  return (
    <div className="trade-card">
      <span className={`direction-badge ${direction.toLowerCase()}`}>
        {direction}
      </span>
      <span className={`pnl ${isWin ? "win" : "loss"}`}>{formatPnL(pnl)}</span>
    </div>
  );
};

export default TradeCard;
