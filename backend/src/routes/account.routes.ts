import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../controllers/account.controller.js";
const router = express.Router();

router.get("/", authMiddleware, getAccounts);
router.post("/", authMiddleware, createAccount);
router.get("/:id", authMiddleware, getAccount);
router.patch("/:id", authMiddleware, updateAccount);
router.delete("/:id", authMiddleware, deleteAccount);

export default router;
