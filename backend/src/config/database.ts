import mongoose from "mongoose";
const connectionString = process.env.MONGO_URI as string;

async function connectDB() {
  try {
    await mongoose.connect(connectionString);
    console.log("MongoDB Atlas connected successfully!");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to connect to MongoDB Atlas:", error.message);
    }

    process.exit(1);
  }
}

export default connectDB;
