const Trade = require("../models/trade.model");
const POINT_VALUES = require("../config/constants");

async function getAllTrades(req, res) {
  try {
    const userId = req.userId;

    const trades = await Trade.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json(trades);
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

    if (tradeEntry.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to view this trade." });
    }

    return res.status(200).json(tradeEntry);
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

    return res.status(201).json(savedTradeEntry);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateTrade(req, res) {
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
    const tradeId = req.params.id;
    const tradeEntry = await Trade.findById(tradeId);

    if (!tradeEntry) {
      return res.status(404).json({ message: "Trade entry not found." });
    }

    if (tradeEntry.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to update this trade." });
    }

    tradeEntry.contract = contract.toUpperCase();
    tradeEntry.direction = direction;
    tradeEntry.contracts = contracts;
    tradeEntry.entryPrice = entryPrice;
    tradeEntry.exitPrice = exitPrice;
    tradeEntry.stopLoss = stopLoss;
    tradeEntry.target = target;
    tradeEntry.entryTime = entryTime;
    tradeEntry.exitTime = exitTime;
    tradeEntry.pnl = getPnl(
      contract,
      contracts,
      exitPrice,
      entryPrice,
      direction,
    );
    tradeEntry.setup = setup;
    tradeEntry.notes = notes;

    const savedTradeEntry = await tradeEntry.save();

    return res.status(200).json(savedTradeEntry);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function deleteTrade(req, res) {
  try {
    const tradeId = req.params.id;
    const tradeEntry = await Trade.findById(tradeId);

    if (!tradeEntry) {
      return res.status(404).json({ message: "Trade entry not found." });
    }

    if (tradeEntry.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to delete this trade." });
    }

    await Trade.findByIdAndDelete(tradeId);

    return res
      .status(200)
      .json({ message: "Trade entry was successfully deleted." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getAllTrades,
  getTrade,
  createTrade,
  updateTrade,
  deleteTrade,
};
