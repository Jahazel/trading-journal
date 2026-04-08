const Trade = require("../models/trade.model");
const POINT_VALUES = require("../config/constants");
const mongoose = require("mongoose");

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
      result,
      contract,
      direction,
      contracts,
      entryPrice,
      exitPrice,
      stopLoss,
      target,
      entryTime,
      exitTime,
      notes,
    } = req.body;
    const userId = req.userId;

    if (result === "No Trade") {
      const newTradeEntry = new Trade({
        userId: userId,
        result: result,
        notes: notes,
        pnl: 0,
      });

      const savedTradeEntry = await newTradeEntry.save();
      return res.status(201).json(savedTradeEntry);
    } else {
      const newTradeEntry = new Trade({
        userId: userId,
        result: result,
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
        notes: notes,
      });

      const savedTradeEntry = await newTradeEntry.save();

      return res.status(201).json(savedTradeEntry);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateTrade(req, res) {
  try {
    const {
      result,
      contract,
      direction,
      contracts,
      entryPrice,
      exitPrice,
      stopLoss,
      target,
      entryTime,
      exitTime,
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

    if (result !== undefined) tradeEntry.result = result;
    if (contract !== undefined) tradeEntry.contract = contract.toUpperCase();
    if (direction !== undefined) tradeEntry.direction = direction;
    if (contracts !== undefined) tradeEntry.contracts = contracts;
    if (entryPrice !== undefined) tradeEntry.entryPrice = entryPrice;
    if (exitPrice !== undefined) tradeEntry.exitPrice = exitPrice;
    if (stopLoss !== undefined) tradeEntry.stopLoss = stopLoss;
    if (target !== undefined) tradeEntry.target = target;
    if (entryTime !== undefined) tradeEntry.entryTime = entryTime;
    if (exitTime !== undefined) tradeEntry.exitTime = exitTime;
    tradeEntry.pnl = getPnl(
      contract ?? tradeEntry.contract,
      contracts ?? tradeEntry.contracts,
      exitPrice ?? tradeEntry.exitPrice,
      entryPrice ?? tradeEntry.entryPrice,
      direction ?? tradeEntry.direction,
    );
    if (notes !== undefined) tradeEntry.notes = notes;

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

async function getStats(req, res) {
  try {
    const userId = req.userId;
    const objectId = new mongoose.Types.ObjectId(userId);

    const stats = await Trade.aggregate([
      { $match: { userId: objectId } },
      {
        $group: {
          _id: null,
          totalPnl: { $sum: "$pnl" },
          totalWins: { $sum: { $cond: [{ $eq: ["$result", "Win"] }, 1, 0] } },
          totalLosses: {
            $sum: { $cond: [{ $eq: ["$result", "Loss"] }, 1, 0] },
          },
          totalWinPnl: {
            $sum: { $cond: [{ $eq: ["$result", "Win"] }, "$pnl", 0] },
          },
          totalLossPnl: {
            $sum: { $cond: [{ $eq: ["$result", "Loss"] }, "$pnl", 0] },
          },
        },
      },
    ]);

    if (!stats[0]) {
      return res
        .status(200)
        .json({ totalPnl: 0, winRate: 0, avgWin: 0, avgLoss: 0 });
    }

    const totalPnl = stats[0].totalPnl ?? 0;

    const denominator = stats[0].totalWins + stats[0].totalLosses;
    const winRate =
      denominator !== 0
        ? Number(((stats[0].totalWins / denominator) * 100).toFixed(2))
        : 0;

    const avgWin =
      stats[0].totalWins !== 0 ? stats[0].totalWinPnl / stats[0].totalWins : 0;

    const avgLoss =
      stats[0].totalLosses !== 0
        ? stats[0].totalLossPnl / stats[0].totalLosses
        : 0;

    return res.status(200).json({ totalPnl, winRate, avgWin, avgLoss });
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
  getStats,
};
