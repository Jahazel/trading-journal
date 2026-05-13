import { describe, it, expect } from "vitest";
import {
  groupTradesByDate,
  getPnlAriaLabel,
  getDayCellBg,
  getBreakEvenDates,
  chunkIntoWeeks,
} from "./calendarUtils";
import { TradeEntry } from "../types/tradeEntry.types";

const makeTrade = (
  exitTime: string,
  pnl: number,
  result: TradeEntry["result"] = "Win",
): TradeEntry => ({
  _id: "test-id",
  userId: "user-id",
  accountId: "account-id",
  result,
  contract: "NQ",
  direction: "Long",
  contracts: 1,
  entryPrice: 100,
  exitPrice: 110,
  stopLoss: 90,
  target: 120,
  entryTime: "2024-01-01T09:00:00.000Z",
  exitTime,
  pnl,
  createdAt: "2024-01-01T09:00:00.000Z",
  updatedAt: "2024-01-01T09:00:00.000Z",
});

const makeDates = (n: number): Date[] =>
  Array.from({ length: n }, (_, i) => new Date(2024, 0, i + 1));

describe("groupTradesByDate", () => {
  it("returns an empty object when given no trades", () => {
    expect(groupTradesByDate([])).toEqual({});
  });

  it("groups a single trade under its exit date", () => {
    const trades = [makeTrade("2024-05-13T14:30:00.000Z", 250)];
    expect(groupTradesByDate(trades)).toEqual({ "2024-05-13": 250 });
  });

  it("sums PnL when multiple trades share the same exit date", () => {
    const trades = [
      makeTrade("2024-05-13T09:00:00.000Z", 200),
      makeTrade("2024-05-13T14:00:00.000Z", 150),
    ];
    expect(groupTradesByDate(trades)).toEqual({ "2024-05-13": 350 });
  });

  it("keeps trades on different dates in separate entries", () => {
    const trades = [
      makeTrade("2024-05-13T09:00:00.000Z", 200),
      makeTrade("2024-05-14T09:00:00.000Z", -100),
    ];
    expect(groupTradesByDate(trades)).toEqual({
      "2024-05-13": 200,
      "2024-05-14": -100,
    });
  });

  it("correctly nets a mix of wins and losses on the same day", () => {
    const trades = [
      makeTrade("2024-05-13T09:00:00.000Z", 300),
      makeTrade("2024-05-13T11:00:00.000Z", -100),
      makeTrade("2024-05-13T14:00:00.000Z", -50),
    ];
    expect(groupTradesByDate(trades)).toEqual({ "2024-05-13": 150 });
  });
});

describe("getPnlAriaLabel", () => {
  it("returns an empty string when dayPnl is undefined", () => {
    expect(getPnlAriaLabel(undefined)).toBe("");
  });

  it("returns a profit label for a positive value", () => {
    expect(getPnlAriaLabel(250)).toBe("$250.00 profit");
  });

  it("returns a loss label using the absolute value for a negative value", () => {
    expect(getPnlAriaLabel(-150)).toBe("$150.00 loss");
  });

  it("returns 'break even' for zero", () => {
    expect(getPnlAriaLabel(0)).toBe("break even");
  });
});

describe("getDayCellBg", () => {
  it("returns surface-alt for a day outside the current month", () => {
    expect(getDayCellBg(false, false, 100)).toBe("bg-surface-alt");
  });

  it("returns breakeven bg when isBreakEven is true", () => {
    expect(getDayCellBg(true, true, 0)).toBe("bg-pnl-breakeven-bg");
  });

  it("returns positive bg for a current-month day with positive PnL", () => {
    expect(getDayCellBg(true, false, 100)).toBe("bg-pnl-positive-bg");
  });

  it("returns negative bg for a current-month day with negative PnL", () => {
    expect(getDayCellBg(true, false, -50)).toBe("bg-pnl-negative-bg");
  });

  it("returns empty string for a current-month day with no trades", () => {
    expect(getDayCellBg(true, false, undefined)).toBe("");
  });
});

describe("getBreakEvenDates", () => {
  it("returns an empty set when given no trades", () => {
    expect(getBreakEvenDates([])).toEqual(new Set());
  });

  it("includes a date when its only trade is Break Even", () => {
    const trades = [makeTrade("2024-05-13T09:00:00.000Z", 0, "Break Even")];
    expect(getBreakEvenDates(trades)).toEqual(new Set(["2024-05-13"]));
  });

  it("excludes a date when a non-break-even trade follows a break-even trade on the same day", () => {
    const trades = [
      makeTrade("2024-05-13T09:00:00.000Z", 0, "Break Even"),
      makeTrade("2024-05-13T14:00:00.000Z", 200, "Win"),
    ];
    expect(getBreakEvenDates(trades)).toEqual(new Set());
  });

  it("excludes a date when all trades on that day are wins or losses", () => {
    const trades = [makeTrade("2024-05-13T09:00:00.000Z", 200, "Win")];
    expect(getBreakEvenDates(trades)).toEqual(new Set());
  });

  it("includes multiple dates that are each break-even", () => {
    const trades = [
      makeTrade("2024-05-13T09:00:00.000Z", 0, "Break Even"),
      makeTrade("2024-05-14T09:00:00.000Z", 0, "Break Even"),
    ];
    expect(getBreakEvenDates(trades)).toEqual(
      new Set(["2024-05-13", "2024-05-14"]),
    );
  });
});

describe("chunkIntoWeeks", () => {
  it("returns an empty array for empty input", () => {
    expect(chunkIntoWeeks([])).toEqual([]);
  });

  it("splits 7 dates into one week", () => {
    const days = makeDates(7);
    const result = chunkIntoWeeks(days);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(7);
  });

  it("splits 14 dates into two weeks", () => {
    const days = makeDates(14);
    const result = chunkIntoWeeks(days);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(7);
    expect(result[1]).toHaveLength(7);
  });

  it("splits 35 dates into five weeks", () => {
    const days = makeDates(35);
    expect(chunkIntoWeeks(days)).toHaveLength(5);
  });

  it("preserves the original date values after chunking", () => {
    const days = makeDates(7);
    const result = chunkIntoWeeks(days);
    expect(result[0]).toEqual(days);
  });
});
