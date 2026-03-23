-- Migration 001: Initial Schema
-- Creates all tables and indexes for Turn the Page

BEGIN;

CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  last_login_at TIMESTAMP,
  is_active BOOLEAN NOT NULL,
  display_name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS goals (
  goal_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  goal_title VARCHAR(255) NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_finished TIMESTAMP,
  priority_order INTEGER NOT NULL,
  percent_complete DECIMAL(5,2) NOT NULL,
  is_completed BOOLEAN NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_priority_order ON goals(priority_order);
CREATE INDEX IF NOT EXISTS idx_goals_is_completed ON goals(is_completed);

CREATE TABLE IF NOT EXISTS books (
  book_id      UUID PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  is_finished  BOOLEAN NOT NULL DEFAULT false,
  finished_at  TIMESTAMP,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_books_user_id     ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_is_finished ON books(is_finished);

COMMIT;