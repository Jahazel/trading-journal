const mongoose = require("mongoose");
const connectionString = process.env.MONGO_URI;

async function connectDB() {
  try {
    await mongoose.connect(connectionString);
    console.log("MongoDB Atlas connected successfully!");
  } catch (error) {
    console.error("Failed to connect to MongoDB Atlas:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
