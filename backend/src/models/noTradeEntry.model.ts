import { Schema, model } from "mongoose";
import type { INoTradeEntry } from "../types/models.types.js";

const noTradeEntrySchema = new Schema<INoTradeEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true, collection: "no_trade_entries" },
);

const NoTradeEntry = model<INoTradeEntry>("NoTradeEntry", noTradeEntrySchema);

export default NoTradeEntry;
