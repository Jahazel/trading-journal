import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
});

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/trades-entry", tradeEntryRoutes);
app.use("/api/no-trade-entries", noTradeEntryRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/upload", uploadRoutes);

export default app;
