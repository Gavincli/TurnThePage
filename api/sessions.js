import { Pool } from "pg";
import { randomUUID } from "node:crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const mapGoalRow = (row) => ({
  templateId: row.template_id,
  title: row.title,
  description: row.description,
  period: row.period,
  points: row.points_value,
  target: row.target_value,
  progress: row.progress,
  isCompleted: row.is_completed,
  completedAt: row.completed_at,
  percentComplete: Number(row.percent_complete) || 0,
});

function calculateActiveStreak(datesDesc) {
  if (!datesDesc || datesDesc.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const normalizedDates = datesDesc.map((date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  if (normalizedDates[0] < yesterday) return 0;

  let streak = 1;
  for (let index = 1; index < normalizedDates.length; index += 1) {
    const previous = normalizedDates[index - 1];
    const current = normalizedDates[index];
    const diffDays = (previous - current) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) streak += 1;
    else break;
  }

  return streak;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    userId,
    minutesRead,
    sessionDate,
    bookId,
    pagesRead,
    finishedBook,
  } = req.body || {};

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId is required" });
  }

  if (
    typeof minutesRead !== "number" ||
    !Number.isFinite(minutesRead) ||
    minutesRead <= 0
  ) {
    return res.status(400).json({
      error: "minutesRead must be a positive number",
    });
  }

  const effectiveSessionDate =
    sessionDate || new Date().toISOString().slice(0, 10);

  if (
    pagesRead != null &&
    (!Number.isInteger(pagesRead) || pagesRead < 0)
  ) {
    return res.status(400).json({
      error: "pagesRead must be a whole number that is 0 or greater",
    });
  }

  if (bookId != null && typeof bookId !== "string") {
    return res.status(400).json({
      error: "bookId must be a string when provided",
    });
  }

  if (finishedBook && !bookId) {
    return res.status(400).json({
      error: "Select or create a book before marking it as finished",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (bookId) {
      const bookResult = await client.query(
        `
          SELECT book_id
          FROM books
          WHERE book_id = $1 AND user_id = $2
          LIMIT 1
        `,
        [bookId, userId],
      );
      if (bookResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "Selected book was not found for this user. Refresh and try again.",
        });
      }
    }

    // 1) Insert reading session.
    await client.query(
      `
        INSERT INTO reading_sessions (
          session_id,
          user_id,
          book_id,
          minutes_read,
          pages_read,
          session_date
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        randomUUID(),
        userId,
        bookId || null,
        minutesRead,
        pagesRead ?? null,
        effectiveSessionDate,
      ],
    );

    // 2) Mark book finished (if requested).
    if (finishedBook && bookId) {
      await client.query(
        `
          UPDATE books
          SET is_finished = true,
              finished_at = COALESCE(finished_at, $2::date),
              updated_at = NOW()
          WHERE book_id = $1
        `,
        [bookId, effectiveSessionDate],
      );
    }

    // Helper to fetch goals for user.
    const fetchGoalsForUser = async () => {
      const goalsResult = await client.query(
        `
          SELECT
            gt.template_id,
            gt.title,
            gt.description,
            gt.period,
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
      return goalsResult.rows.map(mapGoalRow);
    };

    // 3) Recalculate minutes_total.
    await client.query(
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

    // 4) Recalculate minutes_single.
    await client.query(
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

    // 5) Recalculate books_finished.
    await client.query(
      `
        UPDATE user_goals ug
        SET progress = (
          SELECT COUNT(*)
          FROM books
          WHERE user_id = $1
            AND is_finished = true
        )
        FROM goal_templates gt
        WHERE ug.template_id = gt.template_id
          AND ug.user_id = $1
          AND gt.goal_type = 'books_finished'
      `,
      [userId],
    );

    // 6) Recalculate streak days + weekend.
    const streakDatesResult = await client.query(
      `
        SELECT DISTINCT session_date::date AS d
        FROM reading_sessions
        WHERE user_id = $1
        ORDER BY d DESC
      `,
      [userId],
    );

    const activeStreak = calculateActiveStreak(
      streakDatesResult.rows.map((row) => row.d),
    );

    await client.query(
      `
        UPDATE user_goals ug
        SET progress = $2
        FROM goal_templates gt
        WHERE ug.template_id = gt.template_id
          AND ug.user_id = $1
          AND gt.goal_type = 'streak_days'
      `,
      [userId, activeStreak],
    );

    await client.query(
      `
        UPDATE user_goals ug
        SET progress = (
          SELECT COUNT(DISTINCT EXTRACT(DOW FROM session_date))
          FROM reading_sessions
          WHERE user_id = $1
            AND session_date >= date_trunc('week', CURRENT_DATE)::date
            AND session_date <= CURRENT_DATE
            AND EXTRACT(DOW FROM session_date) IN (0, 6)
        )
        FROM goal_templates gt
        WHERE ug.template_id = gt.template_id
          AND ug.user_id = $1
          AND gt.goal_type = 'streak_weekend'
      `,
      [userId],
    );

    // 7) Mark newly completed goals.
    await client.query(
      `
        UPDATE user_goals ug
        SET is_completed = true,
            completed_at = COALESCE(completed_at, NOW())
        WHERE ug.user_id = $1
          AND ug.is_completed = false
          AND ug.progress >= (
            SELECT target_value
            FROM goal_templates gt
            WHERE gt.template_id = ug.template_id
          )
      `,
      [userId],
    );

    const goals = await fetchGoalsForUser();

    const newlyCompletedResult = await client.query(
      `
        SELECT
          gt.template_id,
          gt.title,
          gt.description,
          gt.period,
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
          AND ug.is_completed = true
          AND ug.completed_at >= NOW() - INTERVAL '5 seconds'
        ORDER BY gt.display_order
      `,
      [userId],
    );

    await client.query("COMMIT");

    const newlyCompleted = newlyCompletedResult.rows.map(mapGoalRow);
    return res.status(201).json({ goals, newlyCompleted });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // no-op
    }
    // eslint-disable-next-line no-console
    console.error("sessions error", err);
    return res.status(500).json({ error: "Failed to log reading session" });
  } finally {
    client.release();
  }
}

