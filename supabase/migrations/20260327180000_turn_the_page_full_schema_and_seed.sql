-- Turn the Page — full schema + demo seed (canonical copy of db/migrations 001, 002, 004–008).
-- Use on a fresh Supabase/Postgres database. Remove older partial migrations in this folder if you reset the migration history.

BEGIN;

-- ---------------------------------------------------------------------------
-- Schema (merged final shape; no separate ALTERs required on greenfield)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  last_login_at TIMESTAMP,
  is_active BOOLEAN NOT NULL,
  display_name VARCHAR(100),
  selected_avatar VARCHAR(64),
  points_earned INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS goals (
  goal_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  goal_title VARCHAR(255) NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_finished TIMESTAMP,
  priority_order INTEGER NOT NULL,
  percent_complete DECIMAL(5,2) NOT NULL,
  is_completed BOOLEAN NOT NULL,
  frequency VARCHAR(20) NOT NULL DEFAULT 'daily'
    CHECK (frequency IN ('daily', 'weekly', 'all_time'))
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_priority_order ON goals(priority_order);
CREATE INDEX IF NOT EXISTS idx_goals_is_completed ON goals(is_completed);

CREATE TABLE IF NOT EXISTS books (
  book_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  is_finished BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_pages INTEGER CHECK (total_pages IS NULL OR total_pages > 0)
);

CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_is_finished ON books(is_finished);
CREATE INDEX IF NOT EXISTS idx_books_user_finished ON books(user_id, is_finished);
CREATE UNIQUE INDEX IF NOT EXISTS idx_books_user_title_ci ON books(user_id, LOWER(title));

CREATE TABLE IF NOT EXISTS user_reward_unlocks (
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  reward_key VARCHAR(64) NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, reward_key)
);

CREATE INDEX IF NOT EXISTS idx_user_reward_unlocks_user_id ON user_reward_unlocks(user_id);

CREATE TABLE IF NOT EXISTS goal_templates (
  template_id UUID PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  goal_type VARCHAR(50) NOT NULL,
  target_value INTEGER NOT NULL,
  points_value INTEGER NOT NULL,
  display_order INTEGER NOT NULL,
  period VARCHAR(20) NOT NULL DEFAULT 'daily'
    CHECK (period IN ('daily', 'weekly', 'monthly'))
);

CREATE INDEX IF NOT EXISTS idx_goal_templates_display_order ON goal_templates(display_order);

