Sprint 2+ Ideas / UX Notes
==========================

Goals page cleanup
------------------
Ideas:
- Remove "Daily tip" card from Goals page to keep the screen focused on progress and goals only.
- Remove/relocate "Currently reading" card from Goals page (move to Home or Read Now) so Goals stays about achievements, not book navigation.
- Keep Goals page as a calm "dashboard":
  - Show streak, summary stats, and goal cards only.
  - Completed goals at the bottom, with subtle styling (checkmark, soft green background, 100% bar).

Log Reading page design
-----------------------
- Create a dedicated `/log-reading` page to replace the temporary inline form on Goals.
- Fields:
  - Minutes read (required).
  - Optional date (default to today).
  - Optional book selector / text input (for later integration with a books table).
  - Checkbox: "I finished this book".
- On submit:
  - Call POST /api/sessions as we do now.
  - If "I finished this book" is checked:
    - Also update/insert into a future `books` / `books_finished` table.
    - Use that data to drive `books_finished`-type goals (e.g., "Finish 1 book", "Finish 3 books").
  - Show a non-intrusive celebration:
    - Inline "Goal completed" panel with titles and points earned.
    - Confetti or small animation on the Log Reading page only.
  - After success, optional CTA: "View goals" button to navigate back to Goals page.

Books and goals integration
---------------------------
- Future DB work:
  - Add a `books` table with at least: book_id, user_id, title, is_finished, finished_at.
  - When "I finished this book" is checked, mark the book as finished and/or create a finished entry.
- Use finished book count to drive `books_finished` goals:
  - Example templates: "Bookworm" (finish 1 book), "Page Turner" (finish 3 books).
  - Progress query: COUNT(*) of finished books per user.
  - Update `user_goals.progress` and completion based on that count.

Accessibility / read-aloud
--------------------------
- Keep using `ReadAloud` speakers on:
  - Goal titles.
  - Goal descriptions (what the goal means).
  - Primary actions (e.g., "Log Reading" button label).

Home vs Goals layout
--------------------
- Move the following cards off the Goals page and onto the Home/front page:
  - Reading streak
  - Today’s progress
  - This week
  - Daily tip
  - Currently reading
- Goals page should focus purely on structured goals and their progress/completion.
- Home/front page becomes the “overall reading dashboard”; Goals is the “achievements” view.

Why separate Home, Goals, and Log Reading

Home/front page is the overall reading dashboard: streak, today’s progress, this week, daily tip, currently reading, and total minutes/books. Answers “How am I doing as a reader right now?”
Goals page is the achievements view: list of structured goals (title, description, progress, completion), with active vs completed clearly grouped. Answers “What goals do I have and which are done?”
Log Reading page = input + reward flow: log time/pages/date (and “finished this book”), then see “Goal completed + points earned”. Answers “I just read; let me record it and see what I unlocked.”
This separation keeps Goals from becoming too complex and gives each screen one clear job (Home = status, Goals = achievements, Log Reading = input + reward).