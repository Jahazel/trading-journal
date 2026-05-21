import { test, expect } from "@playwright/test";

const USER_ID = "64b000000000000000000u01";

const ACCOUNT_1 = {
  _id: "64b000000000000000000a01",
  accountName: "Main Account",
  broker: "TopStep",
  balance: 50000,
};

const ACCOUNT_2 = {
  _id: "64b000000000000000000a02",
  accountName: "Prop Firm",
  broker: "Apex",
  balance: 25000,
};

const TRADES_ACC1 = [
  {
    _id: "64b000000000000000000t01",
    result: "Win",
    contract: "NQ",
    direction: "Long",
    contracts: 1,
    pnl: 500,
    entryTime: "2026-05-20T14:00:00.000Z",
    exitTime: "2026-05-20T15:00:00.000Z",
    accountId: ACCOUNT_1._id,
    createdAt: "2026-05-20T15:00:00.000Z",
  },
  {
    _id: "64b000000000000000000t02",
    result: "Loss",
    contract: "NQ",
    direction: "Short",
    contracts: 1,
    pnl: -200,
    entryTime: "2026-05-19T14:00:00.000Z",
    exitTime: "2026-05-19T15:00:00.000Z",
    accountId: ACCOUNT_1._id,
    createdAt: "2026-05-19T15:00:00.000Z",
  },
];

const STATS_ACC1 = { totalPnl: 300, winRate: 50, avgWin: 500, avgLoss: -200 };
const STATS_ACC2 = { totalPnl: 0, winRate: 0, avgWin: 0, avgLoss: 0 };

test.describe("account-scoped dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(({ username, userId }) => {
      localStorage.setItem("username", username);
      localStorage.setItem("userId", userId);
    }, { username: "testuser", userId: USER_ID });

    await page.route("**/api/accounts", (route) =>
      route.fulfill({ json: [ACCOUNT_1, ACCOUNT_2] })
    );

    await page.route("**/api/trades-entry/**", (route) => {
      const url = new URL(route.request().url());
      const accountId = url.searchParams.get("accountId");
      route.fulfill({
        json: accountId === ACCOUNT_1._id ? STATS_ACC1 : STATS_ACC2,
      });
    });

    await page.route("**/api/trades-entry*", (route) => {
      const url = new URL(route.request().url());
      const accountId = url.searchParams.get("accountId");
      route.fulfill({
        json: accountId === ACCOUNT_1._id ? TRADES_ACC1 : [],
      });
    });
  });

  test("shows first account stats by default", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.locator("#dashboard-account")).toContainText("Main Account");
    await expect(page.getByText("$300.00").first()).toBeVisible();
    await expect(page.getByText("50.0%")).toBeVisible();
    await expect(page.getByText("NQ · Long")).toBeVisible();
  });

  test("switching accounts updates all stats and trades", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("$300.00").first()).toBeVisible();

    await page.locator("#dashboard-account").click();
    await page.getByRole("option", { name: "Prop Firm" }).click();

    await expect(page.locator("#dashboard-account")).toContainText("Prop Firm");
    await expect(page.getByText("$0.00").first()).toBeVisible();
    await expect(page.getByText("No trades yet.")).toBeVisible();
  });

  test("account with no trades shows zero-state", async ({ page }) => {
    await page.addInitScript(({ username, userId }) => {
      localStorage.setItem("username", username);
      localStorage.setItem("userId", userId);
    }, { username: "testuser", userId: USER_ID });

    await page.goto("/dashboard");

    await page.locator("#dashboard-account").click();
    await page.getByRole("option", { name: "Prop Firm" }).click();

    await expect(page.getByText("No trades yet.")).toBeVisible();
    await expect(page.getByText("$0.00").first()).toBeVisible();
  });
});
