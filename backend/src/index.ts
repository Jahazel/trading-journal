import "dotenv/config";
import connectDB from "./config/database.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Failed to start server on port ${PORT}:`, error.message);
    }

    process.exit(1);
  }
}

startServer();
