import { Pool } from "pg";
import { randomUUID } from "node:crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function mapBookRow(row) {
  return {
    bookId: row.book_id,
    userId: row.user_id,
    title: row.title,
    totalPages: row.total_pages,
    isFinished: row.is_finished,
    createdAt: row.created_at,
    finishedAt: row.finished_at,
  };
}

export default async function handler(req, res) {
  const method = req.method || "GET";

  if (method === "POST") {
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
          : Number.isFinite(Number(totalPages)) &&
              Number.isInteger(Number(totalPages)) &&
                Number(totalPages) > 0
            ? Number(totalPages)
            : NaN;

    if (Number.isNaN(normalizedTotalPages)) {
      return res.status(400).json({
        error: "totalPages must be a positive integer (or omitted)",
      });
    }

    try {
      // Check if user already has a book with same title (case-insensitive).
      const existingResult = await pool.query(
        `
        SELECT
          book_id,
          user_id,
          title,
          total_pages,
          is_finished,
          created_at,
          finished_at
        FROM books
        WHERE user_id = $1
          AND LOWER(title) = LOWER($2)
        LIMIT 1
        `,
        [userId, trimmedTitle],
      );

      if (existingResult.rows.length > 0) {
        let row = existingResult.rows[0];

        if (
          normalizedTotalPages != null &&
          row.total_pages !== normalizedTotalPages
        ) {
          const updateResult = await pool.query(
            `
            UPDATE books
            SET total_pages = $2,
                updated_at = NOW()
            WHERE book_id = $1
            RETURNING
              book_id,
              user_id,
              title,
              total_pages,
              is_finished,
              created_at,
              finished_at
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

      const insertResult = await pool.query(
        `
        INSERT INTO books (book_id, user_id, title, total_pages, is_finished)
        VALUES ($1, $2, $3, $4, false)
        RETURNING
          book_id,
          user_id,
          title,
          total_pages,
          is_finished,
          created_at,
          finished_at
        `,
        [randomUUID(), userId, trimmedTitle, normalizedTotalPages],
      );

      return res.status(201).json({
        book: mapBookRow(insertResult.rows[0]),
        wasCreated: true,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("books POST error", err);
      return res.status(500).json({ error: "Failed to create or fetch book" });
    }
  }

  if (method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId =
    req.query?.userId ||
    new URL(req.url, `http://${req.headers.host || "localhost"}`).searchParams.get(
      "userId",
    );

  const mode =
    (req.query?.mode ||
      new URL(req.url, `http://${req.headers.host || "localhost"}`).searchParams.get(
        "mode",
      ) ||
      "current")?.toString();

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId query param is required" });
  }

  try {
    if (mode === "history") {
      const result = await pool.query(
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
        GROUP BY
          b.book_id,
          b.user_id,
          b.title,
          b.total_pages,
          b.is_finished,
          b.created_at,
          b.finished_at
        ORDER BY COALESCE(b.finished_at, MAX(rs.session_date), b.created_at) DESC,
                 b.created_at DESC
        `,
        [userId],
      );

      const books = result.rows.map((row) => {
        const base = mapBookRow(row);
        return {
          ...base,
          totalMinutes: Number(row.total_minutes) || 0,
          totalPagesRead: Number(row.total_pages_read) || 0,
          startDate: row.start_date,
          endDate: row.finished_at || row.latest_session_date || row.start_date,
        };
      });

      return res.status(200).json({ books });
    }

    const orderClause =
      mode === "all"
        ? "ORDER BY is_finished ASC, created_at DESC"
        : "ORDER BY created_at DESC";

    const rows = await pool.query(
      `
      SELECT
        book_id,
        user_id,
        title,
        total_pages,
        is_finished,
        created_at,
        finished_at
      FROM books
      WHERE user_id = $1
        ${mode === "current" ? "AND is_finished = false" : ""}
      ${orderClause}
      `,
      [userId],
    );

    return res.status(200).json({ books: rows.rows });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("books GET error", err);
    return res.status(500).json({ error: "Failed to fetch books" });
  }
}

