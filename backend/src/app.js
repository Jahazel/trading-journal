const express = require("express");
const app = express();
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const tradeRoutes = require("./routes/trade.routes");
const noTradeEntryRoutes = require("./routes/noTradeEntry.routes");

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/no-trade-entries", noTradeEntryRoutes);

module.exports = app;
