import type { Request, Response } from "express";
import { Types } from "mongoose";
import NoTradeEntry from "../models/noTradeEntry.model.js";
import type { INoTradeEntry } from "../types/models.types.js";
import type { ApiResponse } from "../types/common.types.js";
import type {
  EntryParams,
  CreateEntryBody,
  UpdateEntryBody,
} from "../types/noTradeEntry.types.js";
import { handleServerError } from "../utils/handleError.js";

type ErrorResponse = { message: string };

export async function getNoTradeEntries(
  req: Request,
  res: Response<ApiResponse<INoTradeEntry[]>>,
) {
  try {
    const userId = req.userId;

    const noTradeEntries = await NoTradeEntry.find({ userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json(noTradeEntries);
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}

export async function getNoTradeEntry(
  req: Request<EntryParams>,
  res: Response<ApiResponse<INoTradeEntry>>,
) {
  try {
    const userId = req.userId;
    const noTradeEntryId = req.params.id;

    if (!noTradeEntryId) {
      return res.status(400).json({ message: "Trade ID is required." });
    }

    const noTradeEntry = await NoTradeEntry.findById(noTradeEntryId);

    if (!noTradeEntry) {
      return res.status(404).json({ message: "Entry not found." });
    }

    if (noTradeEntry.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to view this entry." });
    }

    return res.status(200).json(noTradeEntry);
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}

export async function createNoTradeEntry(
  req: Request<{}, {}, CreateEntryBody>,
  res: Response<ApiResponse<INoTradeEntry>>,
) {
  try {
    const userId = req.userId;
    const { accountId, entryTime, notes, images } = req.body;

    const newNoTradeEntry = new NoTradeEntry({
      userId,
      accountId,
      entryTime,
      notes,
      images: images ?? [],
    });

    const savedNewNoTradeEntry = await newNoTradeEntry.save();

    return res.status(201).json(savedNewNoTradeEntry);
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}

export async function updateNoTradeEntry(
  req: Request<EntryParams, {}, UpdateEntryBody>,
  res: Response<ApiResponse<INoTradeEntry>>,
) {
  try {
    const userId = req.userId;
    const noTradeEntryId = req.params.id;
    const { accountId, entryTime, notes, images } = req.body;

    if (!noTradeEntryId) {
      return res.status(400).json({ message: "Trade ID is required." });
    }

    const noTradeEntry = await NoTradeEntry.findById(noTradeEntryId);

    if (!noTradeEntry) {
      return res.status(404).json({ message: "Entry not found." });
    }

    if (noTradeEntry.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to update this entry." });
    }

    if (accountId !== undefined)
      noTradeEntry.accountId = new Types.ObjectId(accountId);
    if (notes !== undefined) noTradeEntry.notes = notes;
    if (entryTime !== undefined) noTradeEntry.entryTime = new Date(entryTime);
    if (images !== undefined) noTradeEntry.images = images;

    const savedNoTradeEntry = await noTradeEntry.save();

    return res.status(200).json(savedNoTradeEntry);
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}

export async function deleteNoTradeEntry(
  req: Request<EntryParams>,
  res: Response<ErrorResponse>,
) {
  try {
    const userId = req.userId;
    const noTradeEntryId = req.params.id;

    if (!noTradeEntryId) {
      return res.status(400).json({ message: "Trade ID is required." });
    }

    const noTradeEntry = await NoTradeEntry.findById(noTradeEntryId);

    if (!noTradeEntry) {
      return res.status(404).json({ message: "Entry not found." });
    }

    if (noTradeEntry.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to delete this entry." });
    }

    await NoTradeEntry.findByIdAndDelete(noTradeEntryId);

    return res.status(200).json({ message: "Entry was successfully deleted." });
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}
