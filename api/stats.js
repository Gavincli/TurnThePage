import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function computeStreakFromDates(descDates) {
  // descDates: array of date strings/objects sorted DESC (newest first)
  if (!descDates || descDates.length === 0) return 0;

  // Active streak must include today or yesterday.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecent = new Date(descDates[0]);
  mostRecent.setHours(0, 0, 0, 0);
  if (mostRecent < yesterday) return 0;

  // Replicate backend logic: consecutive days where each previous date is exactly 1 day before current.
  let streak = 1;
  for (let i = 1; i < descDates.length; i += 1) {
    const prev = new Date(descDates[i - 1]);
    const curr = new Date(descDates[i]);
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);
    const diffDays = (prev - curr) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) streak += 1;
    else break;
  }
  return streak;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId =
    req.query?.userId ||
    new URL(req.url, `http://${req.headers.host || "localhost"}`).searchParams.get(
      "userId",
    );

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId query param is required" });
  }

  try {
    // --- today & this-week minutes ---
    const periodResult = await pool.query(
      `
      SELECT
        COALESCE(SUM(CASE WHEN session_date = CURRENT_DATE THEN minutes_read ELSE 0 END), 0)
          AS today_minutes,
        COALESCE(SUM(
          CASE
            WHEN session_date >= date_trunc('week', CURRENT_DATE)
             AND session_date <= CURRENT_DATE
            THEN minutes_read
            ELSE 0
          END
        ), 0) AS week_minutes,
        COALESCE(SUM(minutes_read), 0) AS total_minutes
      FROM reading_sessions
      WHERE user_id = $1
      `,
      [userId],
    );

    const { today_minutes, week_minutes, total_minutes } = periodResult.rows[0];

    // --- streak: consecutive session dates ending today/yesterday ---
    const datesResult = await pool.query(
      `
        SELECT DISTINCT session_date::date AS d
        FROM reading_sessions
        WHERE user_id = $1
        ORDER BY d DESC
      `,
      [userId],
    );

    const dates = datesResult.rows.map((r) => r.d);
    const streak = computeStreakFromDates(dates);

    const booksFinishedResult = await pool.query(
      `
        SELECT COUNT(*) AS books_finished
        FROM books
        WHERE user_id = $1
          AND is_finished = true
      `,
      [userId],
    );
    const booksFinished = parseInt(booksFinishedResult.rows[0].books_finished, 10);

    return res.status(200).json({
      streak,
      todayMinutes: parseInt(today_minutes, 10),
      weekMinutes: parseInt(week_minutes, 10),
      totalMinutes: parseInt(total_minutes, 10),
      booksFinished,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("stats error", err);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
}

