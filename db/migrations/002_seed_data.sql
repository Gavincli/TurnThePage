-- Migration 002: Seed Data
-- Populates the database with a default user and starter goals

BEGIN;

INSERT INTO users (
  user_id,
  username,
  email,
  password_hash,
  created_at,
  last_login_at,
  is_active,
  display_name
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'testuser',
  'test@example.com',
  'dev_hash_placeholder',
  NOW(),
  NOW(),
  true,
  'Test User'
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
  is_completed
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
    false
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Read 20 pages',
    NOW(),
    NULL,
    2,
    0.00,
    false
  ),
  (
    '22222222-2222-2222-2222-222222222223',
    '11111111-1111-1111-1111-111111111111',
    'Finish 1 book',
    NOW(),
    NULL,
    3,
    0.00,
    false
  )
ON CONFLICT (goal_id) DO NOTHING;

COMMIT;
