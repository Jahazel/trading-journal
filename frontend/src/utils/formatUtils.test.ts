import { describe, it, expect } from "vitest";
import { pnlColor, resultColorClass } from "./formatUtils";

describe("pnlColor", () => {
  it("returns positive class for a positive value", () => {
    expect(pnlColor(100)).toBe("text-pnl-positive");
  });

  it("returns negative class for a negative value", () => {
    expect(pnlColor(-50)).toBe("text-pnl-negative");
  });

  it("returns blue class for zero", () => {
    expect(pnlColor(0)).toBe("text-blue-500");
  });
});

describe("resultColorClass", () => {
  it("returns positive class for Win", () => {
    expect(resultColorClass("Win")).toBe("text-pnl-positive");
  });

  it("returns negative class for Loss", () => {
    expect(resultColorClass("Loss")).toBe("text-pnl-negative");
  });

  it("returns muted class for Break Even", () => {
    expect(resultColorClass("Break Even")).toBe("text-ink-muted");
  });

  it("returns muted class for an unrecognized result", () => {
    expect(resultColorClass("Unknown")).toBe("text-ink-muted");
  });
});
