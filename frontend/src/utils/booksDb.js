/**
 * Map a books table row to the shape the Log Reading / Home UIs expect (camelCase).
 * @param {Record<string, unknown>} row
 */
export function mapBookRow(row) {
  return {
    bookId: row.book_id,
    userId: row.user_id,
    title: row.title,
    totalPages: row.total_pages,
    isFinished: row.is_finished,
    createdAt: row.created_at,
    finishedAt: row.finished_at,
  }
}

/**
 * History list with per-book aggregates (replaces GET /api/books/history).
 * @param {Record<string, unknown>[]} booksRows
 * @param {Record<string, unknown>[]} sessionsRows — must include book_id, minutes_read, pages_read, session_date
 */
export function aggregateBookHistory(booksRows, sessionsRows) {
  const aggs = (booksRows || []).map((r) => {
    const base = mapBookRow(r)
    return {
      ...base,
      totalMinutes: 0,
      totalPagesRead: 0,
      startDate: null,
      latestSessionDate: null,
    }
  })
  const byId = new Map(aggs.map((b) => [b.bookId, b]))

  for (const s of sessionsRows || []) {
    if (!s.book_id) continue
    const agg = byId.get(s.book_id)
    if (!agg) continue
    agg.totalMinutes += Number(s.minutes_read) || 0
    agg.totalPagesRead += Number(s.pages_read) || 0
    const sd = s.session_date
    if (!agg.startDate || sd < agg.startDate) agg.startDate = sd
    if (!agg.latestSessionDate || sd > agg.latestSessionDate)
      agg.latestSessionDate = sd
  }

  const sorted = [...aggs].sort((a, b) => {
    const endA = a.finishedAt || a.latestSessionDate || a.startDate || a.createdAt
    const endB = b.finishedAt || b.latestSessionDate || b.startDate || b.createdAt
    const ta = endA ? new Date(endA).getTime() : 0
    const tb = endB ? new Date(endB).getTime() : 0
    if (tb !== ta) return tb - ta
    const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return cb - ca
  })

  return sorted.map((b) => ({
    bookId: b.bookId,
    userId: b.userId,
    title: b.title,
    totalPages: b.totalPages,
    isFinished: b.isFinished,
    createdAt: b.createdAt,
    finishedAt: b.finishedAt,
    totalMinutes: b.totalMinutes,
    totalPagesRead: b.totalPagesRead,
    startDate: b.startDate,
    endDate: b.finishedAt || b.latestSessionDate || b.startDate,
  }))
}
