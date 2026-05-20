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

const rawOrigins = process.env.FRONTEND_URL;

if (!rawOrigins && process.env.NODE_ENV === "production") {
  console.error("FATAL: FRONTEND_URL is not set in production.");
  process.exit(1);
}

const allowedOrigins = (rawOrigins ?? "http://localhost:5173")
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

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Upload limit reached. Please try again later." },
});

app.use(helmet());
app.use(express.json({ limit: "50kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/trades-entry", apiLimiter, tradeEntryRoutes);
app.use("/api/no-trade-entries", apiLimiter, noTradeEntryRoutes);
app.use("/api/accounts", apiLimiter, accountRoutes);
app.use("/api/upload", uploadLimiter, uploadRoutes);

export default app;
