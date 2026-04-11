import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getTradeEntries,
  getTradeEntry,
  createTradeEntry,
  updateTradeEntry,
  deleteTradeEntry,
  getStats,
} from "../controllers/tradeEntry.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getTradeEntries);
router.post("/", authMiddleware, createTradeEntry);
router.get("/stats", authMiddleware, getStats);
router.get("/:id", authMiddleware, getTradeEntry);
router.patch("/:id", authMiddleware, updateTradeEntry);
router.delete("/:id", authMiddleware, deleteTradeEntry);

export default router;
