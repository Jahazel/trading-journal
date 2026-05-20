import mongoose, { Types } from "mongoose";
import type { Request, Response } from "express";
import NoTradeEntry from "../models/noTradeEntry.model.js";
import Account from "../models/account.model.js";
import type { INoTradeEntry } from "../types/models.types.js";
import type { ApiResponse } from "../types/common.types.js";
import type {
  EntryParams,
  CreateEntryBody,
  UpdateEntryBody,
} from "../types/noTradeEntry.types.js";
import { handleServerError } from "../utils/handleError.js";
import { sanitizeNotes } from "../utils/sanitizeHtml.js";
import { validateImageUrls } from "../utils/validateImages.js";

type ErrorResponse = { message: string };

export async function getNoTradeEntries(
  req: Request,
  res: Response<ApiResponse<INoTradeEntry[]>>,
) {
  try {
    const userId = req.userId!;

    const noTradeEntries = await NoTradeEntry.find({ userId })
      .select("entryTime accountId createdAt")
      .sort({ createdAt: -1 })
      .limit(200);

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
    const userId = req.userId!;
    const noTradeEntryId = req.params.id;

    if (!noTradeEntryId) {
      return res.status(400).json({ message: "Trade ID is required." });
    }

    if (!mongoose.isValidObjectId(noTradeEntryId)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const noTradeEntry = await NoTradeEntry.findOne({ _id: noTradeEntryId, userId });

    if (!noTradeEntry) {
      return res.status(404).json({ message: "Entry not found." });
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
    const userId = req.userId!;
    const { accountId, entryTime, notes, images } = req.body;

    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }

    if (images && !validateImageUrls(images)) {
      return res.status(400).json({ message: "Invalid image URL." });
    }

    const newNoTradeEntry = new NoTradeEntry({
      userId,
      accountId,
      entryTime,
      notes: sanitizeNotes(notes),
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
    const userId = req.userId!;
    const noTradeEntryId = req.params.id;
    const { accountId, entryTime, notes, images } = req.body;

    if (!noTradeEntryId) {
      return res.status(400).json({ message: "Trade ID is required." });
    }

    if (!mongoose.isValidObjectId(noTradeEntryId)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const noTradeEntry = await NoTradeEntry.findOne({ _id: noTradeEntryId, userId });

    if (!noTradeEntry) {
      return res.status(404).json({ message: "Entry not found." });
    }

    if (accountId !== undefined) {
      const account = await Account.findOne({ _id: accountId, userId });
      if (!account) {
        return res.status(404).json({ message: "Account not found." });
      }
      noTradeEntry.accountId = new Types.ObjectId(accountId);
    }
    if (notes !== undefined) noTradeEntry.notes = sanitizeNotes(notes);
    if (entryTime !== undefined) noTradeEntry.entryTime = new Date(entryTime);
    if (images !== undefined) {
      if (!validateImageUrls(images)) {
        return res.status(400).json({ message: "Invalid image URL." });
      }
      noTradeEntry.images = images;
    }

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
    const userId = req.userId!;
    const noTradeEntryId = req.params.id;

    if (!noTradeEntryId) {
      return res.status(400).json({ message: "Trade ID is required." });
    }

    if (!mongoose.isValidObjectId(noTradeEntryId)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const noTradeEntry = await NoTradeEntry.findOne({ _id: noTradeEntryId, userId });

    if (!noTradeEntry) {
      return res.status(404).json({ message: "Entry not found." });
    }

    await NoTradeEntry.findByIdAndDelete(noTradeEntryId);

    return res.status(200).json({ message: "Entry was successfully deleted." });
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}
