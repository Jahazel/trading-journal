import type { ContractType } from "../config/constants.js";

export interface TradeEntryParams {
  id?: string;
}

export interface CreateTradeEntryBody {
  result: "Win" | "Loss" | "Break Even";
  contract: ContractType;
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

export interface UpdateEntryBody {
  result?: "Win" | "Loss" | "Break Even";
  contract?: ContractType;
  direction?: "Long" | "Short";
  contracts?: number;
  entryPrice?: number;
  exitPrice?: number;
  stopLoss?: number;
  target?: number;
  entryTime?: string;
  exitTime?: string;
  notes?: string;
}

export interface TradeStatsInternal {
  totalPnl: number;
  totalWins: number;
  totalLosses: number;
  totalWinPnl: number;
  totalLossPnl: number;
}

export interface TradeStatsResponse {
  totalPnl: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
}
