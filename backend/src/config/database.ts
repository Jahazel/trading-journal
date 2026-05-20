import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

mongoose.set("sanitizeFilter", true);

const connectionString = process.env.MONGO_URI as string;

async function connectDB() {
  try {
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 5_000,
      socketTimeoutMS: 45_000,
      connectTimeoutMS: 10_000,
    });
    logger.info("MongoDB Atlas connected successfully!");
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Failed to connect to MongoDB Atlas: ${error.message}`);
    }

    process.exit(1);
  }
}

export default connectDB;
