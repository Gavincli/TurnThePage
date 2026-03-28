-- Migration 002: Consolidated Seed + Goals/Session Enhancements

BEGIN;

-- Profile / rewards DDL before user inserts (002 runs before 008 in full migrate order).
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS selected_avatar VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS user_reward_unlocks (
  user_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  reward_key  VARCHAR(64) NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, reward_key)
);

CREATE INDEX IF NOT EXISTS idx_user_reward_unlocks_user_id ON user_reward_unlocks(user_id);

-- Demo users: bcrypt hash is for password "password" (Laravel-style test vector).
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
VALUES (
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

-- Add running points total (from former 003).
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS points_earned INTEGER NOT NULL DEFAULT 0;

-- Add goal frequency (from former 004).
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS frequency VARCHAR(20) NOT NULL DEFAULT 'daily'
    CHECK (frequency IN ('daily', 'weekly', 'all_time'));

-- Seed default user goals with frequency.
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

-- App-wide achievement definitions (from former 003).
CREATE TABLE IF NOT EXISTS goal_templates (
  template_id     UUID PRIMARY KEY,
  title           VARCHAR(100)  NOT NULL,
  description     VARCHAR(255)  NOT NULL,
  goal_type       VARCHAR(50)   NOT NULL,
  target_value    INTEGER       NOT NULL,
  points_value    INTEGER       NOT NULL,
  display_order   INTEGER       NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goal_templates_display_order ON goal_templates(display_order);

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

-- Source-of-truth reading log table (003 + 004 final shape).
CREATE TABLE IF NOT EXISTS reading_sessions (
  session_id    UUID PRIMARY KEY,
  user_id       UUID    NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  book_id       UUID REFERENCES books(book_id) ON DELETE SET NULL,
  minutes_read  INTEGER NOT NULL CHECK (minutes_read > 0),
  pages_read    INTEGER CHECK (pages_read IS NULL OR pages_read >= 0),
  session_date  DATE    NOT NULL,
  logged_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id      ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_session_date ON reading_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_date    ON reading_sessions(user_id, session_date);

-- Per-user progress tracking for goal templates.
CREATE TABLE IF NOT EXISTS user_goals (
  user_goal_id  UUID PRIMARY KEY,
  user_id       UUID    NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  template_id   UUID    NOT NULL REFERENCES goal_templates(template_id) ON DELETE CASCADE,
  progress      INTEGER NOT NULL DEFAULT 0,
  is_completed  BOOLEAN NOT NULL DEFAULT false,
  completed_at  TIMESTAMP,
  UNIQUE (user_id, template_id)
);

CREATE INDEX IF NOT EXISTS idx_user_goals_user_id     ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_template_id ON user_goals(template_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_completed   ON user_goals(is_completed);

-- Pre-seed all template goals for the default test user.
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

INSERT INTO user_reward_unlocks (user_id, reward_key) VALUES
  ('11111111-1111-1111-1111-111111111111', 'first_login'),
  ('11111111-1111-1111-1111-111111111111', 'reader_starter'),
  ('33333333-3333-3333-3333-333333333333', 'first_login'),
  ('33333333-3333-3333-3333-333333333333', 'night_reader')
ON CONFLICT (user_id, reward_key) DO NOTHING;

COMMIT;
