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

### 5. Run migrations

Apply schema + seed data:

```bash
npm run db:migrate
```

If you get errors about `users.user_id` missing, your `DATABASE_URL` is likely pointing to an older DB schema.
Either switch `DATABASE_URL` to a fresh DB (for example `turn_the_page`) or run:

```bash
npm run db:reset
```

Or run each step individually:

```bash
# Schema + seed
npm run db:migrate

# Seed only
npm run db:seed

# Full reset (drops public schema, recreates, and seeds)
npm run db:reset
```

Migration files live in `db/migrations/` and are safe to re-run (`IF NOT EXISTS` and `ON CONFLICT` guards).

| Script | What it does |
|--------|-------------|
| `npm run db:migrate` | Runs schema and seed migrations |
| `npm run db:seed` | Inserts seed data only |
| `npm run db:reset` | Drops public schema, recreates schema, and seeds |

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
└── scripts/          # DB helper scripts used by npm commands
```

## Tech Stack

- React
- Vite
- JavaScript
- PostgreSQL
