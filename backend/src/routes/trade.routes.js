const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const tradesController = require("../controllers/trade.controller");
const {
  getAllTrades,
  getTrade,
  createTrade,
  updateTrade,
  deleteTrade,
  getStats,
} = tradesController;

const router = express.Router();

router.get("/", authMiddleware, getAllTrades);
router.post("/", authMiddleware, createTrade);
router.get("/stats", authMiddleware, getStats);
router.get("/:id", authMiddleware, getTrade);
router.patch("/:id", authMiddleware, updateTrade);
router.delete("/:id", authMiddleware, deleteTrade);

module.exports = router;
