import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "../types/auth.types.js";
import jwt from "jsonwebtoken";

export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    if (!secret) {
      throw new Error("JWT_SECRET is missing from environment variables.");
    }

    const decoded = jwt.verify(token, secret) as unknown as JwtPayload;

    req.userId = decoded.id;

    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(403).json({ message: error.message });
    }
  }
}
