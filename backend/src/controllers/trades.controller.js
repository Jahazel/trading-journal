const Trade = require("../models/trade.model");

async function getAllTrades(req, res) {
  try {
    const userId = req.userId;

    const trades = await Trade.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      trades,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getTrade(req, res) {
  try {
    const tradeId = req.params.id;
    const tradeEntry = await Trade.findById(tradeId);

    if (!tradeEntry) {
      return res.status(404).json({ message: "Trade entry not found." });
    }

    if (tradeEntry.userId !== req.userId) {
      return res.status(401).json({ message: "Trade entry not found." });
    }

    return res.status(200).json({
      tradeEntry,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { getAllTrades, getTrade };
