-- Migration 003: Goals System & Reading Sessions
-- Adds:
--   1. goal_templates  — the 10 app-wide goals every user can unlock
--   2. reading_sessions — logs every time a user reads (source of truth for progress)
--   3. user_goals       — tracks each user's progress toward each template goal
--   4. points_earned    — running points total added to the users table
--
-- HOW IT CONNECTS TO YOUR APP:
--   - When a user finishes a reading session, INSERT into reading_sessions.
--   - After each session, run the goal-check logic (see bottom of file) to update
--     user_goals.progress and mark goals complete when target is hit.
--   - Award points by updating users.points_earned when a goal is completed.
--   - The old `goals` table (user-created freeform goals) is kept as-is.
--     goal_templates / user_goals are the structured achievement system.

BEGIN;

-- ─────────────────────────────────────────────
-- 1. ADD POINTS COLUMN TO USERS
-- ─────────────────────────────────────────────
-- Tracks total points a user has earned across all completed goals.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS points_earned INTEGER NOT NULL DEFAULT 0;

-- ─────────────────────────────────────────────
-- 2. GOAL TEMPLATES
-- ─────────────────────────────────────────────
-- App-wide goal definitions. These are the same for every user.
-- goal_type controls how progress is calculated:
--   'minutes_single'  — minutes read in a single day         (e.g. "Read 30 min in one day")
--   'minutes_total'   — cumulative minutes read ever         (e.g. "Read 300 min total")
--   'streak_days'     — consecutive days with a session      (e.g. "7-day streak")
--   'streak_weekend'  — read on both Sat + Sun same weekend  (e.g. "Weekend Warrior")
--   'books_finished'  — total books marked finished          (e.g. "Finish 3 books")

CREATE TABLE IF NOT EXISTS goal_templates (
  template_id     UUID PRIMARY KEY,
  title           VARCHAR(100)  NOT NULL,
  description     VARCHAR(255)  NOT NULL,
  goal_type       VARCHAR(50)   NOT NULL,  -- see key above
  target_value    INTEGER       NOT NULL,  -- numeric threshold to complete goal
  points_value    INTEGER       NOT NULL,  -- points awarded on completion
  display_order   INTEGER       NOT NULL   -- controls display order in UI (1 = first)
);

CREATE INDEX IF NOT EXISTS idx_goal_templates_display_order ON goal_templates(display_order);

-- Seed the 10 goals we designed
INSERT INTO goal_templates (template_id, title, description, goal_type, target_value, points_value, display_order)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'First Step',       'Read for 10 minutes',                      'minutes_total',   10,  10,  1),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Getting Going',    'Read for 30 minutes in a single day',       'minutes_single',  30,  25,  2),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Daily Reader',     'Maintain a 3-day reading streak',           'streak_days',      3,  50,  3),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'Weekend Warrior',  'Read on both Saturday and Sunday',          'streak_weekend',   2,  75,  4),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'Halfway There',    'Read for 60 minutes total',                 'minutes_total',   60, 100,  5),
  ('aaaaaaaa-0000-0000-0000-000000000006', 'Week Warrior',     'Maintain a 7-day reading streak',           'streak_days',      7, 150,  6),
  ('aaaaaaaa-0000-0000-0000-000000000007', 'Bookworm',         'Finish your first full book',               'books_finished',   1, 200,  7),
  ('aaaaaaaa-0000-0000-0000-000000000008', 'Marathon Reader',  'Read for 300 minutes total',                'minutes_total',  300, 250,  8),
  ('aaaaaaaa-0000-0000-0000-000000000009', 'Page Turner',      'Finish 3 books',                            'books_finished',   3, 400,  9),
  ('aaaaaaaa-0000-0000-0000-000000000010', 'Literacy Legend',  'Maintain a 30-day reading streak',          'streak_days',     30, 500, 10)
ON CONFLICT (template_id) DO NOTHING;

-- ─────────────────────────────────────────────
-- 3. READING SESSIONS
-- ─────────────────────────────────────────────
-- One row per reading session. This is the source of truth.
-- All goal progress (minutes, streaks, weekend reads) is derived from this table.
--
-- book_id is nullable — not every session is tied to a specific book.
-- session_date is DATE (not TIMESTAMP) so streak/weekend logic is day-based.

