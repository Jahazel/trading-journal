import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import tradeEntryRoutes from "./routes/tradeEntry.routes.js";
import noTradeEntryRoutes from "./routes/noTradeEntry.routes.js";
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/trades-entry", tradeEntryRoutes);
app.use("/api/no-trade-entries", noTradeEntryRoutes);

export default app;
