Sprint 2+ Ideas / UX Notes
==========================

Goals page cleanup
------------------
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
- Consider a global setting later: "Read aloud goals automatically" for users who rely heavily on audio.

