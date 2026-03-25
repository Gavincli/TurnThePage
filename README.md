## Turn The Page

Turn The Page is a reading tracker with a React frontend, an Express backend, and a PostgreSQL database. Sprint 2 moves the app from mostly local UI state to a real backend-backed reading flow for books, sessions, stats, and goals.

## Tech Stack

- React
- Vite
- Express
- PostgreSQL

## Project Structure

```text
TurnThePage
|
├── backend/   # Express API routes and database access
├── db/        # SQL migrations and seed data
├── frontend/  # React + Vite app
└── scripts/   # Optional DB helper scripts
```

## Sprint 2 Vertical Slices

Sprint 2 was delivered as 10 vertical slices so each feature could be implemented and tested end-to-end.

1. `Log Reading: minutes/date save`
- The Log Reading page saves a reading session with minutes and session date through the real backend.

2. `Log Reading: pages read save`
- Reading sessions can now optionally record `pagesRead`, and that value is stored in PostgreSQL.

3. `Log Reading: create new backend book`
- Users can create a book from the Log Reading form, including optional total pages.

4. `Log Reading: select existing backend book`
- Users can pick an existing unfinished book from the backend instead of relying on local-only state.

5. `Log Reading: finish book flow`
- A session can mark a selected book as finished, which updates both book history and goal progress.

6. `Home: stats dashboard from backend`
- Home reads real streak, total minutes, and finished-book counts from `/api/stats`.

7. `Home: current books from backend`
- Home reads current unfinished books from `/api/books/current` and shows a clean empty state when none exist.

8. `Goals: render real grouped goals`
- Goals are loaded from the backend and grouped by `daily`, `weekly`, and `monthly` periods.

9. `Goals: refresh after logging`
- After a successful reading session, the frontend refreshes stats, books, and goals so Home and Goals stay in sync.

10. `Log Reading + Goals: completed-goal feedback from backend results`
- The session API returns `newlyCompleted` goals, and the frontend shows success feedback after logging.

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Gavincli/TurnThePage.git
cd TurnThePage
```

### 2. Install dependencies

```bash
npm run install:all
```

This installs root dependencies and frontend dependencies.

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/turn_the_page
PORT=4000
```

Notes:
- Replace `postgres:postgres` with your actual PostgreSQL username/password.
- If you have no password, `DATABASE_URL=postgresql://postgres@localhost:5432/turn_the_page` may work locally.
- The file must be named exactly `.env`.

### 4. Create the database

```bash
psql -U postgres -c "CREATE DATABASE turn_the_page;"
```

Replace `postgres` with your local PostgreSQL username if needed.

### 5. Run the database migrations

You can use either the helper script or run `psql` directly.

Helper script:

```bash
npm run db:migrate
```

Manual `psql` sequence:

```bash
psql "postgresql://postgres:postgres@localhost:5432/turn_the_page" -v ON_ERROR_STOP=1 -f db/migrations/001_initial_schema.sql
psql "postgresql://postgres:postgres@localhost:5432/turn_the_page" -v ON_ERROR_STOP=1 -f db/migrations/002_seed_data.sql
psql "postgresql://postgres:postgres@localhost:5432/turn_the_page" -v ON_ERROR_STOP=1 -f db/migrations/004_books.sql
psql "postgresql://postgres:postgres@localhost:5432/turn_the_page" -v ON_ERROR_STOP=1 -f db/migrations/005_goal_templates_period.sql
psql "postgresql://postgres:postgres@localhost:5432/turn_the_page" -v ON_ERROR_STOP=1 -f db/migrations/006_books_total_pages.sql
psql "postgresql://postgres:postgres@localhost:5432/turn_the_page" -v ON_ERROR_STOP=1 -f db/migrations/007_reading_sessions_pages_read.sql
```

Optional helpers:
- `npm run db:migrate`
- `npm run db:seed`
- `npm run db:reset`

## Run the App

Start the backend:

```bash
npm run backend
```

Start the frontend in a second terminal:

```bash
npm --prefix frontend run dev
```

Default local URLs:
- Frontend: `http://127.0.0.1:5173`
- Backend: `http://localhost:4000`

## API Smoke Checks

Health check:

```bash
curl http://localhost:4000/health
```

Fetch goals for the seeded demo user:

```bash
curl "http://localhost:4000/api/goals?userId=11111111-1111-1111-1111-111111111111"
```

Create a book:

```bash
curl -X POST http://localhost:4000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "11111111-1111-1111-1111-111111111111",
    "title": "Sprint 2 Smoke Book",
    "totalPages": 222
  }'
```

Log a reading session:

```bash
curl -X POST http://localhost:4000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "11111111-1111-1111-1111-111111111111",
    "minutesRead": 15,
    "pagesRead": 8,
    "sessionDate": "2026-03-25"
  }'
```

Fetch current books:

```bash
curl "http://localhost:4000/api/books/current?userId=11111111-1111-1111-1111-111111111111"
```

## Manual Browser Test Flow

Once frontend and backend are both running:

1. Open `http://127.0.0.1:5173/`
- Check that Home shows real stats and a sensible current-books section.

2. Open `http://127.0.0.1:5173/goals`
- Check `Daily`, `Weekly`, and `Monthly` tabs.
- Confirm goals load from the backend.

3. Open `http://127.0.0.1:5173/log-reading`
- Test `Add new book` with minutes, pages, date, title, and total pages.
- Then test `Select existing` and mark the book finished.

4. Return to Home and Goals
- Confirm stats, books, and goal progress refresh after logging.

## Sprint 2 Database Notes

See `sprint2.md` for a focused explanation of the Sprint 2 schema changes and how book/session storage evolved.
  
