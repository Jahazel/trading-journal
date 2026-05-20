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
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
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
      min: 1,
      max: 100,
      validate: {
        validator: Number.isInteger,
        message: "Contracts must be a whole number",
      },
    },
    entryPrice: { type: Number, required: true, min: 0 },
    exitPrice: { type: Number, required: true, min: 0 },
    stopLoss: { type: Number, required: true, min: 0 },
    target: { type: Number, required: true, min: 0 },
    entryTime: { type: Date, required: true },
    exitTime: { type: Date, required: true },
    pnl: { type: Number },
    notes: { type: String, maxlength: 65536 },
    images: {
      type: [{ type: String }],
      validate: {
        validator: (arr: string[]) => arr.length <= 20,
        message: "A maximum of 20 images are allowed per entry.",
      },
      default: [],
    },
  },
  { timestamps: true },
);

const TradeEntry = model<ITradeEntry>("Trade", tradeEntrySchema);

export default TradeEntry;
