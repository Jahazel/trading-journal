require("dotenv").config();
const connectDB = require("./config/database");
const app = require("./app");
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server on port ${PORT}:`, error.message);
    process.exit(1);
  }
}

startServer();
