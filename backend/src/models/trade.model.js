const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  result: { type: String, required: true, enum: ["Win", "Loss", "Break Even"] },
  contract: { type: String, required: true, enum: ["NQ", "MNQ", "ES", "MES"] },
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
  createdAt: { type: Date, default: Date.now },
});

const Trade = mongoose.model("Trade", tradeSchema);

module.exports = Trade;
