const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const tradesController = require("../controllers/trades.controller");
const { getAllTrades, getTrade, createTrade, updateTrade, deleteTrade } =
  tradesController;

const router = express.Router();

router.get("/", authMiddleware, getAllTrades);
router.get("/:id", authMiddleware, getTrade);
router.post("/", authMiddleware, createTrade);
router.put("/:id", authMiddleware, updateTrade);
router.delete("/:id", authMiddleware, deleteTrade);

module.exports = router;
