const mongoose = require("mongoose");

const noTradeEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true },
);

const NoTradeEntry = mongoose.model("NoTradeEntry", noTradeEntrySchema);

module.exports = NoTradeEntry;
