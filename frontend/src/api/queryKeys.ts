export const queryKeys = {
  accounts: () => ["allAccounts"] as const,
  allEntries: () => ["allEntries"] as const,
  tradeEntry: (id: string) => ["entry", id] as const,
  noTradeEntry: (id: string) => ["noTradeEntry", id] as const,
  stats: (accountId?: string) => ["stats", accountId] as const,
  tradeEntries: (accountId?: string) => ["trades", accountId] as const,
};
