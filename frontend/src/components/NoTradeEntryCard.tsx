export interface NoTradeEntryCardProps {
  date: string;
}

const NoTradeEntryCard = ({ date }: NoTradeEntryCardProps) => {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="trade-card no-trade-card">
      <div className="no-trade-label">
        <span className="no-trade-dot" />
        <span>No Trade</span>
      </div>
      <span className="trade-card-date">{formattedDate}</span>
    </div>
  );
};

export default NoTradeEntryCard;
