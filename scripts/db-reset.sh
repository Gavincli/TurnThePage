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

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/001_initial_schema.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/002_seed_data.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/004_books.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/005_goal_templates_period.sql

echo "Reset complete: schema dropped, recreated, and seeded."
