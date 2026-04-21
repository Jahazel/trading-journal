import { formatDate } from "../utils/formatUtils";
export interface NoTradeEntryCardProps {
  entryTime: string;
}

const NoTradeEntryCard = ({ entryTime }: NoTradeEntryCardProps) => {
  const formattedDate = formatDate(entryTime);

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
