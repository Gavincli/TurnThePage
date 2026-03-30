import { randomUUID, createHash } from "node:crypto";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

function sanitizeUsername(username) {
  return String(username || "")
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, "");
}

async function seedUserGoals(client, userId) {
  const templates = await client.query(
    `SELECT template_id
     FROM public.goal_templates`,
  );

  for (const row of templates.rows) {
    await client.query(
      `INSERT INTO public.user_goals (user_goal_id, user_id, template_id, progress, is_completed)
       VALUES ($1, $2, $3, 0, false)
       ON CONFLICT (user_id, template_id) DO NOTHING`,
      [randomUUID(), userId, row.template_id],
    );
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const action = String(req.body?.action || "").trim().toLowerCase();
  const username = sanitizeUsername(req.body?.username);
  const password = String(req.body?.password || "");

  if (action !== "login" && action !== "signup") {
    return res.status(400).json({ error: "Invalid action." });
  }
  if (!username || username.length < 3 || username.length > 50) {
    return res
      .status(400)
      .json({ error: "Username must be 3-50 characters (letters, numbers, underscore)." });
  }
  if (!password || password.length < 4 || password.length > 100) {
    return res.status(400).json({ error: "Password must be 4-100 characters." });
  }

  const client = await pool.connect();
  try {
    if (action === "login") {
      const existing = await client.query(
        `SELECT user_id, username, email, display_name, selected_avatar, password_hash
         FROM public.users
         WHERE lower(username) = lower($1)
         LIMIT 1`,
        [username],
      );

      const row = existing.rows[0];
      if (!row || row.password_hash !== hashPassword(password)) {
        return res.status(401).json({ error: "Invalid username or password." });
      }

      await client.query(
        `UPDATE public.users
         SET last_login_at = now()
         WHERE user_id = $1`,
        [row.user_id],
      );

      return res.status(200).json({
        userId: row.user_id,
        username: row.username,
        email: row.email,
        displayName: row.display_name,
        selectedAvatar: row.selected_avatar,
        pointsEarned: 0,
      });
    }

    await client.query("BEGIN");

    const collision = await client.query(
      `SELECT 1
       FROM public.users
       WHERE lower(username) = lower($1)
       LIMIT 1`,
      [username],
    );
    if (collision.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Username is already taken." });
    }

    const userId = randomUUID();
    const normalizedUsername = username.toLowerCase();
    const now = new Date().toISOString();
    const inserted = await client.query(
      `INSERT INTO public.users (
         user_id,
         username,
         email,
         password_hash,
         created_at,
         last_login_at,
         is_active,
         display_name
       )
       VALUES ($1, $2, $3, $4, $5, $5, true, $2)
       RETURNING user_id, username, email, display_name, selected_avatar`,
      [
        userId,
        normalizedUsername,
        `${normalizedUsername}@demo.local`,
        hashPassword(password),
        now,
      ],
    );

    await seedUserGoals(client, userId);
    await client.query("COMMIT");

    const row = inserted.rows[0];
    return res.status(200).json({
      userId: row.user_id,
      username: row.username,
      email: row.email,
      displayName: row.display_name,
      selectedAvatar: row.selected_avatar,
      pointsEarned: 0,
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // no-op
    }
    console.error("auth endpoint error", error);
    return res.status(500).json({ error: "Auth request failed." });
  } finally {
    client.release();
  }
}
