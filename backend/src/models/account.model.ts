import { Schema, model } from "mongoose";
import type { IAccount } from "../types/models.types.js";

const accountSchema = new Schema<IAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountName: { type: String, required: true },
    startingBalance: { type: Number, required: true },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive", "closed"],
    },
    type: {
      type: String,
      required: true,
      enum: ["personal", "funded"],
    },
  },
  { timestamps: true, collection: "accounts" },
);

const Account = model<IAccount>("Account", accountSchema);

export default Account;
