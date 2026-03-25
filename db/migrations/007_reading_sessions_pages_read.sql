BEGIN;

ALTER TABLE reading_sessions
  ADD COLUMN IF NOT EXISTS pages_read INTEGER
    CHECK (pages_read IS NULL OR pages_read >= 0);

COMMIT;
