const express = require('express')
const { query } = require('../db')

const router = express.Router()

// GET /api/stats?userId=<uuid>
// Returns reading stats for the home page dashboard:
//   streak        – consecutive days with at least one reading session (ending today or yesterday)
//   todayMinutes  – total minutes logged today (local date of the server)
//   weekMinutes   – total minutes logged Mon–Sun of the current ISO week
//   totalMinutes  – all-time total minutes
//   booksFinished – count of books marked is_finished = true
router.get('/', async (req, res) => {
  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({ error: 'userId query param is required' })
  }

  try {
    // --- today & this-week minutes ---
    const periodResult = await query(
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
      [userId]
    )

    const { today_minutes, week_minutes, total_minutes } = periodResult.rows[0]

    // --- streak: count consecutive days ending today or yesterday ---
    // We pull distinct session dates in descending order and walk backward.
    const datesResult = await query(
      `
      SELECT DISTINCT session_date::date AS d
      FROM reading_sessions
      WHERE user_id = $1
      ORDER BY d DESC
      `,
      [userId]
    )

    const dates = datesResult.rows.map((r) => r.d) // already JS Date objects from pg

    let streak = 0
    if (dates.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      // Streak must include today or yesterday to be "active"
      const mostRecent = new Date(dates[0])
      mostRecent.setHours(0, 0, 0, 0)

      if (mostRecent >= yesterday) {
        streak = 1
        for (let i = 1; i < dates.length; i++) {
          const prev = new Date(dates[i - 1])
          const curr = new Date(dates[i])
          prev.setHours(0, 0, 0, 0)
          curr.setHours(0, 0, 0, 0)

          const diffDays = (prev - curr) / (1000 * 60 * 60 * 24)
          if (diffDays === 1) {
            streak++
          } else {
            break
          }
        }
      }
    }

    // --- books finished ---
    const booksResult = await query(
      `
      SELECT COUNT(*) AS books_finished
      FROM books
      WHERE user_id = $1
        AND is_finished = true
      `,
      [userId]
    )

    const booksFinished = parseInt(booksResult.rows[0].books_finished, 10)

    return res.json({
      streak,
      todayMinutes: parseInt(today_minutes, 10),
      weekMinutes: parseInt(week_minutes, 10),
      totalMinutes: parseInt(total_minutes, 10),
      booksFinished,
    })
  } catch (err) {
    console.error('Error fetching stats', err)
    return res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

module.exports = router
