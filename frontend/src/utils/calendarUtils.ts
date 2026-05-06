import { TradeEntry } from "../types/tradeEntry.types";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  subDays,
  addDays,
  format,
} from "date-fns";

export const WEEKDAY_LABELS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export const computeWeeklyPnl = (
  week: Date[],
  tradesObj: Record<string, number>,
): number =>
  week.reduce((total, day) => total + (tradesObj[format(day, "yyyy-MM-dd")] ?? 0), 0);

export const getDayCellBg = (
  isCurrentMonth: boolean,
  isBreakEven: boolean,
  dayPnl: number | undefined,
): string => {
  if (!isCurrentMonth) return "bg-surface-alt";
  if (isBreakEven) return "bg-pnl-breakeven-bg";
  if (dayPnl !== undefined && dayPnl > 0) return "bg-pnl-positive-bg";
  if (dayPnl !== undefined && dayPnl < 0) return "bg-pnl-negative-bg";
  return "";
};

export const getPnlAriaLabel = (dayPnl: number | undefined): string => {
  if (dayPnl === undefined) return "";
  if (dayPnl > 0) return `$${dayPnl.toFixed(2)} profit`;
  if (dayPnl < 0) return `$${Math.abs(dayPnl).toFixed(2)} loss`;
  return "break even";
};

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

export const buildCalendarDays = (date: Date): Date[] => {
  const { start, end } = getMonthRange(date);
  const prefixDays = getDay(start);
  const suffixDays = 6 - getDay(end);

  const prefix = Array.from({ length: prefixDays }, (_, i) =>
    subDays(start, prefixDays - i),
  );
  const monthDays = eachDayOfInterval({ start, end });
  const suffix = Array.from({ length: suffixDays }, (_, i) =>
    addDays(end, i + 1),
  );

  return [...prefix, ...monthDays, ...suffix];
};

export const getBreakEvenDates = (trades: TradeEntry[]): Set<string> => {
  const dateMap: Record<string, boolean> = {};

  for (const trade of trades) {
    const date = trade.exitTime.split("T")[0];
    if (!(date in dateMap)) {
      dateMap[date] = trade.result === "Break Even";
    } else if (trade.result !== "Break Even") {
      dateMap[date] = false;
    }
  }

  return new Set(
    Object.entries(dateMap)
      .filter(([, isBreakEven]) => isBreakEven)
      .map(([date]) => date),
  );
};

export const chunkIntoWeeks = (days: Date[]): Date[][] => {
  const numOfWeeks = Math.ceil(days.length / 7);
  return Array.from({ length: numOfWeeks }, (_, i) =>
    days.slice(i * 7, i * 7 + 7),
  );
};
