// Load .env before any route module — routes import db, which reads DATABASE_URL.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const goalsRouter = require("./routes/goals");
const sessionsRouter = require("./routes/sessions");
const booksRouter = require("./routes/books");
const statsRouter = require("./routes/stats");
const authRouter = require("./routes/auth");

const app = express();

// Allow the frontend (likely running on a different port) to call this API.
app.use(cors());
// Parse JSON request bodies into req.body.
app.use(express.json());

// Simple health check so you can verify the server is running.
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// All book-related endpoints live under /api/books.
app.use("/api/books", booksRouter);

// All goal-related endpoints live under /api/goals.
app.use("/api/goals", goalsRouter);

// All reading-session writes live under /api/sessions.
app.use("/api/sessions", sessionsRouter);

// Home page dashboard stats (streak, today, week, totals).
app.use("/api/stats", statsRouter);

app.use("/api/auth", authRouter);

// Same health check under /api for frontend + Railway checks.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const port = Number(process.env.PORT) || 4000;
// Railway requires binding to all interfaces.
const host = process.env.HOST || "0.0.0.0";

app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://${host}:${port}`);
});
