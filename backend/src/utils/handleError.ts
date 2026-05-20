import mongoose from "mongoose";
import type { Response } from "express";
import { logger } from "./logger.js";

export function handleServerError(res: Response<any>, error: unknown) {
  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  logger.error("Unhandled server error", error instanceof Error ? error.stack : error);

  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error."
      : error instanceof Error
        ? error.message
        : "An unknown error occurred.";

  return res.status(500).json({ message });
}
