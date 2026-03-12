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

module.exports = { getAllTrades };
