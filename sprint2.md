# Sprint 2 Database Changes

This document explains how the database changed during Sprint 2 to support the backend-backed book and reading-session flow.

## Summary

Sprint 2 changed the app from a mostly local or partially wired reading flow into a real database-backed flow for:

- storing books per user
- storing optional total pages for a book
- storing optional pages read per session
- linking reading sessions to books
- marking books finished
- calculating stats and goal progress from persisted data

## Migrations Added or Updated

Sprint 2 relies on these migrations:

- `001_initial_schema.sql`
- `002_seed_data.sql`
- `004_books.sql`
- `005_goal_templates_period.sql`
- `006_books_total_pages.sql`
- `007_reading_sessions_pages_read.sql`

### `004_books.sql`

This migration already introduced the `books` table and the relationship between books and reading sessions.

Sprint 2 tightened it by making the foreign-key creation safer:

- `reading_sessions.book_id` points to `books.book_id`
- the FK is created only if it does not already exist
- deleting a book sets `reading_sessions.book_id` to `NULL` instead of deleting reading history

Why this matters:
- book-linked sessions are now a real part of the data model
- rerunning migrations is safer for local setup and shared environments

### `006_books_total_pages.sql`

This migration adds:

- `books.total_pages INTEGER`

Constraint:

- `total_pages` must be `NULL` or greater than `0`

Why this matters:
- users can optionally store the full page count for a book
- the Log Reading page can show both `pages read` and `book pages`
- the API can backfill total pages for an existing title if it was previously missing

### `007_reading_sessions_pages_read.sql`

This migration adds:

- `reading_sessions.pages_read INTEGER`

Constraint:

- `pages_read` must be `NULL` or greater than or equal to `0`

Why this matters:
- each reading session can now track both minutes and pages
- book history can aggregate page totals across many sessions

## Data Model Changes

### Before Sprint 2

The app mainly relied on minutes-based session logging and goal progress. Books were not fully integrated across the frontend, backend, and database flow.

### After Sprint 2

The core model now looks like this:

- `users`
  - own books, sessions, and goals
- `books`
  - belong to a user
  - can store `title`, `total_pages`, `is_finished`, and `finished_at`
- `reading_sessions`
  - belong to a user
  - may point to a book through `book_id`
  - store `minutes_read`, `pages_read`, and `session_date`
- `goal_templates`
  - define the goal rules and periods
- `user_goals`
  - store each user's current progress and completion state

## Backend Behavior Enabled by the Schema

The database changes support these Sprint 2 backend behaviors:

### Book creation and reuse

`POST /api/books` can now:

- create a new book with optional `totalPages`
- reuse an existing case-insensitive title for the same user
- backfill `total_pages` on an existing book when the frontend provides it later

### Current books and history

The backend can now return:

- unfinished books from `/api/books/current`
- full user book lists from `/api/books`
- aggregated history from `/api/books/history`

The history endpoint uses:

- `SUM(minutes_read)` as total reading time
- `SUM(pages_read)` as total pages read
- `MIN(session_date)` as the first reading date
- `MAX(session_date)` or `finished_at` as the end date

### Session logging

`POST /api/sessions` can now:

- store `pagesRead`
- validate that a selected `bookId` belongs to the current user
- mark a book as finished
- recalculate goals from persisted data inside a transaction

## Goal Calculation Impact

Sprint 2 did not just add columns. It also changed which stored data drives progress.

Goal updates now depend on:

- total minutes across all sessions
- best single-day reading total
- finished books from the `books` table
- active streak based on distinct `session_date` values
- weekend streak based on reading dates in the current week

That means the database is now the source of truth for:

- Home stats
- current books
- reading history
- goal progress
- newly completed goal feedback

## Reset and Migration Scripts

To keep local development consistent, Sprint 2 also requires the helper scripts to include the new migrations.

Important scripts:

- `scripts/db-migrate.sh`
- `scripts/db-reset.sh`

Both should apply:

- `006_books_total_pages.sql`
- `007_reading_sessions_pages_read.sql`

Without those, a local reset could leave the app missing the new columns even if the frontend and backend expect them.

## What to Run in a Fresh Environment

For a fresh local database or a hosted PostgreSQL database such as Supabase, run all Sprint 2 migrations in order:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/001_initial_schema.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/002_seed_data.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/004_books.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/005_goal_templates_period.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/006_books_total_pages.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/007_reading_sessions_pages_read.sql
```

## Practical Result

After Sprint 2, the database now supports the full loop:

1. Create or select a book.
2. Log a session with minutes, date, and optional pages.
3. Optionally finish the book.
4. Recalculate stats and goals from persisted data.
5. Show refreshed Home, Goals, and Log Reading views from the backend.
