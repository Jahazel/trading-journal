import { TradeEntry } from "../types/tradeEntry.types";

export const computeStreak = (
  trades: TradeEntry[],
): { count: number; type: "win" | "loss" } | null => {
  if (trades.length === 0) return null;
  const sorted = [...trades].sort(
    (a, b) => new Date(b.exitTime).getTime() - new Date(a.exitTime).getTime(),
  );
  const latest = sorted[0].result;
  if (latest === "Break Even") return null;
  const type = latest === "Win" ? "win" : "loss";
  let count = 0;
  for (const t of sorted) {
    if (t.result === latest) count++;
    else break;
  }
  return { count, type };
};
