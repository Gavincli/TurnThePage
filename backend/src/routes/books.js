const express = require("express");
const { randomUUID } = require("crypto");
const { query } = require("../db");

const router = express.Router();

const mapBookRow = (row) => ({
  bookId: row.book_id,
  userId: row.user_id,
  title: row.title,
  totalPages: row.total_pages,
  isFinished: row.is_finished,
  createdAt: row.created_at,
  finishedAt: row.finished_at,
});

// POST /api/books
// Create a new book for a user, or return the existing one if that
// same user already has the same title (case-insensitive).
router.post("/", async (req, res) => {
  const { userId, title, totalPages } = req.body || {};

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId is required" });
  }

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  const trimmedTitle = title.trim();
  const normalizedTotalPages =
    totalPages == null || totalPages === ""
      ? null
      : Number.isInteger(totalPages) && totalPages > 0
        ? totalPages
        : NaN;

  if (Number.isNaN(normalizedTotalPages)) {
    return res.status(400).json({ error: "totalPages must be a positive integer" });
  }

  try {
    // Check whether this user already has the same title, ignoring case.
    const existingResult = await query(
      `
      SELECT book_id, user_id, title, total_pages, is_finished, created_at, finished_at
      FROM books
      WHERE user_id = $1
        AND LOWER(title) = LOWER($2)
      LIMIT 1
      `,
      [userId, trimmedTitle],
    );

    if (existingResult.rows.length > 0) {
      let row = existingResult.rows[0];

      // Allow the frontend to backfill total pages on an existing book.
      if (normalizedTotalPages != null && row.total_pages !== normalizedTotalPages) {
        const updateResult = await query(
          `
          UPDATE books
          SET total_pages = $2,
              updated_at = NOW()
          WHERE book_id = $1
          RETURNING book_id, user_id, title, total_pages, is_finished, created_at, finished_at
          `,
          [row.book_id, normalizedTotalPages],
        );
        row = updateResult.rows[0];
      }

      return res.status(200).json({
        book: mapBookRow(row),
        wasCreated: false,
      });
    }

    const insertResult = await query(
      `
      INSERT INTO books (book_id, user_id, title, total_pages, is_finished)
      VALUES ($1, $2, $3, $4, false)
      RETURNING book_id, user_id, title, total_pages, is_finished, created_at, finished_at
      `,
      [randomUUID(), userId, trimmedTitle, normalizedTotalPages],
    );

    const row = insertResult.rows[0];

    return res.status(201).json({
      book: mapBookRow(row),
      wasCreated: true,
    });
  } catch (err) {
    console.error("Error creating/reusing book", err);
    return res.status(500).json({ error: "Failed to create or fetch book" });
  }
});

// GET /api/books?userId=...
// Return all books for a user so the Log Reading page can
// load existing selections from the real backend.
router.get("/", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId query param is required" });
  }

  try {
    const result = await query(
      `
      SELECT book_id, user_id, title, total_pages, is_finished, created_at, finished_at
      FROM books
      WHERE user_id = $1
      ORDER BY is_finished ASC, created_at DESC
      `,
      [userId],
    );

    return res.json({ books: result.rows.map(mapBookRow) });
  } catch (err) {
    console.error("Error fetching books", err);
    return res.status(500).json({ error: "Failed to fetch books" });
  }
});

// GET /api/books/current?userId=...
// Return only unfinished books for that user.
router.get("/current", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId query param is required" });
  }

  try {
    const result = await query(
      `
      SELECT book_id, user_id, title, total_pages, is_finished, created_at, finished_at
      FROM books
      WHERE user_id = $1
        AND is_finished = false
      ORDER BY created_at DESC
      `,
      [userId],
    );

    return res.json({ books: result.rows.map(mapBookRow) });
  } catch (err) {
    console.error("Error fetching current books", err);
    return res.status(500).json({ error: "Failed to fetch current books" });
  }
});

// GET /api/books/history?userId=...
// Aggregate reading history by book for the Log Reading page.
router.get("/history", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId query param is required" });
  }

  try {
    const result = await query(
      `
      SELECT
        b.book_id,
        b.user_id,
        b.title,
        b.total_pages,
        b.is_finished,
        b.created_at,
        b.finished_at,
        COALESCE(SUM(rs.minutes_read), 0) AS total_minutes,
        COALESCE(SUM(rs.pages_read), 0) AS total_pages_read,
        MIN(rs.session_date) AS start_date,
        MAX(rs.session_date) AS latest_session_date
      FROM books b
      LEFT JOIN reading_sessions rs
        ON rs.book_id = b.book_id
      WHERE b.user_id = $1
      GROUP BY b.book_id, b.user_id, b.title, b.total_pages, b.is_finished, b.created_at, b.finished_at
      ORDER BY COALESCE(b.finished_at, MAX(rs.session_date), b.created_at) DESC, b.created_at DESC
      `,
      [userId],
    );

    const books = result.rows.map((row) => ({
      ...mapBookRow(row),
      totalMinutes: Number(row.total_minutes) || 0,
      totalPagesRead: Number(row.total_pages_read) || 0,
      startDate: row.start_date,
      endDate: row.finished_at || row.latest_session_date || row.start_date,
    }));

    return res.json({ books });
  } catch (err) {
    console.error("Error fetching book history", err);
    return res.status(500).json({ error: "Failed to fetch book history" });
  }
});

module.exports = router;
