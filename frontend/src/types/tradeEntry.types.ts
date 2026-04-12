export interface CreateTradeEntryData {
  result: "Win" | "Loss" | "Break Even";
  contract: "NQ" | "MNQ" | "ES" | "MES";
  direction: "Long" | "Short";
  contracts: number;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  target: number;
  entryTime: string;
  exitTime: string;
  notes?: string;
}

export interface TradeEntry extends CreateTradeEntryData {
  _id: string;
  userId: string;
  pnl: number;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  totalPnl: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
}
