-- Ensure reading_sessions supports authenticated inserts for the current user.

ALTER TABLE IF EXISTS public.reading_sessions
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.reading_sessions
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.users(user_id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS minutes_read integer,
  ADD COLUMN IF NOT EXISTS pages_read integer,
  ADD COLUMN IF NOT EXISTS session_date date,
  ADD COLUMN IF NOT EXISTS book_id uuid REFERENCES public.books(book_id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.reading_sessions
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN minutes_read SET NOT NULL,
  ALTER COLUMN session_date SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'reading_sessions_minutes_read_check'
  ) THEN
    ALTER TABLE public.reading_sessions
      DROP CONSTRAINT reading_sessions_minutes_read_check;
  END IF;
END $$;

ALTER TABLE IF EXISTS public.reading_sessions
  ADD CONSTRAINT reading_sessions_minutes_read_check
  CHECK (minutes_read > 0);

DROP POLICY IF EXISTS sessions_insert_own ON public.reading_sessions;
CREATE POLICY sessions_insert_own ON public.reading_sessions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
