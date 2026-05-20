import mongoose from "mongoose";
import { Types } from "mongoose";
import type { Request, Response } from "express";
import { POINT_VALUES } from "../config/constants.js";
import TradeEntry from "../models/tradeEntry.model.js";
import Account from "../models/account.model.js";
import type { ITradeEntry } from "../types/models.types.js";
import type { ApiResponse } from "../types/common.types.js";
import type { ErrorResponse } from "../types/common.types.js";
import { handleServerError } from "../utils/handleError.js";
import { sanitizeNotes } from "../utils/sanitizeHtml.js";
import { validateImageUrls } from "../utils/validateImages.js";
import type {
  TradeEntryParams,
  CreateTradeEntryBody,
  UpdateEntryBody,
  TradeStatsInternal,
  TradeStatsResponse,
} from "../types/tradeEntry.types.js";

export async function getTradeEntries(
  req: Request,
  res: Response<ApiResponse<ITradeEntry[]>>,
) {
  try {
    const userId = req.userId!;

    const tradeEntries = await TradeEntry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(200);

    return res.status(200).json(tradeEntries);
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}

export async function getTradeEntry(
  req: Request<TradeEntryParams>,
  res: Response<ApiResponse<ITradeEntry>>,
) {
  try {
    const userId = req.userId!;
    const tradeEntryId = req.params.id;

    if (!tradeEntryId) {
      return res.status(400).json({ message: "Trade ID is required." });
    }

    if (!mongoose.isValidObjectId(tradeEntryId)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const tradeEntry = await TradeEntry.findById(tradeEntryId);

    if (!tradeEntry) {
      return res.status(404).json({ message: "Trade entry not found." });
    }

    if (tradeEntry.userId.toString() !== userId) {
      console.warn(`[authz] user ${userId} denied access to trade entry ${tradeEntryId}`);
      return res.status(403).json({
        message: "You don't have permission to view this trade entry.",
      });
    }

    return res.status(200).json(tradeEntry);
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}

function getPnl(
  contract: "NQ" | "MNQ" | "ES" | "MES",
  contracts: number,
  exitPrice: number,
  entryPrice: number,
  direction: "Long" | "Short",
  result?: string,
) {
  if (result === "Break Even") return 0;

  const pointValue = POINT_VALUES[contract];

  const multiplier = direction === "Long" ? 1 : -1;

  return (exitPrice - entryPrice) * contracts * pointValue * multiplier;
}

export async function createTradeEntry(
  req: Request<{}, {}, CreateTradeEntryBody>,
  res: Response<ApiResponse<ITradeEntry>>,
) {
  try {
    const userId = req.userId!;
    const {
      accountId,
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
      images,
    } = req.body;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }
    if (account.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to use this account." });
    }

    if (new Date(exitTime) < new Date(entryTime)) {
      return res.status(400).json({ message: "Exit time must be after entry time." });
    }

    if (images && !validateImageUrls(images)) {
      return res.status(400).json({ message: "Invalid image URL." });
    }

    const newTradeEntry = new TradeEntry({
      userId,
      accountId,
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
      pnl: getPnl(contract, contracts, exitPrice, entryPrice, direction, result),
      notes: sanitizeNotes(notes),
      images: images ?? [],
    });

    const savedTradeEntry = await newTradeEntry.save();

    return res.status(201).json(savedTradeEntry);
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}

export async function updateTradeEntry(
  req: Request<TradeEntryParams, {}, UpdateEntryBody>,
  res: Response<ApiResponse<ITradeEntry>>,
) {
  try {
    const {
      accountId,
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
      images,
    } = req.body;
    const userId = req.userId!;
    const tradeId = req.params.id;

    if (!tradeId) {
      return res.status(400).json({ message: "Trade ID is required." });
    }

    if (!mongoose.isValidObjectId(tradeId)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const tradeEntry = await TradeEntry.findById(tradeId);

    if (!tradeEntry) {
      return res.status(404).json({ message: "Trade entry not found." });
    }

    if (tradeEntry.userId.toString() !== userId) {
      console.warn(`[authz] user ${userId} denied update on trade entry ${tradeId}`);
      return res.status(403).json({
        message: "You don't have permission to update this trade entry.",
      });
    }

    if (accountId !== undefined) {
      const account = await Account.findById(accountId);
      if (!account) {
        return res.status(404).json({ message: "Account not found." });
      }
      if (account.userId.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "You don't have permission to use this account." });
      }
      tradeEntry.accountId = new Types.ObjectId(accountId);
    }
    if (result !== undefined) tradeEntry.result = result;
    if (contract !== undefined) tradeEntry.contract = contract;
    if (direction !== undefined) tradeEntry.direction = direction;
    if (contracts !== undefined) tradeEntry.contracts = contracts;
    if (entryPrice !== undefined) tradeEntry.entryPrice = entryPrice;
    if (exitPrice !== undefined) tradeEntry.exitPrice = exitPrice;
    if (stopLoss !== undefined) tradeEntry.stopLoss = stopLoss;
    if (target !== undefined) tradeEntry.target = target;
    if (entryTime !== undefined) tradeEntry.entryTime = new Date(entryTime);
    if (exitTime !== undefined) tradeEntry.exitTime = new Date(exitTime);
    tradeEntry.pnl = getPnl(
      contract ?? tradeEntry.contract,
      contracts ?? tradeEntry.contracts,
      exitPrice ?? tradeEntry.exitPrice,
      entryPrice ?? tradeEntry.entryPrice,
      direction ?? tradeEntry.direction,
      result ?? tradeEntry.result,
    );
    const effectiveEntry = entryTime ? new Date(entryTime) : tradeEntry.entryTime;
    const effectiveExit = exitTime ? new Date(exitTime) : tradeEntry.exitTime;
    if (effectiveExit < effectiveEntry) {
      return res.status(400).json({ message: "Exit time must be after entry time." });
    }

    if (notes !== undefined) tradeEntry.notes = sanitizeNotes(notes);
    if (images !== undefined) {
      if (!validateImageUrls(images)) {
        return res.status(400).json({ message: "Invalid image URL." });
      }
      tradeEntry.images = images;
    }

    const savedTradeEntry = await tradeEntry.save();

    return res.status(200).json(savedTradeEntry);
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}

export async function deleteTradeEntry(
  req: Request<TradeEntryParams>,
  res: Response<ErrorResponse>,
) {
  try {
    const userId = req.userId!;
    const tradeId = req.params.id;

    if (!tradeId) {
      return res.status(400).json({ message: "Trade ID is required." });
    }

    if (!mongoose.isValidObjectId(tradeId)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const tradeEntry = await TradeEntry.findById(tradeId);

    if (!tradeEntry) {
      return res.status(404).json({ message: "Trade entry not found." });
    }

    if (tradeEntry.userId.toString() !== userId) {
      console.warn(`[authz] user ${userId} denied delete on trade entry ${tradeId}`);
      return res.status(403).json({
        message: "You don't have permission to delete this trade entry.",
      });
    }

    await TradeEntry.findByIdAndDelete(tradeId);

    return res
      .status(200)
      .json({ message: "Trade entry was successfully deleted." });
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}

export async function getStats(
  req: Request,
  res: Response<ApiResponse<TradeStatsResponse>>,
) {
  try {
    const userId = req.userId!;

    const objectId = new mongoose.Types.ObjectId(userId);

    const stats = (await TradeEntry.aggregate([
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
    ])) as TradeStatsInternal[];

    if (!stats[0]) {
      return res
        .status(200)
        .json({ totalPnl: 0, winRate: 0, avgWin: 0, avgLoss: 0 });
    }

    const { totalPnl, totalWins, totalLosses, totalWinPnl, totalLossPnl } =
      stats[0];

    const denominator = totalWins + totalLosses;

    const winRate =
      denominator !== 0
        ? Number(((totalWins / denominator) * 100).toFixed(2))
        : 0;

    const avgWin = totalWins !== 0 ? totalWinPnl / totalWins : 0;

    const avgLoss = totalLosses !== 0 ? totalLossPnl / totalLosses : 0;

    return res.status(200).json({ totalPnl, winRate, avgWin, avgLoss });
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}
