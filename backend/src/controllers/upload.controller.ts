import type { Request, Response } from "express";
import cloudinary from "../config/cloudinary.js";

export async function uploadImage(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided." });
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
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "An unknown error occurred" });
  }
}
