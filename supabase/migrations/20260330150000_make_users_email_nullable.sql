-- Make email optional for custom username/password logins.
-- (Keeps existing rows intact; only relaxes NOT NULL constraint.)

ALTER TABLE public.users
  ALTER COLUMN email DROP NOT NULL;

