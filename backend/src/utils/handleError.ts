import type { Response } from "express";

export function handleServerError(res: Response<any>, error: unknown) {
  console.error(error);

  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error."
      : error instanceof Error
        ? error.message
        : "An unknown error occurred.";

  return res.status(500).json({ message });
}
