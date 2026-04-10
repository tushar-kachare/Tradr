const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRouter = require("./modules/auth/auth.routes");
const usersRouter = require("./modules/users/users.routes");
const postsRouter = require("./modules/posts/posts.routes");
const tradesRouter = require("./modules/trades/trades.routes");
const portfolioRouter = require("./modules/portfolio/portfolio.routes");
const coinsRouter = require("./modules/coins/coins.routes");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/trades", tradesRouter);
app.use("/api/coins", coinsRouter);

module.exports = app;
