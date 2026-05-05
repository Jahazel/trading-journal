import { formatDate } from "../utils/formatUtils";

export interface NoTradeEntryCardProps {
  entryTime: string;
}

const NoTradeEntryCard = ({ entryTime }: NoTradeEntryCardProps) => {
  const formattedDate = formatDate(entryTime);

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-surface-alt rounded-md mb-1.5 border border-border cursor-pointer hover:border-sage hover:bg-[#EEF0EC] transition-colors">
      <div className="flex items-center text-xs font-semibold px-2 py-0.5 text-ink-muted">
        <span>No Trade</span>
      </div>
      <span className="text-xs text-ink-muted">{formattedDate}</span>
    </div>
  );
};

export default NoTradeEntryCard;
