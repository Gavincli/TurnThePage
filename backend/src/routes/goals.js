const express = require('express')
const { query } = require('../db')

const router = express.Router()

// GET /api/goals?userId=<uuid>
// Returns all structured goals for a user with current progress.
router.get('/', async (req, res) => {
  const { userId } = req.query

  // Basic validation so we don't accidentally run a query with a missing user id.
  if (!userId) {
    return res.status(400).json({ error: 'userId query param is required' })
  }

  try {
    // goal_templates.period drives Daily / Weekly / Monthly tabs on the Goals page.
    // Uses a parameterized query ($1) to avoid SQL injection.
    const result = await query(
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
    )

    // Shape rows into a frontend-friendly JSON structure.
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
    }))

    return res.json({ goals })
  } catch (err) {
    // For now we log the error server-side and return a generic message to the client.
    // This avoids leaking details about the database in API responses.
    // eslint-disable-next-line no-console
    console.error('Error fetching goals', err)
    return res.status(500).json({ error: 'Failed to fetch goals' })
  }
})

module.exports = router

