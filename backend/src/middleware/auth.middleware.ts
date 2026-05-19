import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "../types/auth.types.js";
import jwt from "jsonwebtoken";

export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies?.token;
    const secret = process.env.JWT_SECRET;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    if (!secret) {
      console.error("FATAL: JWT_SECRET is not configured.");
      return res.status(500).json({ message: "Internal server error." });
    }

    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    }) as unknown as JwtPayload;

    req.userId = decoded.id;

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
