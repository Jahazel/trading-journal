import { TradeEntry } from "../types/tradeEntry.types";
import {
  groupTradesByDate,
  buildCalendarDays,
  chunkIntoWeeks,
} from "../utils/calendarUtils";
import { subMonths, format, addMonths, isSameMonth } from "date-fns";
import { useState } from "react";
interface TradeCalendarProps {
  trades: TradeEntry[];
}

const TradeCalendar = ({ trades }: TradeCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const tradesObj = groupTradesByDate(trades);
  const calendarMonth = chunkIntoWeeks(buildCalendarDays(currentMonth));

  const navBtnStyles =
    "bg-transparent border border-gray-200 text-gray-500 rounded-md px-3 py-1 text-sm cursor-pointer transition-all hover:border-blue-500 hover:text-blue-500";

  return (
    <div className="mt-8 bg-white border border-gray-200 rounded-xl overflow-hidden max-w-[700px]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <button
          className={navBtnStyles}
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          Prev
        </button>
        <span className="text-sm font-semibold text-gray-900">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <button
          className={navBtnStyles}
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-[repeat(7,1fr)_80px] border-b border-gray-200">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-400"
          >
            {d}
          </div>
        ))}
        <div className="py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          Week
        </div>
      </div>

      <div className="flex flex-col">
        {calendarMonth.map((week) => {
          const weeklyPnl = week.reduce((total, day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            return total + (tradesObj[dateKey] ?? 0);
          }, 0);

          return (
            <div
              key={format(week[0], "yyyy-MM-dd")}
              className="grid grid-cols-[repeat(7,1fr)_110px] border-b border-gray-200 last:border-b-0"
            >
              {week.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayPnl = tradesObj[dateKey];
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <div
                    key={dateKey}
                    className={`p-3 min-h-16 border-r border-gray-200 flex flex-col gap-1 transition-colors min-w-0 overflow-hidden ${!isCurrentMonth ? "opacity-35" : ""} ${dayPnl !== undefined ? (dayPnl >= 0 ? "bg-emerald-100 hover:bg-emerald-200" : "bg-red-100 hover:bg-red-200") : "hover:bg-gray-50"}`}
                  >
                    <span className="text-xs font-medium text-gray-700">
                      {format(day, "d")}
                    </span>
                    {dayPnl !== undefined && (
                      <span className="text-xs tabular-nums text-gray-900">
                        ${dayPnl.toFixed(2)}
                      </span>
                    )}
                  </div>
                );
              })}
              <div className="px-2.5 py-2 min-h-16 flex flex-col justify-center items-end gap-1">
                <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                  Week
                </span>
                <span
                  className={`text-xs tabular-nums ${weeklyPnl >= 0 ? "text-emerald-500" : "text-red-500"}`}
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
