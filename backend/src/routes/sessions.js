const express = require("express");
const { randomUUID } = require("crypto");
const { query } = require("../db");

const router = express.Router();

// POST /api/sessions
// Logs a reading session and updates goal progress for that user.
// This endpoint is designed to be testable with curl/Postman first.
// The Log Reading page will call it later; it does not depend on any UI.
router.post("/", async (req, res) => {
  const { userId, minutesRead, sessionDate, bookId } = req.body || {};

  // Basic validation so we don't write obviously bad data or run updates for "no user".
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId is required" });
  }

  if (
    typeof minutesRead !== "number" ||
    !Number.isFinite(minutesRead) ||
    minutesRead <= 0
  ) {
    return res
      .status(400)
      .json({ error: "minutesRead must be a positive number" });
  }

  // sessionDate is kept as a string here; Postgres DATE will parse ISO-like strings.
  const effectiveSessionDate = sessionDate || new Date().toISOString().slice(0, 10);

  const client = await query("SELECT 1").then((r) => r.client).catch(() => null);

  try {
    // Start a transaction so inserts + progress updates are applied atomically.
    await query("BEGIN");

    // 1. Insert the new reading session.
    await query(
      `
      INSERT INTO reading_sessions (session_id, user_id, book_id, minutes_read, session_date)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [randomUUID(), userId, bookId || null, minutesRead, effectiveSessionDate],
    );

    // 2. Recalculate minutes_total goals.
    await query(
      `
      UPDATE user_goals ug
      SET progress = (
        SELECT COALESCE(SUM(minutes_read), 0)
        FROM reading_sessions
        WHERE user_id = $1
      )
      FROM goal_templates gt
      WHERE ug.template_id = gt.template_id
        AND ug.user_id = $1
        AND gt.goal_type = 'minutes_total'
      `,
      [userId],
    );

    // 3. Recalculate minutes_single goals (best single-day total).
    await query(
      `
      UPDATE user_goals ug
      SET progress = (
        SELECT COALESCE(MAX(daily_total), 0)
        FROM (
          SELECT SUM(minutes_read) AS daily_total
          FROM reading_sessions
          WHERE user_id = $1
          GROUP BY session_date
        ) daily
      )
      FROM goal_templates gt
      WHERE ug.template_id = gt.template_id
        AND ug.user_id = $1
        AND gt.goal_type = 'minutes_single'
      `,
      [userId],
    );

    // NOTE: For now we are not updating streak-based or books_finished goals here.
    // Those can be layered in later without breaking this contract.

    // 4. Mark newly completed goals (based on updated progress/target_value).
    await query(
      `
      UPDATE user_goals ug
      SET is_completed = true,
          completed_at = COALESCE(completed_at, NOW())
      WHERE ug.user_id = $1
        AND ug.is_completed = false
        AND ug.progress >= (
          SELECT target_value FROM goal_templates gt
          WHERE gt.template_id = ug.template_id
        )
      `,
      [userId],
    );

    // 5. Fetch all goals for this user so the frontend can refresh its view.
    const goalsResult = await query(
      `
      SELECT
        gt.template_id,
        gt.title,
        gt.description,
        gt.points_value,
        gt.target_value,
        ug.progress,
        ug.is_completed,
        ug.completed_at,
        ROUND(
          CASE
            WHEN gt.target_value > 0
            THEN (ug.progress::DECIMAL / gt.target_value) * 100
            ELSE 0
          END
          , 1
        ) AS percent_complete
      FROM user_goals ug
      JOIN goal_templates gt ON ug.template_id = gt.template_id
      WHERE ug.user_id = $1
      ORDER BY gt.display_order
      `,
      [userId],
    );

    // 6. Identify goals that were just completed in this transaction.
    const newlyCompletedResult = await query(
      `
      SELECT
        gt.template_id,
        gt.title,
        gt.description,
        gt.points_value,
        gt.target_value,
        ug.progress,
        ug.is_completed,
        ug.completed_at
      FROM user_goals ug
      JOIN goal_templates gt ON ug.template_id = gt.template_id
      WHERE ug.user_id = $1
        AND ug.is_completed = true
        AND ug.completed_at >= NOW() - INTERVAL '5 seconds'
      ORDER BY gt.display_order
      `,
      [userId],
    );

    await query("COMMIT");

    const goals = goalsResult.rows.map((row) => ({
      templateId: row.template_id,
      title: row.title,
      description: row.description,
      points: row.points_value,
      target: row.target_value,
      progress: row.progress,
      isCompleted: row.is_completed,
      completedAt: row.completed_at,
      percentComplete: Number(row.percent_complete) || 0,
    }));

    const newlyCompleted = newlyCompletedResult.rows.map((row) => ({
      templateId: row.template_id,
      title: row.title,
      description: row.description,
      points: row.points_value,
      target: row.target_value,
      progress: row.progress,
      isCompleted: row.is_completed,
      completedAt: row.completed_at,
    }));

    return res.status(201).json({ goals, newlyCompleted });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Error logging session", err);
    try {
      await query("ROLLBACK");
    } catch (rollbackErr) {
      // eslint-disable-next-line no-console
      console.error("Error rolling back transaction", rollbackErr);
    }
    return res.status(500).json({ error: "Failed to log reading session" });
  }
});

module.exports = router;

