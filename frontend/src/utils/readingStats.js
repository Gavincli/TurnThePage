/** Local YYYY-MM-DD (calendar day in the user’s timezone). */
export function localDateStr(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfWeekMondayFromDateStr(dateStr) {
  const [y, mo, da] = dateStr.split('-').map(Number)
  const d = new Date(y, mo - 1, da)
  const day = d.getDay()
  const offset = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + offset)
  return localDateStr(d)
}

/**
 * Dashboard aggregates (mirrors backend stats.js intent; uses local calendar for “today” / week).
 * @param {{ minutes_read: number, session_date: string }[]} sessions
 */
export function computeStatsFromSessions(sessions, booksFinished) {
  const list = sessions || []
  const today = localDateStr()
  const weekStart = startOfWeekMondayFromDateStr(today)

  let todayMinutes = 0
  let weekMinutes = 0
  let totalMinutes = 0

  for (const s of list) {
    const m = Number(s.minutes_read) || 0
    totalMinutes += m
    const sd = s.session_date
    if (sd === today) todayMinutes += m
    if (sd >= weekStart && sd <= today) weekMinutes += m
  }

  const dateSet = [...new Set(list.map((s) => s.session_date))].sort(
    (a, b) => (a < b ? 1 : a > b ? -1 : 0),
  )

  let streak = 0
  if (dateSet.length > 0) {
    const first = dateSet[0]
    const yesterdayStr = (() => {
      const [y, mo, da] = today.split('-').map(Number)
      const d = new Date(y, mo - 1, da)
      d.setDate(d.getDate() - 1)
      return localDateStr(d)
    })()

    if (first === today || first === yesterdayStr) {
      streak = 1
      for (let i = 1; i < dateSet.length; i += 1) {
        const prev = dateSet[i - 1]
        const curr = dateSet[i]
        const p = new Date(`${prev}T12:00:00`)
        const c = new Date(`${curr}T12:00:00`)
        const diffDays = (p - c) / (1000 * 60 * 60 * 24)
        if (diffDays === 1) streak += 1
        else break
      }
    }
  }

  return {
    streak,
    todayMinutes,
    weekMinutes,
    totalMinutes,
    booksFinished: booksFinished ?? 0,
  }
}
