#!/usr/bin/env bash
set -euo pipefail

if [ ! -f ".env" ]; then
  echo "Missing .env in project root."
  echo "Add DATABASE_URL to .env, then re-run this command."
  exit 1
fi

set -a
source .env
set +a

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set in .env"
  exit 1
fi

legacy_users_id_exists=$(psql "$DATABASE_URL" -tA -c "SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'id'
);")

new_users_user_id_exists=$(psql "$DATABASE_URL" -tA -c "SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'user_id'
);")

if [ "$legacy_users_id_exists" = "t" ] && [ "$new_users_user_id_exists" = "f" ]; then
  echo "Detected older schema in target database (users.id without users.user_id)."
  echo "Either:"
  echo "  1) Point DATABASE_URL to a fresh DB, or"
  echo "  2) Run npm run db:reset to rebuild this DB with current migrations."
  exit 1
fi

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/001_initial_schema.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/002_seed_data.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/004_books.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/005_goal_templates_period.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/006_books_total_pages.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/007_reading_sessions_pages_read.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/008_multi_user_profile_rewards.sql

echo "Migration complete: schema + seed applied."

