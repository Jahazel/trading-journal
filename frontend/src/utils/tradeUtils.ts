import { TradeEntry } from "../types/tradeEntry.types";
import { startOfMonth, endOfMonth } from "date-fns";

export const groupTradesByDate = (
  trades: TradeEntry[],
): Record<string, number> => {
  const result: Record<string, number> = {};

  for (const trade of trades) {
    const formattedDate = trade.exitTime.split("T")[0];

    if (formattedDate in result) {
      result[formattedDate] += trade.pnl;
    } else {
      result[formattedDate] = trade.pnl;
    }
  }

  return result;
};

export const getMonthRange = (date: Date): { start: Date; end: Date } => {
  const startDate = startOfMonth(date);
  const endDate = endOfMonth(date);

  return { start: startDate, end: endDate };
};
