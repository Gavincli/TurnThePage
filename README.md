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

This installs dependencies for root and frontend.

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/turn_the_page
PORT=3001
```

Important:
- Replace `postgres:postgres` with your PostgreSQL username/password
- If you have no password, use `DATABASE_URL=postgresql://postgres@localhost:5432/turn_the_page`
- The file must be named exactly `.env` (it is gitignored)

### 4. Create the database

```bash
psql -U postgres -c "CREATE DATABASE turn_the_page;"
```

Replace `postgres` with your PostgreSQL username if different.

### 5. Run database setup (cross-platform, no scripts required)

Use `psql` directly so setup works the same on macOS, Linux, and Windows.

Run these commands in the project root:

```bash
psql "postgresql://postgres:postgres@localhost:5432/turn_the_page" -v ON_ERROR_STOP=1 -f db/migrations/001_initial_schema.sql
psql "postgresql://postgres:postgres@localhost:5432/turn_the_page" -v ON_ERROR_STOP=1 -f db/migrations/002_seed_data.sql
```

Notes:
- Replace the connection string with your own Postgres username/password/host/port/db name.
- If your password contains special characters, URL-encode them in the connection string.
- `002_seed_data.sql` is the consolidated migration and already includes the goals/sessions/frequency changes.
- Migrations are idempotent (`IF NOT EXISTS` + `ON CONFLICT`) and safe to re-run.

Optional (still available if your shell supports it):
- `npm run db:migrate`
- `npm run db:seed`
- `npm run db:reset`

### 6. Start the frontend

```bash
npm --prefix frontend run dev
```

### 7. Start the backend API

The backend API runs separately from the frontend and exposes goal endpoints.

```bash
npm run backend
```

- Health check (sanity test):

  ```bash
  curl http://localhost:4000/health
  ```

- Fetch goals for the seeded test user:

  ```bash
  curl "http://localhost:4000/api/goals?userId=11111111-1111-1111-1111-111111111111"
  ```

- Log a reading session (no frontend required yet):

  ```bash
  curl -X POST http://localhost:4000/api/sessions \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "11111111-1111-1111-1111-111111111111",
      "minutesRead": 15,
      "sessionDate": "2026-03-18"
    }'
  ```

This endpoint is designed to be testable with curl/Postman first. A future Log Reading page will call it from the frontend.

## Project Structure

```text
TurnThePage
|
├── db/
│   └── migrations/   # SQL migrations (schema + seed)
├── frontend/         # React + Vite frontend
├── backend/          # Express API + Postgres (goals and sessions)
└── scripts/          # Optional DB helper scripts used by npm commands
```

## Tech Stack

- React
- Vite
- JavaScript
- PostgreSQL


User Requirements (EARS Format)
===============================

Ubiquitous Requirements
-----------------------
1. The system shall present the frontend interface content in English.
2. The system shall allow users to view reading goals with a title, description, target, and progress.
3. The system shall keep goal progress data in PostgreSQL and expose it through backend API endpoints.
4. The system shall prevent client-side SQL injection by using parameterized database queries for goal and session operations.

Event-Driven Requirements
-------------------------
5. When the user opens the Goals page, the system shall request and display the user’s goals and current progress.
6. When the user submits a reading session (minutes read and date), the system shall record the session and recalculate progress for relevant goals.
7. When a goal reaches its completion threshold, the system shall mark it as completed and return that completion state to the frontend.
8. When newly completed goals are returned after a session submission, the system shall display completion feedback (message/celebration) to the user.
9. When goals are rendered, the system shall display completed goals after active goals.
10. When a goal is completed and progress exceeds target, the system shall display progress clamped to the goal target (for example, `10/10` rather than `30/10`).
11. When the user activates the read-aloud control for goal text, the system shall use browser speech synthesis to read that text aloud.

State-Driven Requirements
-------------------------
12. While backend goal data is being fetched, the system shall keep the Goals view in a safe loading state without showing stale hardcoded progress.
13. While no goals have been completed, the system shall display zero completed goals in the completion summary.
14. While one or more goals are completed, the system shall show completed-goal counts and completed status consistently across the Goals view.
15. While the dedicated Log Reading page does not exist, the system shall support session logging through the current inline Goals-page flow.
  
