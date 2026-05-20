import mongoose from "mongoose";
import type { Request, Response } from "express";
import Account from "../models/account.model.js";
import TradeEntry from "../models/tradeEntry.model.js";
import NoTradeEntry from "../models/noTradeEntry.model.js";
import type { IAccount } from "../types/models.types.js";
import type { ApiResponse } from "../types/common.types.js";
import type { ErrorResponse } from "../types/common.types.js";
import { handleServerError } from "../utils/handleError.js";
import type {
  AccountParams,
  CreateAccountBody,
  UpdateAccountBody,
} from "../types/account.types.js";

export async function getAccounts(
  req: Request,
  res: Response<ApiResponse<IAccount[]>>,
) {
  try {
    const userId = req.userId!;

    const accounts = await Account.find({ userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json(accounts);
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}

export async function getAccount(
  req: Request,
  res: Response<ApiResponse<IAccount>>,
) {
  try {
    const userId = req.userId!;
    const accountId = req.params.id;

    if (!accountId) {
      return res.status(400).json({ message: "Account ID is required." });
    }

    if (!mongoose.isValidObjectId(accountId)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const account = await Account.findOne({ _id: accountId, userId });

    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }

    return res.status(200).json(account);
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}

export async function createAccount(
  req: Request<{}, {}, CreateAccountBody>,
  res: Response<ApiResponse<IAccount>>,
) {
  try {
    const userId = req.userId!;
    const { accountName, startingBalance, type } = req.body;

    if (!accountName || !startingBalance || !type) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (startingBalance <= 0) {
      return res
        .status(400)
        .json({ message: "Starting balance must be greater than zero." });
    }

    if (type !== "personal" && type !== "funded") {
      return res.status(400).json({
        message: "Account type must be either 'personal' or 'funded'.",
      });
    }

    const newAccount = new Account({
      userId,
      accountName,
      startingBalance,
      type,
    });

    const savedNewAccount = await newAccount.save();

    return res.status(201).json(savedNewAccount);
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}

export async function updateAccount(
  req: Request<AccountParams, {}, UpdateAccountBody>,
  res: Response<ApiResponse<IAccount>>,
) {
  try {
    const { accountName, startingBalance, status, type } = req.body;
    const userId = req.userId!;
    const accountId = req.params.id;

    if (startingBalance !== undefined && startingBalance <= 0) {
      return res
        .status(400)
        .json({ message: "Starting balance must be greater than zero." });
    }

    if (type !== undefined && type !== "personal" && type !== "funded") {
      return res.status(400).json({
        message: "Account type must be either 'personal' or 'funded'.",
      });
    }

    if (!accountId) {
      return res.status(400).json({ message: "Account ID is required." });
    }

    if (!mongoose.isValidObjectId(accountId)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const account = await Account.findOne({ _id: accountId, userId });

    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }

    if (accountName !== undefined) account.accountName = accountName;
    if (startingBalance !== undefined)
      account.startingBalance = startingBalance;
    if (status !== undefined) account.status = status;
    if (type !== undefined) account.type = type;

    const savedAccount = await account.save();

    return res.status(200).json(savedAccount);
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}

export async function deleteAccount(
  req: Request<AccountParams>,
  res: Response<ErrorResponse>,
) {
  try {
    const userId = req.userId!;
    const accountId = req.params.id;

    if (!accountId) {
      return res.status(400).json({ message: "Account ID is required." });
    }

    if (!mongoose.isValidObjectId(accountId)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const account = await Account.findOne({ _id: accountId, userId });

    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }

    const numOfTradeEntries = await TradeEntry.countDocuments({ accountId });

    const numOfNoTradeEntries = await NoTradeEntry.countDocuments({
      accountId,
    });

    if (numOfTradeEntries > 0 || numOfNoTradeEntries > 0) {
      return res.status(409).json({
        message:
          "This account cannot be deleted because it still has entries associated with it.",
      });
    }

    await Account.findByIdAndDelete(accountId);

    return res
      .status(200)
      .json({ message: "Account was successfully deleted." });
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}
