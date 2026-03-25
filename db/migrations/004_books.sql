-- Migration 004: Books
BEGIN;

CREATE TABLE IF NOT EXISTS books (
  book_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  is_finished BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_books_user_id
  ON books(user_id);

CREATE INDEX IF NOT EXISTS idx_books_user_finished
  ON books(user_id, is_finished);

CREATE UNIQUE INDEX IF NOT EXISTS idx_books_user_title_ci
  ON books(user_id, LOWER(title));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_reading_sessions_book'
  ) THEN
    ALTER TABLE reading_sessions
      ADD CONSTRAINT fk_reading_sessions_book
      FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE SET NULL;
  END IF;
END $$;

COMMIT;