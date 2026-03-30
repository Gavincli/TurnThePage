import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
    const result = await pool.query(
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

    const goals = result.rows.map((row) => ({
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
    }));

    return res.status(200).json({ goals });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("goals error", err);
    return res.status(500).json({ error: "Failed to fetch goals" });
  }
}