CREATE TABLE IF NOT EXISTS reading_sessions (
  session_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(book_id) ON DELETE SET NULL,
  minutes_read INTEGER NOT NULL CHECK (minutes_read > 0),
  pages_read INTEGER CHECK (pages_read IS NULL OR pages_read >= 0),
  session_date DATE NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_session_date ON reading_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_date ON reading_sessions(user_id, session_date);

CREATE TABLE IF NOT EXISTS user_goals (
  user_goal_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES goal_templates(template_id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP,
  UNIQUE (user_id, template_id)
);

CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_template_id ON user_goals(template_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_completed ON user_goals(is_completed);

-- ---------------------------------------------------------------------------
-- Upgrade: DBs created by older migrations (CREATE TABLE IF NOT EXISTS skipped)
-- ---------------------------------------------------------------------------

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS selected_avatar VARCHAR(64);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS points_earned INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS frequency VARCHAR(20) NOT NULL DEFAULT 'daily'
    CHECK (frequency IN ('daily', 'weekly', 'all_time'));

ALTER TABLE books
  ADD COLUMN IF NOT EXISTS total_pages INTEGER
    CHECK (total_pages IS NULL OR total_pages > 0);

CREATE INDEX IF NOT EXISTS idx_books_user_finished ON books(user_id, is_finished);
CREATE UNIQUE INDEX IF NOT EXISTS idx_books_user_title_ci ON books(user_id, LOWER(title));

CREATE TABLE IF NOT EXISTS user_reward_unlocks (
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  reward_key VARCHAR(64) NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, reward_key)
);

CREATE INDEX IF NOT EXISTS idx_user_reward_unlocks_user_id ON user_reward_unlocks(user_id);

ALTER TABLE goal_templates
  ADD COLUMN IF NOT EXISTS period VARCHAR(20) NOT NULL DEFAULT 'daily'
    CHECK (period IN ('daily', 'weekly', 'monthly'));

UPDATE goal_templates SET period = 'daily'
WHERE template_id IN (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000002'
);

UPDATE goal_templates SET period = 'weekly'
WHERE template_id IN (
  'aaaaaaaa-0000-0000-0000-000000000003',
  'aaaaaaaa-0000-0000-0000-000000000004',
  'aaaaaaaa-0000-0000-0000-000000000006'
);

UPDATE goal_templates SET period = 'monthly'
WHERE template_id IN (
  'aaaaaaaa-0000-0000-0000-000000000005',
  'aaaaaaaa-0000-0000-0000-000000000007',
  'aaaaaaaa-0000-0000-0000-000000000008',
  'aaaaaaaa-0000-0000-0000-000000000009',
  'aaaaaaaa-0000-0000-0000-000000000010'
);

ALTER TABLE reading_sessions
  ADD COLUMN IF NOT EXISTS pages_read INTEGER
    CHECK (pages_read IS NULL OR pages_read >= 0);

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------

-- Demo password for both users: "password" (bcrypt; Laravel-style test vector).
INSERT INTO users (
  user_id,
  username,
  email,
  password_hash,
  created_at,
  last_login_at,
  is_active,
  display_name,
  selected_avatar
)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'testuser',
    'test@example.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    NOW(),
    NOW(),
    true,
    'Test User',
    'fox'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'demouser2',
    'demo2@example.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    NOW(),
    NOW(),
    true,
    'Demo User Two',
    'owl'
  )
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO goals (
  goal_id,
  user_id,
  goal_title,
  date_created,
  date_finished,
  priority_order,
  percent_complete,
  is_completed,
  frequency
)
VALUES
  (
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'Read 10 minutes',
    NOW(),
    NULL,
    1,
    0.00,
    false,
    'daily'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Read 20 pages',
    NOW(),
    NULL,
    2,
    0.00,
    false,
    'daily'
  ),
  (
    '22222222-2222-2222-2222-222222222223',
    '11111111-1111-1111-1111-111111111111',
    'Finish 1 book',
    NOW(),
    NULL,
    3,
    0.00,
    false,
    'all_time'
  ),
  (
    '22222222-2222-2222-2222-222222222231',
    '33333333-3333-3333-3333-333333333333',
    'Read 10 minutes',
    NOW(),
    NULL,
    1,
    0.00,
    false,
    'daily'
  ),
  (
    '22222222-2222-2222-2222-222222222232',
    '33333333-3333-3333-3333-333333333333',
    'Read 20 pages',
    NOW(),
    NULL,
    2,
    0.00,
    false,
    'daily'
  ),
  (
    '22222222-2222-2222-2222-222222222233',
    '33333333-3333-3333-3333-333333333333',
    'Finish 1 book',
    NOW(),
    NULL,
    3,
    0.00,
    false,
    'all_time'
  )
ON CONFLICT (goal_id) DO NOTHING;

INSERT INTO goal_templates (
  template_id,
  title,
  description,
  goal_type,
  target_value,
  points_value,
  display_order,
  period
)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'First Step', 'Read for 10 minutes', 'minutes_total', 10, 10, 1, 'daily'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Getting Going', 'Read for 30 minutes in a single day', 'minutes_single', 30, 25, 2, 'daily'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Daily Reader', 'Maintain a 3-day reading streak', 'streak_days', 3, 50, 3, 'weekly'),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'Weekend Warrior', 'Read on both Saturday and Sunday', 'streak_weekend', 2, 75, 4, 'weekly'),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'Halfway There', 'Read for 60 minutes total', 'minutes_total', 60, 100, 5, 'monthly'),
  ('aaaaaaaa-0000-0000-0000-000000000006', 'Week Warrior', 'Maintain a 7-day reading streak', 'streak_days', 7, 150, 6, 'weekly'),
  ('aaaaaaaa-0000-0000-0000-000000000007', 'Bookworm', 'Finish your first full book', 'books_finished', 1, 200, 7, 'monthly'),
  ('aaaaaaaa-0000-0000-0000-000000000008', 'Marathon Reader', 'Read for 300 minutes total', 'minutes_total', 300, 250, 8, 'monthly'),
  ('aaaaaaaa-0000-0000-0000-000000000009', 'Page Turner', 'Finish 3 books', 'books_finished', 3, 400, 9, 'monthly'),
  ('aaaaaaaa-0000-0000-0000-000000000010', 'Literacy Legend', 'Maintain a 30-day reading streak', 'streak_days', 30, 500, 10, 'monthly')
ON CONFLICT (template_id) DO NOTHING;

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
  ('bbbbbbbb-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000010', 0, false),
  ('cccccccc-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000001', 0, false),
  ('cccccccc-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000002', 0, false),
  ('cccccccc-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000003', 0, false),
  ('cccccccc-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000004', 0, false),
  ('cccccccc-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000005', 0, false),
  ('cccccccc-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000006', 0, false),
  ('cccccccc-0000-0000-0000-000000000007', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000007', 0, false),
  ('cccccccc-0000-0000-0000-000000000008', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000008', 0, false),
  ('cccccccc-0000-0000-0000-000000000009', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000009', 0, false),
  ('cccccccc-0000-0000-0000-000000000010', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000010', 0, false)
ON CONFLICT (user_id, template_id) DO NOTHING;

INSERT INTO user_reward_unlocks (user_id, reward_key)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'first_login'),
  ('11111111-1111-1111-1111-111111111111', 'reader_starter'),
  ('33333333-3333-3333-3333-333333333333', 'first_login'),
  ('33333333-3333-3333-3333-333333333333', 'night_reader')
ON CONFLICT (user_id, reward_key) DO NOTHING;

COMMIT;
