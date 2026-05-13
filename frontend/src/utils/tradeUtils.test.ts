import { describe, it, expect } from "vitest";
import { computeStreak } from "./tradeUtils";
import { TradeEntry } from "../types/tradeEntry.types";

const makeTrade = (
  result: TradeEntry["result"],
  exitTime: string,
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
  pnl: result === "Win" ? 100 : result === "Loss" ? -100 : 0,
  createdAt: "2024-01-01T09:00:00.000Z",
  updatedAt: "2024-01-01T09:00:00.000Z",
});

describe("computeStreak", () => {
  it("returns null when there are no trades", () => {
    expect(computeStreak([])).toBeNull();
  });

  it("returns null when the most recent trade is Break Even", () => {
    const trades = [makeTrade("Break Even", "2024-05-13T14:00:00.000Z")];
    expect(computeStreak(trades)).toBeNull();
  });

  it("returns a win streak of 1 for a single winning trade", () => {
    const trades = [makeTrade("Win", "2024-05-13T14:00:00.000Z")];
    expect(computeStreak(trades)).toEqual({ count: 1, type: "win" });
  });

  it("returns a loss streak of 1 for a single losing trade", () => {
    const trades = [makeTrade("Loss", "2024-05-13T14:00:00.000Z")];
    expect(computeStreak(trades)).toEqual({ count: 1, type: "loss" });
  });

  it("counts a streak of three consecutive wins", () => {
    const trades = [
      makeTrade("Win", "2024-05-15T14:00:00.000Z"),
      makeTrade("Win", "2024-05-14T14:00:00.000Z"),
      makeTrade("Win", "2024-05-13T14:00:00.000Z"),
    ];
    expect(computeStreak(trades)).toEqual({ count: 3, type: "win" });
  });

  it("stops the streak count at the first trade that breaks it", () => {
    const trades = [
      makeTrade("Win", "2024-05-15T14:00:00.000Z"),
      makeTrade("Win", "2024-05-14T14:00:00.000Z"),
      makeTrade("Loss", "2024-05-13T14:00:00.000Z"),
    ];
    expect(computeStreak(trades)).toEqual({ count: 2, type: "win" });
  });

  it("sorts by exitTime so trade order in the array does not matter", () => {
    const trades = [
      makeTrade("Loss", "2024-05-13T14:00:00.000Z"),
      makeTrade("Win", "2024-05-15T14:00:00.000Z"),
      makeTrade("Win", "2024-05-14T14:00:00.000Z"),
    ];
    expect(computeStreak(trades)).toEqual({ count: 2, type: "win" });
  });
});
