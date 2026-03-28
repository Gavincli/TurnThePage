-- Migration 008: Multi-user login identifiers, avatar, reward unlock storage
-- Idempotent for databases created before 001 included these objects.

BEGIN;

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

COMMIT;
