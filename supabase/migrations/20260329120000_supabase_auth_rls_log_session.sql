-- Supabase Auth: sync public.users + user_goals, RLS, login lookup, atomic log_reading_session RPC.

-- ---------------------------------------------------------------------------
-- users.password_hash: Supabase Auth owns credentials; keep column for legacy rows.
-- ---------------------------------------------------------------------------
ALTER TABLE public.users
  ALTER COLUMN password_hash SET DEFAULT '';

-- ---------------------------------------------------------------------------
-- Streak calculation (matches backend/src/routes/sessions.js logic, server date).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.compute_active_streak(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  d date;
  prev date;
  streak int := 0;
  is_first boolean := true;
  today date := CURRENT_DATE;
  yesterday date := today - 1;
BEGIN
  FOR d IN
    SELECT DISTINCT session_date::date AS sd
    FROM public.reading_sessions
    WHERE user_id = p_user_id
    ORDER BY sd DESC
  LOOP
    IF is_first THEN
      IF d < yesterday THEN
        RETURN 0;
      END IF;
      IF d <> today AND d <> yesterday THEN
        RETURN 0;
      END IF;
      streak := 1;
      prev := d;
      is_first := false;
    ELSE
      IF d = prev - 1 THEN
        streak := streak + 1;
        prev := d;
      ELSE
        EXIT;
      END IF;
    END IF;
  END LOOP;

  RETURN streak;
END;
$$;

-- ---------------------------------------------------------------------------
-- New Auth user → public.users + one row per goal_template in user_goals
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username text;
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
BEGIN
  v_username := coalesce(nullif(trim(meta ->> 'username'), ''), split_part(new.email, '@', 1));

  WHILE exists (
    SELECT 1 FROM public.users u WHERE lower(u.username) = lower(v_username)
  ) LOOP
    v_username := v_username || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  END LOOP;

  INSERT INTO public.users (
    user_id,
    username,
    email,
    password_hash,
    created_at,
    is_active,
    display_name
  )
  VALUES (
    new.id,
    v_username,
    lower(trim(new.email)),
    '',
    now(),
    true,
    coalesce(nullif(trim(meta ->> 'display_name'), ''), v_username)
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_goals (user_goal_id, user_id, template_id, progress, is_completed)
  SELECT gen_random_uuid(), new.id, gt.template_id, 0, false
  FROM public.goal_templates gt
  ON CONFLICT (user_id, template_id) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Pre-auth login: resolve email/username for signInWithPassword
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lookup_login_email(p_login text)
RETURNS TABLE (email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT u.email::text
  FROM public.users u
  WHERE lower(u.username) = lower(trim(p_login))
     OR lower(u.email) = lower(trim(p_login))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.lookup_login_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_login_email(text) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Atomic log session (port of backend/src/routes/sessions.js)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_reading_session(
  p_minutes_read integer,
  p_session_date date DEFAULT NULL,
  p_book_id uuid DEFAULT NULL,
  p_pages_read integer DEFAULT NULL,
  p_finished_book boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  v_session_date date := coalesce(p_session_date, CURRENT_DATE);
  v_started timestamptz := clock_timestamp();
  v_streak int;
  goals_json jsonb;
  newly_json jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF p_minutes_read IS NULL OR p_minutes_read <= 0 THEN
    RAISE EXCEPTION 'minutesRead must be a positive number';
  END IF;

  IF p_finished_book AND p_book_id IS NULL THEN
    RAISE EXCEPTION 'Select or create a book before marking it as finished';
  END IF;

  IF p_book_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.books
      WHERE book_id = p_book_id AND user_id = uid
    ) THEN
      RAISE EXCEPTION 'Selected book was not found for this user. Refresh and try again.';
    END IF;
  END IF;

  INSERT INTO public.reading_sessions (
    session_id,
    user_id,
    book_id,
    minutes_read,
    pages_read,
    session_date
  )
  VALUES (
    gen_random_uuid(),
    uid,
    p_book_id,
    p_minutes_read,
    p_pages_read,
    v_session_date
  );

  IF p_finished_book AND p_book_id IS NOT NULL THEN
    UPDATE public.books
    SET
      is_finished = true,
      finished_at = coalesce(finished_at, v_session_date),
      updated_at = now()
    WHERE book_id = p_book_id;
  END IF;

  UPDATE public.user_goals ug
  SET progress = (
    SELECT coalesce(sum(minutes_read), 0)
    FROM public.reading_sessions
    WHERE user_id = uid
  )
  FROM public.goal_templates gt
  WHERE ug.template_id = gt.template_id
    AND ug.user_id = uid
    AND gt.goal_type = 'minutes_total';

  UPDATE public.user_goals ug
  SET progress = (
    SELECT coalesce(max(daily_total), 0)
    FROM (
      SELECT sum(minutes_read) AS daily_total
      FROM public.reading_sessions
      WHERE user_id = uid
      GROUP BY session_date
    ) daily
  )
  FROM public.goal_templates gt
  WHERE ug.template_id = gt.template_id
    AND ug.user_id = uid
    AND gt.goal_type = 'minutes_single';

  UPDATE public.user_goals ug
  SET progress = (
    SELECT count(*)::integer
    FROM public.books
    WHERE user_id = uid AND is_finished = true
  )
  FROM public.goal_templates gt
  WHERE ug.template_id = gt.template_id
    AND ug.user_id = uid
    AND gt.goal_type = 'books_finished';

  v_streak := public.compute_active_streak(uid);

  UPDATE public.user_goals ug
  SET progress = v_streak
  FROM public.goal_templates gt
  WHERE ug.template_id = gt.template_id
    AND ug.user_id = uid
    AND gt.goal_type = 'streak_days';

  UPDATE public.user_goals ug
  SET progress = (
    SELECT count(distinct extract(dow FROM session_date))::integer
    FROM public.reading_sessions
    WHERE user_id = uid
      AND session_date >= date_trunc('week', current_date)::date
      AND session_date <= current_date
      AND extract(dow FROM session_date) IN (0, 6)
  )
  FROM public.goal_templates gt
  WHERE ug.template_id = gt.template_id
    AND ug.user_id = uid
    AND gt.goal_type = 'streak_weekend';

  UPDATE public.user_goals ug
  SET
    is_completed = true,
    completed_at = coalesce(completed_at, now())
  WHERE ug.user_id = uid
    AND ug.is_completed = false
    AND ug.progress >= (
      SELECT gt2.target_value
      FROM public.goal_templates gt2
      WHERE gt2.template_id = ug.template_id
    );

  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'templateId', gt.template_id,
      'title', gt.title,
      'description', gt.description,
      'period', gt.period,
      'points', gt.points_value,
      'target', gt.target_value,
      'progress', ug.progress,
      'isCompleted', ug.is_completed,
      'completedAt', ug.completed_at,
      'percentComplete', round(
        case
          when gt.target_value > 0 then (ug.progress::numeric / gt.target_value) * 100
          else 0
        end, 1
      )
    ) ORDER BY gt.display_order
  ), '[]'::jsonb)
  INTO goals_json
  FROM public.user_goals ug
  JOIN public.goal_templates gt ON ug.template_id = gt.template_id
  WHERE ug.user_id = uid;

  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'templateId', gt.template_id,
      'title', gt.title,
      'description', gt.description,
      'period', gt.period,
      'points', gt.points_value,
      'target', gt.target_value,
      'progress', ug.progress,
      'isCompleted', ug.is_completed,
      'completedAt', ug.completed_at,
      'percentComplete', round(
        case
          when gt.target_value > 0 then (ug.progress::numeric / gt.target_value) * 100
          else 0
        end, 1
      )
    ) ORDER BY gt.display_order
  ), '[]'::jsonb)
  INTO newly_json
  FROM public.user_goals ug
  JOIN public.goal_templates gt ON ug.template_id = gt.template_id
  WHERE ug.user_id = uid
    AND ug.is_completed = true
    AND ug.completed_at >= v_started;

  RETURN jsonb_build_object(
    'goals', goals_json,
    'newlyCompleted', newly_json
  );
END;
$$;

REVOKE ALL ON FUNCTION public.log_reading_session(integer, date, uuid, integer, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_reading_session(integer, date, uuid, integer, boolean) TO authenticated;

REVOKE ALL ON FUNCTION public.compute_active_streak(uuid) FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reward_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_own ON public.users;
CREATE POLICY users_select_own ON public.users
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own ON public.users
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS books_all_own ON public.books;
CREATE POLICY books_all_own ON public.books
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS sessions_select_own ON public.reading_sessions;
CREATE POLICY sessions_select_own ON public.reading_sessions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS sessions_insert_own ON public.reading_sessions;
CREATE POLICY sessions_insert_own ON public.reading_sessions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS user_goals_select_own ON public.user_goals;
CREATE POLICY user_goals_select_own ON public.user_goals
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS goal_templates_read ON public.goal_templates;
CREATE POLICY goal_templates_read ON public.goal_templates
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS legacy_goals_all_own ON public.goals;
CREATE POLICY legacy_goals_all_own ON public.goals
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS rewards_all_own ON public.user_reward_unlocks;
CREATE POLICY rewards_all_own ON public.user_reward_unlocks
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
