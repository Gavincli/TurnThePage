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

new_users_user_id_exists=$(psql "$DATABASE_URL" -tA -c "SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'user_id'
);")

if [ "$new_users_user_id_exists" = "f" ]; then
  echo "Current schema is missing users.user_id expected by seed migration."
  echo "Run npm run db:reset or point DATABASE_URL to a DB initialized by db:migrate."
  exit 1
fi

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/002_seed_data.sql

echo "Seed complete."
