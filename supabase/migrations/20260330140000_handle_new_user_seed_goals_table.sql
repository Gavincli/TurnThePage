-- New signups: also seed public.goals (legacy table) so the Goals page has rows.
-- Existing handle_new_user already fills user_goals; this adds the same three starter goals as the seed data.

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

  INSERT INTO public.goals (
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
    (gen_random_uuid(), new.id, 'Read 10 minutes', now(), null, 1, 0, false, 'daily'),
    (gen_random_uuid(), new.id, 'Read 20 pages', now(), null, 2, 0, false, 'daily'),
    (gen_random_uuid(), new.id, 'Finish 1 book', now(), null, 3, 0, false, 'all_time');

  RETURN new;
END;
$$;
