-- OKR: percentage of users who have completed 3 or more goals
--
-- Per user, completed goals are counted the same way as frontend loadGoals
-- (AppContext): if the user has any row in public.goals, count completed rows
-- there; otherwise count completed rows in public.user_goals.
--
-- Run manually in Supabase SQL Editor or psql (not applied by db-migrate).
-- Requires SELECT on public.users, public.user_goals, and public.goals (use a
-- service role or dashboard; RLS blocks anon from seeing other users' rows).

WITH per_user_completed AS (
  SELECT
    u.user_id,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM public.goals g
        WHERE g.user_id = u.user_id
      ) THEN (
        SELECT COUNT(*)::bigint
        FROM public.goals g2
        WHERE g2.user_id = u.user_id
          AND g2.is_completed = true
      )
      ELSE (
        SELECT COUNT(*)::bigint
        FROM public.user_goals ug
        WHERE ug.user_id = u.user_id
          AND ug.is_completed = true
      )
    END AS completed_goal_count
  FROM public.users u
)
SELECT
  COUNT(*) AS total_users,
  COUNT(*) FILTER (WHERE completed_goal_count >= 3) AS users_with_three_or_more_completed,
  ROUND(
    100.0
    * COUNT(*) FILTER (WHERE completed_goal_count >= 3)
    / NULLIF(COUNT(*), 0),
    2
  ) AS pct_users_with_three_or_more_goals_completed
FROM per_user_completed;
