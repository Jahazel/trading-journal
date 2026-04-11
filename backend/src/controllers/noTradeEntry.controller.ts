import type { Request, Response } from "express";
import NoTradeEntry from "../models/noTradeEntry.model.js";
import type { INoTradeEntry } from "../types/models.types.js";
import type { ApiResponse } from "../types/common.types.js";
import type {
  EntryParams,
  CreateEntryBody,
  UpdateEntryBody,
} from "../types/noTradeEntry.types.js";

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
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({ message: "An unknown error occurred" });
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
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({ message: "An unknown error occurred" });
  }
}

export async function createNoTradeEntry(
  req: Request<{}, {}, CreateEntryBody>,
  res: Response<ApiResponse<INoTradeEntry>>,
) {
  try {
    const userId = req.userId;
    const { date, notes } = req.body;

    const newNoTradeEntry = new NoTradeEntry({
      userId,
      date,
      notes,
    });

    const savedNewNoTradeEntry = await newNoTradeEntry.save();

    return res.status(201).json(savedNewNoTradeEntry);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({ message: "An unknown error occurred" });
  }
}

export async function updateNoTradeEntry(
  req: Request<EntryParams, {}, UpdateEntryBody>,
  res: Response<ApiResponse<INoTradeEntry>>,
) {
  try {
    const userId = req.userId;
    const noTradeEntryId = req.params.id;
    const { date, notes } = req.body;

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

    if (notes !== undefined) noTradeEntry.notes = notes;
    if (date !== undefined) noTradeEntry.date = new Date(date);

    const savedNoTradeEntry = await noTradeEntry.save();

    return res.status(200).json(savedNoTradeEntry);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({ message: "An unknown error occurred" });
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
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({ message: "An unknown error occurred" });
  }
}
