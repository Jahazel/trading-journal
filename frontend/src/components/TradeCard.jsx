const TradeCard = ({ direction, pnl }) => {
  const isWin = pnl > 0;

  return (
    <div className="trade-card">
      <span className={`direction-badge ${direction.toLowerCase()}`}>
        {direction}
      </span>
      <span className={`pnl ${isWin ? "win" : "loss"}`}>
        {isWin ? "+" : ""}${pnl.toFixed(2)}
      </span>
    </div>
  );
};

export default TradeCard;
