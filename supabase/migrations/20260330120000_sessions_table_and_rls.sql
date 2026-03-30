-- App writes reading logs to public.sessions (distinct from reading_sessions).
-- RLS for public.goals so the frontend can query per-user rows with the anon key + JWT.

CREATE TABLE IF NOT EXISTS public.sessions (
  session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  book_id uuid REFERENCES public.books(book_id) ON DELETE SET NULL,
  minutes_read integer NOT NULL CHECK (minutes_read > 0),
  pages_read integer CHECK (pages_read IS NULL OR pages_read >= 0),
  session_date date NOT NULL,
  logged_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON public.sessions(user_id, session_date);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sessions_own ON public.sessions;
CREATE POLICY sessions_own ON public.sessions
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS legacy_goals_all_own ON public.goals;
DROP POLICY IF EXISTS goals_own ON public.goals;
CREATE POLICY goals_own ON public.goals
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
