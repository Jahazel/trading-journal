import { Document, Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITradeEntry extends Document {
  userId: Types.ObjectId;
  result: "Win" | "Loss" | "Break Even";
  contract: "NQ" | "MNQ" | "ES" | "MES";
  direction: "Long" | "Short";
  contracts: number;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  target: number;
  entryTime: Date;
  exitTime: Date;
  pnl?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoTradeEntry extends Document {
  userId: Types.ObjectId;
  date: Date;
  notes?: string;
}
