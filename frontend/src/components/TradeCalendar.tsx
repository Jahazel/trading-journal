import { TradeEntry } from "../types/tradeEntry.types";
import { groupTradesByDate, getMonthRange } from "../utils/tradeUtils";
import {
  eachDayOfInterval,
  subMonths,
  format,
  addMonths,
  isSameMonth,
  getDay,
  subDays,
  addDays,
} from "date-fns";
import { useState } from "react";

interface TradeCalendarProps {
  trades: TradeEntry[];
}

const TradeCalendar = ({ trades }: TradeCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const tradesObj = groupTradesByDate(trades);

  const buildCalendarDays = (date: Date): Date[] => {
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

  const chunkIntoWeeks = (days: Date[]): Date[][] => {
    const numOfWeeks = Math.ceil(days.length / 7);
    return Array.from({ length: numOfWeeks }, (_, i) =>
      days.slice(i * 7, i * 7 + 7),
    );
  };

  const calendarMonth = chunkIntoWeeks(buildCalendarDays(currentMonth));

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <button
          className="calendar-nav-btn"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          Prev
        </button>
        <span>{format(currentMonth, "MMMM yyyy")}</span>
        <button
          className="calendar-nav-btn"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          Next
        </button>
      </div>

      <div className="calendar-day-headers">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="calendar-day-header">
            {d}
          </div>
        ))}
        <div className="calendar-day-header week-label">Week</div>
      </div>

      <div className="calendar-grid">
        {calendarMonth.map((week) => {
          const weeklyPnl = week.reduce((total, day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            return total + (tradesObj[dateKey] ?? 0);
          }, 0);

          return (
            <div key={format(week[0], "yyyy-MM-dd")} className="calendar-week">
              {week.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayPnl = tradesObj[dateKey];
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <div
                    key={dateKey}
                    className={
                      isCurrentMonth ? "calendar-day" : "calendar-day faded"
                    }
                  >
                    <span className="day-number">{format(day, "d")}</span>
                    {dayPnl !== undefined && (
                      <span
                        className={
                          dayPnl >= 0 ? "day-pnl positive" : "day-pnl negative"
                        }
                      >
                        ${dayPnl.toFixed(2)}
                      </span>
                    )}
                  </div>
                );
              })}
              <div className="weekly-total">
                <span className="weekly-total-label">Week</span>
                <span
                  className={`weekly-total-value ${weeklyPnl >= 0 ? "positive" : "negative"}`}
                >
                  {weeklyPnl !== 0 ? `$${weeklyPnl.toFixed(2)}` : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TradeCalendar;
