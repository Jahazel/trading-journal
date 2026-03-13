const Trade = require("../models/trade.model");
const POINT_VALUES = require("../config/constants");

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

function getPnl(contract, contracts, exitPrice, entryPrice, direction) {
  if (direction === "Long") {
    return (exitPrice - entryPrice) * contracts * POINT_VALUES[contract];
  } else {
    return (entryPrice - exitPrice) * contracts * POINT_VALUES[contract];
  }
}

async function createTrade(req, res) {
  try {
    const {
      contract,
      direction,
      contracts,
      entryPrice,
      exitPrice,
      stopLoss,
      target,
      entryTime,
      exitTime,
      setup,
      notes,
    } = req.body;
    const userId = req.userId;

    const newTradeEntry = new Trade({
      userId: userId,
      contract: contract.toUpperCase(),
      direction: direction,
      contracts: contracts,
      entryPrice: entryPrice,
      exitPrice: exitPrice,
      stopLoss: stopLoss,
      target: target,
      entryTime: entryTime,
      exitTime: exitTime,
      pnl: getPnl(contract, contracts, exitPrice, entryPrice, direction),
      setup: setup,
      notes: notes,
    });

    const savedTradeEntry = await newTradeEntry.save();

    return res.status(201).json({
      savedTradeEntry,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { getAllTrades, getTrade, createTrade };
