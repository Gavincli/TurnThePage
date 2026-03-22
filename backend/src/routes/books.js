const express = require("express");
const { randomUUID } = require("crypto");
const { query } = require("../db");

const router = express.Router();

// POST /api/books
// Create a new book for a user, or return the existing one if that
// same user already has the same title (case-insensitive).
router.post("/", async (req, res) => {
  const { userId, title } = req.body || {};

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId is required" });
  }

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  const trimmedTitle = title.trim();

  try {
    // Check whether this user already has the same title, ignoring case.
    const existingResult = await query(
      `
      SELECT book_id, user_id, title, is_finished, created_at, finished_at
      FROM books
      WHERE user_id = $1
        AND LOWER(title) = LOWER($2)
      LIMIT 1
      `,
      [userId, trimmedTitle],
    );

    if (existingResult.rows.length > 0) {
      const row = existingResult.rows[0];

      return res.status(200).json({
        book: {
          bookId: row.book_id,
          userId: row.user_id,
          title: row.title,
          isFinished: row.is_finished,
          createdAt: row.created_at,
          finishedAt: row.finished_at,
        },
        wasCreated: false,
      });
    }

    const insertResult = await query(
      `
      INSERT INTO books (book_id, user_id, title, is_finished)
      VALUES ($1, $2, $3, false)
      RETURNING book_id, user_id, title, is_finished, created_at, finished_at
      `,
      [randomUUID(), userId, trimmedTitle],
    );

    const row = insertResult.rows[0];

    return res.status(201).json({
      book: {
        bookId: row.book_id,
        userId: row.user_id,
        title: row.title,
        isFinished: row.is_finished,
        createdAt: row.created_at,
        finishedAt: row.finished_at,
      },
      wasCreated: true,
    });
  } catch (err) {
    console.error("Error creating/reusing book", err);
    return res.status(500).json({ error: "Failed to create or fetch book" });
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
      SELECT book_id, user_id, title, is_finished, created_at, finished_at
      FROM books
      WHERE user_id = $1
        AND is_finished = false
      ORDER BY created_at DESC
      `,
      [userId],
    );

    const books = result.rows.map((row) => ({
      bookId: row.book_id,
      userId: row.user_id,
      title: row.title,
      isFinished: row.is_finished,
      createdAt: row.created_at,
      finishedAt: row.finished_at,
    }));

    return res.json({ books });
  } catch (err) {
    console.error("Error fetching current books", err);
    return res.status(500).json({ error: "Failed to fetch current books" });
  }
});

module.exports = router;