CREATE TABLE IF NOT EXISTS reading_sessions (
  session_id    UUID PRIMARY KEY,
  user_id       UUID    NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  book_id       UUID,                        -- optional, for future books table
  minutes_read  INTEGER NOT NULL CHECK (minutes_read > 0),
  session_date  DATE    NOT NULL,
  logged_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id      ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_session_date ON reading_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_date    ON reading_sessions(user_id, session_date);

-- ─────────────────────────────────────────────
-- 4. USER GOALS
-- ─────────────────────────────────────────────
-- Tracks each user's progress toward each goal template.
-- A row is created here when a user first makes progress toward a goal
-- (or you can pre-populate all 10 rows on user signup — see note below).
--
-- progress     — current value toward target (e.g. 45 out of 60 minutes)
-- is_completed — flipped to true when progress >= target_value
-- completed_at — timestamp when goal was first completed

CREATE TABLE IF NOT EXISTS user_goals (
  user_goal_id  UUID PRIMARY KEY,
  user_id       UUID    NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  template_id   UUID    NOT NULL REFERENCES goal_templates(template_id) ON DELETE CASCADE,
  progress      INTEGER NOT NULL DEFAULT 0,
  is_completed  BOOLEAN NOT NULL DEFAULT false,
  completed_at  TIMESTAMP,
  UNIQUE (user_id, template_id)   -- one row per user per goal
);

CREATE INDEX IF NOT EXISTS idx_user_goals_user_id     ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_template_id ON user_goals(template_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_completed   ON user_goals(is_completed);

-- ─────────────────────────────────────────────
-- 5. SEED USER GOALS FOR TEST USER
-- ─────────────────────────────────────────────
-- Pre-populates all 10 goal rows for the existing test user (from 002_seed_data).
-- In production, do this on user signup so the Goals page always shows all 10.

INSERT INTO user_goals (user_goal_id, user_id, template_id, progress, is_completed)
VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 0, false),
  ('bbbbbbbb-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000002', 0, false),
  ('bbbbbbbb-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000003', 0, false),
  ('bbbbbbbb-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000004', 0, false),
  ('bbbbbbbb-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000005', 0, false),
  ('bbbbbbbb-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000006', 0, false),
  ('bbbbbbbb-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000007', 0, false),
  ('bbbbbbbb-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000008', 0, false),
  ('bbbbbbbb-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000009', 0, false),
  ('bbbbbbbb-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000010', 0, false)
ON CONFLICT (user_id, template_id) DO NOTHING;

COMMIT;


-- ═══════════════════════════════════════════════════════════════════
-- INTEGRATION GUIDE
-- ═══════════════════════════════════════════════════════════════════
--
-- HOW TO RUN THIS MIGRATION:
--   psql $DATABASE_URL -v ON_ERROR_STOP=1 -f db/migrations/003_goals_and_sessions.sql
--   (or add it to db-migrate.sh alongside 001 and 002)
--
-- ── ON USER SIGNUP ───────────────────────────────────────────────
-- Insert 10 user_goals rows (one per template) so the Goals page
-- always shows all goals for every user. Use a loop or bulk INSERT.
--
-- ── WHEN A USER LOGS A READING SESSION ──────────────────────────
-- 1. INSERT into reading_sessions (session_id, user_id, minutes_read, session_date)
-- 2. After insert, run goal-check queries for that user:
--
--   — minutes_total goals:
--     UPDATE user_goals ug
--     SET progress = (
--       SELECT COALESCE(SUM(minutes_read), 0)
--       FROM reading_sessions
--       WHERE user_id = $userId
--     )
--     FROM goal_templates gt
--     WHERE ug.template_id = gt.template_id
--       AND ug.user_id = $userId
--       AND gt.goal_type = 'minutes_total';
--
--   — minutes_single goals:
--     UPDATE user_goals ug
--     SET progress = (
--       SELECT COALESCE(MAX(daily_total), 0)
--       FROM (
--         SELECT SUM(minutes_read) AS daily_total
--         FROM reading_sessions
--         WHERE user_id = $userId
--         GROUP BY session_date
--       ) daily
--     )
--     FROM goal_templates gt
--     WHERE ug.template_id = gt.template_id
--       AND ug.user_id = $userId
--       AND gt.goal_type = 'minutes_single';
--
--   — streak_days goals (current consecutive day streak):
--     Calculate in app logic or use a window function.
--     Store result in users.current_streak (add that column if needed),
--     then UPDATE user_goals SET progress = current_streak WHERE goal_type = 'streak_days'.
--
--   — streak_weekend goals:
--     SELECT COUNT(DISTINCT EXTRACT(DOW FROM session_date))
--     FROM reading_sessions
--     WHERE user_id = $userId
--       AND EXTRACT(DOW FROM session_date) IN (0, 6)  -- 0=Sun, 6=Sat
--       AND DATE_TRUNC('week', session_date) = DATE_TRUNC('week', CURRENT_DATE);
--     If result = 2, set progress = 2 (goal complete).
--
-- ── WHEN A GOAL IS COMPLETED ────────────────────────────────────
-- After updating progress, check if progress >= target_value:
--   UPDATE user_goals
--   SET is_completed = true, completed_at = NOW()
--   WHERE user_id = $userId
--     AND is_completed = false
--     AND progress >= (
--       SELECT target_value FROM goal_templates WHERE template_id = user_goals.template_id
--     );
--
-- Then award points:
--   UPDATE users
--   SET points_earned = points_earned + (
--     SELECT SUM(gt.points_value)
--     FROM user_goals ug
--     JOIN goal_templates gt ON ug.template_id = gt.template_id
--     WHERE ug.user_id = $userId
--       AND ug.is_completed = true
--       AND ug.completed_at >= NOW() - INTERVAL '5 seconds'  -- only newly completed
--   )
--   WHERE user_id = $userId;
--
-- ── FETCHING GOALS FOR THE UI ────────────────────────────────────
-- SELECT
--   gt.title,
--   gt.description,
--   gt.points_value,
--   gt.target_value,
--   ug.progress,
--   ug.is_completed,
--   ug.completed_at,
--   ROUND((ug.progress::DECIMAL / gt.target_value) * 100, 1) AS percent_complete
-- FROM user_goals ug
-- JOIN goal_templates gt ON ug.template_id = gt.template_id
-- WHERE ug.user_id = $userId
-- ORDER BY gt.display_order;
-- ═══════════════════════════════════════════════════════════════════
