import { Schema, model } from "mongoose";
import type { IUser } from "../types/models.types.js";

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minLength: 1,
      maxLength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email."],
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      maxLength: 100,
      select: false,
    },
  },
  { timestamps: true },
);

const User = model<IUser>("User", userSchema);

export default User;
