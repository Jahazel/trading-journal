import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getNoTradeEntries,
  getNoTradeEntry,
  createNoTradeEntry,
  updateNoTradeEntry,
  deleteNoTradeEntry,
} from "../controllers/noTradeEntry.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getNoTradeEntries);
router.post("/", authMiddleware, createNoTradeEntry);
router.get("/:id", authMiddleware, getNoTradeEntry);
router.patch("/:id", authMiddleware, updateNoTradeEntry);
router.delete("/:id", authMiddleware, deleteNoTradeEntry);

export default router;
