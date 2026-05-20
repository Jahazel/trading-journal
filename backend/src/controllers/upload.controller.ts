import type { Request, Response } from "express";
import { fileTypeFromBuffer } from "file-type";
import cloudinary from "../config/cloudinary.js";
import { handleServerError } from "../utils/handleError.js";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function uploadImage(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided." });
    }

    const detected = await fileTypeFromBuffer(req.file.buffer);
    if (!detected || !ALLOWED_MIME_TYPES.includes(detected.mime)) {
      return res.status(400).json({ message: "Unsupported file type." });
    }

    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "trading-journal" }, (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          })
          .end(req.file!.buffer);
      },
    );

    return res.status(200).json({ url: result.secure_url });
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}
