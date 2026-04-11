import { Schema, model } from "mongoose";
import type { ITradeEntry } from "../types/models.types.js";
import { POINT_VALUES } from "../config/constants.js";

const tradeEntrySchema = new Schema<ITradeEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    result: {
      type: String,
      required: true,
      enum: ["Win", "Loss", "Break Even"],
    },
    contract: {
      type: String,
      required: true,
      enum: Object.keys(POINT_VALUES),
    },
    direction: { type: String, required: true, enum: ["Long", "Short"] },
    contracts: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: "Contracts must be a whole number",
      },
    },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number, required: true },
    stopLoss: { type: Number, required: true },
    target: { type: Number, required: true },
    entryTime: { type: Date, required: true },
    exitTime: { type: Date, required: true },
    pnl: { type: Number },
    notes: { type: String },
  },
  { timestamps: true },
);

const TradeEntry = model<ITradeEntry>("Trade", tradeEntrySchema);

export default TradeEntry;
