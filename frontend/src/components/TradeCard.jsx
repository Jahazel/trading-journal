const TradeCard = ({ direction, createdAt }) => {
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="trade-card">
      <span className={`direction-badge ${direction.toLowerCase()}`}>
        {direction}
      </span>
      <span className="trade-card-date">{formattedDate}</span>
    </div>
  );
};

export default TradeCard;
