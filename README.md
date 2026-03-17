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
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reading_habit_tracker
PORT=3001
```

Important:
- Replace `postgres:postgres` with your PostgreSQL username/password
- If you have no password, use `DATABASE_URL=postgresql://postgres@localhost:5432/reading_habit_tracker`
- The file must be named exactly `.env` (it is gitignored)

### 4. Create the database

```bash
psql -U postgres -c "CREATE DATABASE reading_habit_tracker;"
```

Replace `postgres` with your PostgreSQL username if different.

### 5. Run migrations

Apply schema + seed data:

```bash
npm run db:migrate
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

## Project Structure

```text
TurnThePage
|
├── db/
│   └── migrations/   # SQL migrations (schema + seed)
├── frontend/         # React + Vite frontend
└── scripts/          # DB helper scripts used by npm commands
```

## Tech Stack

- React
- Vite
- JavaScript
- PostgreSQL
