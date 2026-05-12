import { TradeEntry } from "../types/tradeEntry.types";
import {
  groupTradesByDate,
  buildCalendarDays,
  chunkIntoWeeks,
  getBreakEvenDates,
  computeWeeklyPnl,
  getDayCellBg,
  getPnlAriaLabel,
  WEEKDAY_LABELS,
} from "../utils/calendarUtils";
import { calendarNavBtnStyles } from "../utils/styleConstants";
import {
  subMonths,
  format,
  addMonths,
  isSameMonth,
  isToday,
  startOfMonth,
} from "date-fns";
import { useState, useMemo } from "react";

interface TradeCalendarProps {
  trades: TradeEntry[];
}

const TradeCalendar = ({ trades }: TradeCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const tradesObj = useMemo(() => groupTradesByDate(trades), [trades]);
  const breakEvenDates = useMemo(() => getBreakEvenDates(trades), [trades]);
  const calendarMonth = useMemo(
    () => chunkIntoWeeks(buildCalendarDays(currentMonth)),
    [currentMonth],
  );

  const prevMonth = subMonths(currentMonth, 1);
  const nextMonth = addMonths(currentMonth, 1);
  const isViewingCurrentMonth = isSameMonth(currentMonth, new Date());
  const isNextMonthFuture = startOfMonth(nextMonth) > startOfMonth(new Date());

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden max-w-[700px]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <button
          className={calendarNavBtnStyles}
          onClick={() => setCurrentMonth(prevMonth)}
          aria-label={`Previous month, ${format(prevMonth, "MMMM yyyy")}`}
        >
          ← {format(prevMonth, "MMM")}
        </button>

        <div className="flex flex-col items-center gap-0.5">
          <span
            className="text-sm font-semibold text-ink-primary"
            aria-live="polite"
            aria-atomic="true"
          >
            {format(currentMonth, "MMMM yyyy")}
          </span>
          {!isViewingCurrentMonth && (
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer"
            >
              Today
            </button>
          )}
        </div>

        <button
          className={`${calendarNavBtnStyles} ${isNextMonthFuture ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`}
          onClick={() => setCurrentMonth(nextMonth)}
          aria-label={`Next month, ${format(nextMonth, "MMMM yyyy")}`}
          aria-disabled={isNextMonthFuture}
        >
          {format(nextMonth, "MMM")} →
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[692px]">
          <div role="grid" aria-label={format(currentMonth, "MMMM yyyy")}>
            <div
              role="row"
              className="grid grid-cols-[repeat(7,86px)_90px] border-b border-border"
            >
              {WEEKDAY_LABELS.map((d) => (
                <div
                  key={d}
                  role="columnheader"
                  aria-label={d}
                  className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-muted"
                >
                  {d}
                </div>
              ))}
              <div
                role="columnheader"
                aria-label="Weekly P&L"
                className="py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-ink-muted"
              >
                Week
              </div>
            </div>

            {calendarMonth.map((week) => {
              const weeklyPnl = computeWeeklyPnl(week, tradesObj);

              return (
                <div
                  key={format(week[0], "yyyy-MM-dd")}
                  role="row"
                  className="grid grid-cols-[repeat(7,86px)_90px] grid-rows-[64px] border-b border-border last:border-b-0"
                >
                  {week.map((day) => {
                    const dateKey = format(day, "yyyy-MM-dd");
                    const dayPnl = tradesObj[dateKey];
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const todayCell = isToday(day);
                    const cellBg = getDayCellBg(
                      isCurrentMonth,
                      breakEvenDates.has(dateKey),
                      dayPnl,
                    );
                    const pnlLabel = getPnlAriaLabel(dayPnl);

                    return (
                      <div
                        key={dateKey}
                        role="gridcell"
                        aria-label={`${format(day, "MMMM d, yyyy")}${pnlLabel ? `, ${pnlLabel}` : ""}`}
                        aria-current={todayCell ? "date" : undefined}
                        className={`p-3 w-full border-r border-border flex flex-col gap-1 min-w-0 overflow-hidden ${cellBg}${todayCell ? " ring-1 ring-inset ring-accent" : ""}`}
                      >
                        <span
                          className={`text-xs font-medium ${isCurrentMonth ? "text-ink-primary" : "text-ink-muted"}`}
                        >
                          {format(day, "d")}
                        </span>
                        {dayPnl !== undefined && isCurrentMonth && (
                          <span className="text-xs tabular-nums text-ink-primary">
                            ${dayPnl.toFixed(2)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <div
                    role="gridcell"
                    className="px-2.5 py-2 flex flex-col justify-center items-end"
                  >
                    <span
                      className={`text-xs tabular-nums ${weeklyPnl > 0 ? "text-pnl-positive" : weeklyPnl < 0 ? "text-pnl-negative" : "text-ink-muted"}`}
                    >
                      {weeklyPnl !== 0 ? `$${weeklyPnl.toFixed(2)}` : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 px-6 py-3 border-t border-border">
        <span className="flex items-center gap-1.5 text-xs text-ink-secondary">
          <span className="inline-block w-3 h-3 rounded-sm bg-pnl-positive-bg flex-shrink-0" />
          Profit
        </span>
        <span className="flex items-center gap-1.5 text-xs text-ink-secondary">
          <span className="inline-block w-3 h-3 rounded-sm bg-pnl-negative-bg flex-shrink-0" />
          Loss
        </span>
        <span className="flex items-center gap-1.5 text-xs text-ink-secondary">
          <span className="inline-block w-3 h-3 rounded-sm bg-pnl-breakeven-bg flex-shrink-0" />
          Break Even
        </span>
      </div>
    </div>
  );
};

export default TradeCalendar;
