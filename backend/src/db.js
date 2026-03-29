const { Pool } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

let pool = null

function buildPool() {
  const conn = process.env.DATABASE_URL
  if (!conn || !String(conn).trim()) {
    throw new Error('DATABASE_URL is not set. Add it in Railway → Variables.')
  }

  const isSupabase =
    conn.includes('supabase.co') || conn.includes('pooler.supabase.com')
  const useSsl =
    process.env.PGSSLMODE === 'require' ||
    process.env.NODE_ENV === 'production' ||
    isSupabase
  const allowSelfSigned =
    conn.includes('pooler.supabase.com') || process.env.PGSSLMODE === 'no-verify'

  let connectionString = conn
  try {
    const u = new URL(conn)
    u.searchParams.delete('sslmode')
    connectionString = u.toString()
  } catch {
    // Invalid URL shape (e.g. unencoded password chars) — use raw string
    connectionString = conn
  }

  return new Pool({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: !allowSelfSigned } : undefined,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })
}

function getPool() {
  if (!pool) {
    pool = buildPool()
  }
  return pool
}

/** @param {string} text @param {unknown[]} [params] */
function query(text, params) {
  return getPool().query(text, params)
}

module.exports = {
  query,
  getPool,
  pool: new Proxy(
    {},
    {
      get(_, prop) {
        return getPool()[prop]
      },
    },
  ),
}
