import { formatDate } from "../utils/formatUtils";

export interface NoTradeEntryCardProps {
  entryTime: string;
}

const NoTradeEntryCard = ({ entryTime }: NoTradeEntryCardProps) => {
  const formattedDate = formatDate(entryTime);

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md mb-1.5 border border-gray-200 cursor-pointer hover:border-blue-500 hover:bg-gray-100 transition-colors">
      <div className="flex items-center text-xs font-semibold px-2 py-0.5 text-gray-400">
        <span>No Trade</span>
      </div>
      <span className="text-xs text-gray-400">{formattedDate}</span>
    </div>
  );
};

export default NoTradeEntryCard;
