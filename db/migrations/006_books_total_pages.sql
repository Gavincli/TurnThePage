BEGIN;

ALTER TABLE books
  ADD COLUMN IF NOT EXISTS total_pages INTEGER
    CHECK (total_pages IS NULL OR total_pages > 0);

COMMIT;
