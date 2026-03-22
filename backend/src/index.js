const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const goalsRouter = require("./routes/goals");
const sessionsRouter = require("./routes/sessions");
const booksRouter = require("./routes/books");

// Load environment variables from .env so PORT and DATABASE_URL are available.
dotenv.config();

const app = express();

// Allow the frontend (likely running on a different port) to call this API.
app.use(cors());
// Parse JSON request bodies into req.body.
app.use(express.json());

const PORT = process.env.PORT || 4000;

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

app.listen(PORT, () => {
  // This log is useful when you are debugging which port the backend is actually using.
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
});
