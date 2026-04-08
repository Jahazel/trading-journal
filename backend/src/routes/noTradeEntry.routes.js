const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const noTradeEntryController = require("../controllers/noTradeEntry.controller");
const { getEntries, getEntry, createEntry, updateEntry, deleteEntry } =
  noTradeEntryController;

const router = express.Router();

router.get("/", authMiddleware, getEntries);
router.post("/", authMiddleware, createEntry);
router.get("/:id", authMiddleware, getEntry);
router.patch("/:id", authMiddleware, updateEntry);
router.delete("/:id", authMiddleware, deleteEntry);

module.exports = router;
