import type { Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { SignupBody, LoginBody, LoginRes } from "../types/auth.types.js";
import User from "../models/user.model.js";
import type { IUser } from "../types/models.types.js";
import type { ApiResponse } from "../types/common.types.js";

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
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({ message: "An unknown error occurred" });
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

    return res.status(200).json({
      token: token,
      username: existingUser.username,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(500).json({ message: "An unknown error occurred" });
  }
}
