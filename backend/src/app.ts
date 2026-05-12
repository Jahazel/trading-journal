import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import tradeEntryRoutes from "./routes/tradeEntry.routes.js";
import noTradeEntryRoutes from "./routes/noTradeEntry.routes.js";
import accountRoutes from "./routes/account.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use("/api/auth", authRoutes);
app.use("/api/trades-entry", tradeEntryRoutes);
app.use("/api/no-trade-entries", noTradeEntryRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/upload", uploadRoutes);

export default app;
