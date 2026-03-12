const express = require("express");
const app = express();
const authRoutes = require("./routes/auth.routes");
const tradeRoutes = require("./routes/trades.routes");

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/trades", tradeRoutes);

module.exports = app;
