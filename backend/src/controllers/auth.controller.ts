import type { Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { SignupBody, LoginBody, LoginRes } from "../types/auth.types.js";
import User from "../models/user.model.js";
import type { IUser } from "../types/models.types.js";
import type { ApiResponse } from "../types/common.types.js";
import { handleServerError } from "../utils/handleError.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function signUp(
  req: Request<{}, {}, SignupBody>,
  res: Response<ApiResponse<IUser>>,
) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields." });
    }

    const existingUser = await User.findOne({
      $or: [
        {
          username: username,
        },
        {
          email: email,
        },
      ],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username is already in use." });
      } else if (existingUser.email === email) {
        return res.status(400).json({ message: "Email is already in use." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });

    await newUser.save();

    return res
      .status(201)
      .json({ message: "User has successfully signed up." });
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}

export async function login(
  req: Request<{}, {}, LoginBody>,
  res: Response<ApiResponse<LoginRes>>,
) {
  try {
    const { email, password } = req.body;
    const secret = process.env.JWT_SECRET;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields." });
    }

    const existingUser = await User.findOne({
      email: email,
    }).select("+password");

    if (!existingUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!secret) {
      throw new Error("JWT_SECRET is missing from environment variables");
    }

    const token = jsonwebtoken.sign({ id: existingUser.id }, secret, {
      expiresIn: "7d",
    });

    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(200).json({
      username: existingUser.username,
      userId: existingUser.id,
    });
  } catch (error: unknown) {
    return handleServerError(res, error);
  }
}

export function logout(_req: Request, res: Response) {
  res.clearCookie("token", COOKIE_OPTIONS);
  return res.status(200).json({ message: "Logged out successfully." });
}
